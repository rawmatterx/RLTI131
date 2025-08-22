"use client"
import { Button } from "@/components/ui/button"
import { User, Bot } from "lucide-react"
import type { ChatMessage as ChatMessageType } from "@/src/types"
import { formatDistanceToNow } from "date-fns"

interface ChatMessageProps {
  message: ChatMessageType
  onCitationClick: () => void
}

export function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
  const isUser = message.role === "user"

  // Parse citations from content (simple implementation)
  const renderContentWithCitations = (content: string) => {
    // Render as organized sections if content seems markdown-like
    const hasHeadings = /^\s*#+\s/m.test(content)
    if (!message.citations || message.citations.length === 0) {
      return <div className={`prose ${hasHeadings ? 'prose-headings:mt-3 prose-p:my-2' : ''} prose-sm max-w-none`}>{content}</div>
    }

    // Simple citation parsing - in production, this would be more sophisticated
    let processedContent = content
    message.citations.forEach((citation) => {
      const citationNumber = Number(citation.id) || 0
      const url = citation.url || "#"
      if (citationNumber > 0) {
        processedContent = processedContent.replace(
          new RegExp(`\\[${citationNumber}\\]`, "g"),
          `<a class="citation-link underline underline-offset-2" data-citation="${citationNumber}" href="${url}" target="_blank" rel="noopener noreferrer">[${citationNumber}]</a>`,
        )
      }
    })

    return (
      <div className="space-y-3">
        <div
          className={`prose ${hasHeadings ? 'prose-headings:mt-3 prose-p:my-2' : ''} prose-sm max-w-none`}
          dangerouslySetInnerHTML={{ __html: processedContent }}
          onClick={(e) => {
            const target = e.target as HTMLElement
            if (target.classList.contains("citation-link")) {
              onCitationClick()
            }
          }}
        />
        {message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {message.citations.map((citation) => (
              <a
                key={citation.id}
                href={citation.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm inline-flex items-center rounded-lg border-2 bg-background hover:bg-accent/10 hover:border-accent/30 transition-all duration-300 font-medium"
                onClick={(e) => {
                  if (!citation.url) {
                    e.preventDefault()
                    onCitationClick()
                  }
                }}
              >
                <span className="text-accent font-bold">[{Number(citation.id) || 1}]</span>
                <span className="ml-2">{citation.source}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`p-3 rounded-xl flex-shrink-0 shadow-md ${isUser ? "bg-primary/10 border border-primary/20" : "bg-accent/10 border border-accent/20"}`}>
        {isUser ? (
          <User className={`h-5 w-5 ${isUser ? "text-primary" : "text-accent"}`} />
        ) : (
          <Bot className={`h-5 w-5 ${isUser ? "text-primary" : "text-accent"}`} />
        )}
      </div>
      <div className={`flex-1 ${isUser ? "text-right" : ""}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="font-semibold text-base">{isUser ? "You" : "Assistant"}</span>
          <span className="text-sm text-muted-foreground font-medium">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
        <div
          className={`${
            isUser 
              ? "bg-primary text-primary-foreground p-4 rounded-2xl inline-block max-w-[85%] shadow-lg" 
              : "text-foreground p-4 bg-card rounded-2xl border-2 border-border/50 shadow-sm"
          }`}
        >
          {isUser ? (
            <p className="text-base leading-relaxed">{message.content}</p>
          ) : (
            <div className="space-y-3">
              {renderContentWithCitations(message.content)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
