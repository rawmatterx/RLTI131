"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, Activity, AlertTriangle, Download } from "lucide-react"
import type { SessionEvent } from "@/src/types"
import { formatDistanceToNow } from "date-fns"

interface SessionTimelineProps {
  events: SessionEvent[]
}

export function SessionTimeline({ events }: SessionTimelineProps) {
  const getEventIcon = (type: SessionEvent["type"]) => {
    switch (type) {
      case "data_collected":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "rules_run":
        return <Activity className="h-4 w-4 text-green-600" />
      case "note_added":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "export_generated":
        return <Download className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getEventColor = (type: SessionEvent["type"]) => {
    switch (type) {
      case "data_collected":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "rules_run":
        return "bg-green-100 text-green-800 border-green-200"
      case "note_added":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "export_generated":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (events.length === 0) {
    return (
      <div className="p-6 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No session events yet</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {events
          .slice()
          .reverse()
          .map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <div className="p-1.5 bg-muted rounded-lg flex-shrink-0 mt-0.5">{getEventIcon(event.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-xs ${getEventColor(event.type)}`}>
                    {event.type.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-foreground mb-1">{event.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </p>
                {event.data && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(event.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  )
}
