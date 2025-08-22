"use client"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, ExternalLink, Quote } from "lucide-react"
import type { Citation } from "@/src/types"

interface CitationDrawerProps {
  citations: Citation[]
  isOpen: boolean
  onClose: () => void
}

export function CitationDrawer({ citations, isOpen, onClose }: CitationDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Quote className="h-5 w-5 text-accent" />
              </div>
              <div>
                <DrawerTitle className="text-lg">Citations & References</DrawerTitle>
                <DrawerDescription>Source materials and evidence</DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {citations.length === 0 ? (
              <div className="text-center py-8">
                <Quote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No citations available for this message.</p>
              </div>
            ) : (
              citations.map((citation) => (
                <div key={citation.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      [{Number(citation.id) || 1}]
                    </Badge>
                    <h3 className="font-semibold text-foreground">{citation.source}</h3>
                  </div>

                  {citation.quote && (
                    <div className="p-4 bg-muted rounded-lg border-l-4 border-accent">
                      <blockquote className="text-foreground italic">"{citation.quote}"</blockquote>
                    </div>
                  )}

                  {citation.metadata && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-foreground">Source Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(citation.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="ml-2 text-foreground">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {citation.url ? (
                    <Button variant="outline" size="sm" className="bg-transparent" asChild>
                      <a href={citation.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Source
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="bg-transparent" disabled>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Source
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t border-border">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Citations are provided for reference only. Always verify information with
              current clinical guidelines and use professional judgment.
            </p>
          </div>
          <DrawerClose asChild>
            <Button variant="outline" className="bg-transparent">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
