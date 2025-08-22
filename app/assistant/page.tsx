"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Paperclip, AlertTriangle, Bot, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePatientStore, useSessionStore } from "@/src/store"
import { ragAssistant } from "@/src/modules/rag/api"
// import { SessionTimeline } from "@/src/components/assistant/SessionTimeline" // removed sidebar
import { ChatMessage } from "@/src/components/assistant/ChatMessage"
// import { ContextPanel } from "@/src/components/assistant/ContextPanel" // removed sidebar
import { CitationDrawer } from "@/src/components/assistant/CitationDrawer"

function AssistantPageInner() {
  const [message, setMessage] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [showCitations, setShowCitations] = useState(false)
  const [selectedCitations, setSelectedCitations] = useState<any[]>([])
  const [disclaimerVisible, setDisclaimerVisible] = useState(true)
  const [health, setHealth] = useState<{ ok: boolean; model: string; available: boolean; latencyMs: number | null; error?: string } | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { currentAssessment } = usePatientStore()
  const { chatMessages, addChatMessage, timeline, ruleResults, clearSession } = useSessionStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const checkHealth = async () => {
    try {
      setHealthLoading(true)
      const res = await fetch("/api/assistant/health", { cache: "no-store" })
      const json = await res.json()
      setHealth(json)
    } catch (e) {
      setHealth({ ok: false, model: "unknown", available: false, latencyMs: null, error: (e as any)?.message })
    } finally {
      setHealthLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSendMessage = async (override?: string) => {
    const contentToSend = (override ?? message).trim()
    if (!contentToSend || isStreaming) return
    if (!override) setMessage("")

    // Add user message
    addChatMessage({
      role: "user",
      content: contentToSend,
    })

    setIsStreaming(true)

    try {
      // Prepare context for RAG assistant
      const context = {
        patientData: currentAssessment,
        ruleResults: ruleResults,
        recentEvents: timeline.slice(-5), // Last 5 events
      }

      const formattingHint = [
        "Format clearly:",
        "- Use short headings where helpful",
        "- Present concise bullet points",
        "- Keep bullets under ~20 words",
        "- Include inline numeric citations like [1], [2]",
        "- End with a brief 'Next steps' list",
      ].join("\n")
      const finalUserContent = `${contentToSend}\n\n${formattingHint}`

      // One-shot completion with real citations; UI still shows a thinking spinner while waiting
      const res = await ragAssistant.completeOnce({
        messages: [
          ...chatMessages,
          { id: crypto.randomUUID(), role: "user", content: finalUserContent, timestamp: new Date() },
        ],
        patientContext: context.patientData,
        ruleOutcomes: context.ruleResults,
      })

      addChatMessage({
        role: "assistant",
        content: res.content,
        citations: res.citations,
      })
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      addChatMessage({
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleGenerateRecommendations = async () => {
    if (isStreaming) return
    setIsStreaming(true)
    try {
      const context = {
        patientData: currentAssessment,
        ruleResults: ruleResults,
        recentEvents: timeline.slice(-5),
      }
      const prompt = [
        "Generate clinical recommendations based on current patient context and rule outcomes.",
        "Format as concise bullet points with brief headings and inline numeric citations [1], [2] where applicable.",
        "Conclude with a short 'Next steps' list.",
      ].join("\n")
      const res = await ragAssistant.completeOnce({
        messages: [
          { id: crypto.randomUUID(), role: "user", content: prompt, timestamp: new Date() },
        ],
        patientContext: context.patientData,
        ruleOutcomes: context.ruleResults,
      })
      addChatMessage({
        role: "assistant",
        content: res.content,
        citations: res.citations,
      })
    } catch (error) {
      console.error("[v0] Error generating recommendations:", error)
      addChatMessage({
        role: "assistant",
        content: "I couldn't generate recommendations right now. Please try again.",
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleCitationClick = (messageId: string) => {
    const msg = chatMessages.find((m) => m.id === messageId)
    if (msg?.citations && msg.citations.length > 0) {
      setSelectedCitations(msg.citations)
      setShowCitations(true)
    }
  }

  const insertQuickText = (text: string) => {
    setMessage((prev) => prev + (prev ? "\n\n" : "") + text)
  }

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const prefill = params.get('prefill') || ''
      const autosend = params.get('autosend') === '1'
      if (prefill) {
        setMessage(prefill)
        if (autosend) setTimeout(() => handleSendMessage(prefill), 0)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b border-glass-border sticky top-0 z-50 bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-accent/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Bot className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">AI Assistant</h1>
                  <p className="text-muted-foreground font-medium">Clinical Knowledge Support</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="status-info border-2 px-4 py-2 font-semibold">
                Advisory Only
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setDisclaimerVisible(!disclaimerVisible)} className="hover:bg-accent/10">
                <AlertTriangle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      {disclaimerVisible && (
        <div className="border-b border-glass-border px-6 py-4 bg-card">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full">
                  <Bot className="h-4 w-4 text-accent" />
                  <span className="font-medium text-accent">Gemma‑3‑27B‑IT via OpenRouter</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-card rounded-full">
                  <span className={`h-2 w-2 rounded-full ${health?.available ? "bg-clinical-success animate-pulse" : "bg-clinical-error"}`} />
                  <span className="font-medium text-muted-foreground">
                    {healthLoading ? "Checking..." : health?.available ? "Online" : "Offline"}
                    {typeof health?.latencyMs === "number" ? ` · ${health?.latencyMs}ms` : ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="bg-card border-border hover:bg-card" onClick={() => clearSession()}>
                  New Chat
                </Button>
                <Button variant="outline" size="sm" className="bg-card border-border hover:bg-card" onClick={() => checkHealth()}>
                  {healthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
                <Button variant="outline" size="sm" asChild className="bg-card border-border hover:bg-card">
                  <Link href="/todos">Todos</Link>
                </Button>
                <Button variant="outline" size="sm" className="bg-card border-border hover:bg-card" onClick={() => insertQuickText("Summarize current patient context and key preparation steps.")}>
                  Quick Insert
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDisclaimerVisible(false)}
                  className="text-clinical-warning hover:text-clinical-warning/80"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="mx-auto max-w-3xl">
          {/* Chat Interface */}
          <div>
            <Card className="h-full flex flex-col border-2 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg animate-pulse-glow">
                    <Bot className="h-5 w-5 text-accent" />
                  </div>
                  Clinical Assistant
                </CardTitle>
                <CardDescription className="text-base">Ask questions about I-131 therapy protocols and guidelines</CardDescription>
              </CardHeader>

              {/* Chat Messages */}
              <CardContent className="flex-1 p-0 bg-card">
                <ScrollArea className="h-full px-6 py-2">
                  <div className="space-y-6 py-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-16">
                        <div className="p-6 bg-accent/10 rounded-3xl w-fit mx-auto mb-6 animate-float">
                          <Bot className="h-16 w-16 text-accent" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">Welcome to the Clinical Assistant</h3>
                        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                          I can help you with I-131 therapy protocols, patient preparation, safety guidelines, and more.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => insertQuickText("What are the contraindications for I-131 therapy?")}
                            className="bg-card border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
                          >
                            Contraindications
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => insertQuickText("Explain the low-iodine diet preparation protocol.")}
                            className="bg-card border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
                          >
                            Diet Protocol
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => insertQuickText("What are the radiation safety requirements?")}
                            className="bg-card border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
                          >
                            Safety Guidelines
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => insertQuickText("Summarize the current assessment and key findings as concise bullet points with citations.")} className="bg-card border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300">Summarize Assessment</Button>
                          <Button variant="secondary" size="sm" onClick={() => insertQuickText("Provide ATA-based risk stratification and brief rationale with citations.")} className="bg-card border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300">ATA Risk & Rationale</Button>
                          <Button variant="secondary" size="sm" onClick={() => insertQuickText("Recommend preparation pathway (withdrawal vs rhTSH) with brief reasons and references.")} className="bg-card border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300">Prep Pathway</Button>
                          <Button variant="secondary" size="sm" onClick={() => insertQuickText("List discharge counseling points for the patient in concise bullet points with citations.")} className="bg-card border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300">Discharge Points</Button>
                          <Button variant="secondary" size="sm" onClick={() => insertQuickText("Outline follow-up plan and monitoring schedule as bullet points with references.")} className="bg-card border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300">Follow‑up Plan</Button>
                        </div>
                      </div>
                    )}

                    {chatMessages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} onCitationClick={() => handleCitationClick(msg.id)} />
                    ))}

                    {isStreaming && (
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-accent/10 rounded-xl animate-pulse">
                          <Bot className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-semibold text-base">Assistant</span>
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
                              <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse delay-100" />
                              <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse delay-200" />
                            </div>
                          </div>
                          <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                            <p className="text-base text-accent font-medium">Analyzing your request...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-border p-6 bg-card">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about I-131 therapy protocols, safety guidelines, patient preparation..."
                      className="min-h-[80px] resize-none border-2 focus:border-accent/50 transition-colors duration-300"
                      disabled={isStreaming}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" size="lg" className="bg-background border-2 hover:bg-accent/5">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleGenerateRecommendations}
                      disabled={isStreaming}
                      size="lg"
                      className="bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Recommend
                    </Button>
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!message.trim() || isStreaming}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Citation Drawer */}
      <CitationDrawer citations={selectedCitations} isOpen={showCitations} onClose={() => setShowCitations(false)} />
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function AssistantPage() {
  return (
    <Suspense fallback={<div />}> 
      <AssistantPageInner />
    </Suspense>
  )
}
