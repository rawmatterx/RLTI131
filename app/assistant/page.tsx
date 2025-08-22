"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Paperclip, AlertTriangle, Clock, Bot, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePatientStore, useSessionStore } from "@/src/store"
import { ragAssistant } from "@/src/modules/rag/api"
import { SessionTimeline } from "@/src/components/assistant/SessionTimeline"
import { ChatMessage } from "@/src/components/assistant/ChatMessage"
import { ContextPanel } from "@/src/components/assistant/ContextPanel"
import { CitationDrawer } from "@/src/components/assistant/CitationDrawer"
import { useSearchParams } from "next/navigation"

export default function AssistantPage() {
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
  const searchParams = useSearchParams()

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

      // One-shot completion with real citations; UI still shows a thinking spinner while waiting
      const res = await ragAssistant.completeOnce({
        messages: [
          ...chatMessages,
          { id: crypto.randomUUID(), role: "user", content: contentToSend, timestamp: new Date() },
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
      const res = await ragAssistant.generateRecommendations({
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
    const prefill = searchParams?.get('prefill') || ''
    const autosend = searchParams?.get('autosend') === '1'
    if (prefill) {
      setMessage(prefill)
      if (autosend) {
        setTimeout(() => handleSendMessage(prefill), 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-primary">AI Assistant</h1>
                <p className="text-sm text-muted-foreground">Clinical Knowledge Support</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                Advisory Only
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setDisclaimerVisible(!disclaimerVisible)}>
                <AlertTriangle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      {disclaimerVisible && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Bot className="h-4 w-4" /> Gemma‑3‑27B‑IT (free) via OpenRouter
                </span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${health?.available ? "bg-green-500" : "bg-red-500"}`} />
                  {healthLoading ? (
                    <span>Checking model…</span>
                  ) : (
                    <span>
                      {health?.available ? "Online" : "Offline"}
                      {typeof health?.latencyMs === "number" ? ` · ${health?.latencyMs} ms` : ""}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => clearSession()}>
                  New Chat
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => checkHealth()}>
                  {healthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
                <Button variant="outline" size="sm" asChild className="bg-transparent">
                  <Link href="/todos">Todos</Link>
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => insertQuickText("Summarize current patient context and key preparation steps.")}>Quick Insert</Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDisclaimerVisible(false)}
                className="text-yellow-600 hover:text-yellow-700"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Sidebar - Session Timeline */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Timeline
                </CardTitle>
                <CardDescription>Recent activity and events</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <SessionTimeline events={timeline} />
              </CardContent>
            </Card>
          </div>

          {/* Center - Chat Interface */}
          <div className="lg:col-span-6">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Clinical Assistant
                </CardTitle>
                <CardDescription>Ask questions about I-131 therapy protocols and guidelines</CardDescription>
              </CardHeader>

              {/* Chat Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-6">
                  <div className="space-y-4 py-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-12">
                        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Welcome to the Clinical Assistant</h3>
                        <p className="text-muted-foreground mb-4">
                          I can help you with I-131 therapy protocols, patient preparation, safety guidelines, and more.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertQuickText("What are the contraindications for I-131 therapy?")}
                            className="bg-transparent"
                          >
                            Contraindications
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertQuickText("Explain the low-iodine diet preparation protocol.")}
                            className="bg-transparent"
                          >
                            Diet Protocol
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertQuickText("What are the radiation safety requirements?")}
                            className="bg-transparent"
                          >
                            Safety Guidelines
                          </Button>
                        </div>
                      </div>
                    )}

                    {chatMessages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} onCitationClick={() => handleCitationClick(msg.id)} />
                    ))}

                    {isStreaming && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Bot className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">Assistant</span>
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-100" />
                              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-200" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">Thinking...</p>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about I-131 therapy protocols, safety guidelines, patient preparation..."
                      className="min-h-[60px] resize-none"
                      disabled={isStreaming}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleGenerateRecommendations}
                      disabled={isStreaming}
                      className="bg-accent hover:bg-accent/90"
                    >
                      Recommend
                    </Button>
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!message.trim() || isStreaming}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Context Panel */}
          <div className="lg:col-span-3">
            <ContextPanel patientData={currentAssessment} ruleResults={ruleResults} onInsertText={insertQuickText} />
          </div>
        </div>
      </div>

      {/* Citation Drawer */}
      <CitationDrawer citations={selectedCitations} isOpen={showCitations} onClose={() => setShowCitations(false)} />
    </div>
  )
}
