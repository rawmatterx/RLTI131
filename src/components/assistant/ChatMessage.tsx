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
          <div className="flex flex-wrap gap-1">
            {message.citations.map((citation) => (
              <a
                key={citation.id}
                href={citation.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-6 px-2 text-xs inline-flex items-center rounded-md border bg-background hover:bg-accent/10"
                onClick={(e) => {
                  if (!citation.url) {
                    e.preventDefault()
                    onCitationClick()
                  }
                }}
              >
                [{Number(citation.id) || 1}] {citation.source}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`p-2 rounded-lg flex-shrink-0 ${isUser ? "bg-primary/10" : "bg-accent/10"}`}>
        {isUser ? (
          <User className={`h-4 w-4 ${isUser ? "text-primary" : "text-accent"}`} />
        ) : (
          <Bot className={`h-4 w-4 ${isUser ? "text-primary" : "text-accent"}`} />
        )}
      </div>
      <div className={`flex-1 ${isUser ? "text-right" : ""}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">{isUser ? "You" : "Assistant"}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
        <div
          className={`${
            isUser ? "bg-primary text-primary-foreground p-3 rounded-lg inline-block max-w-[80%]" : "text-foreground"
          }`}
        >
          {isUser ? <p className="text-sm">{message.content}</p> : renderContentWithCitations(message.content)}
        </div>
      </div>
    </div>
  )
}
