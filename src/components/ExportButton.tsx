"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, Table, Code } from "lucide-react"
import { ExportService, type ExportOptions } from "@/src/utils/export"

interface ExportButtonProps {
  data: any
  type: "assessment" | "protocol" | "session" | "audit"
  filename?: string
  className?: string
}

export function ExportButton({ data, type, filename, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: "pdf" | "csv" | "json") => {
    setIsExporting(true)
    try {
      const options: ExportOptions = {
        format,
        includeTimestamps: true,
        includeAuditTrail: type === "assessment",
      }

      let blob: Blob
      let defaultFilename: string

      switch (type) {
        case "assessment":
          blob = await ExportService.exportAssessment(data, options)
          defaultFilename = `assessment-${data.id || "export"}.${format}`
          break
        case "protocol":
          blob = await ExportService.exportProtocol(data, options)
          defaultFilename = `protocol-${data.id || "export"}.${format}`
          break
        case "session":
          blob = await ExportService.exportSessionData(data.id, options)
          defaultFilename = `session-${data.id || "export"}.${format}`
          break
        case "audit":
          blob = await ExportService.exportAuditLogs(data.dateRange, options)
          defaultFilename = `audit-logs-${new Date().toISOString().split("T")[0]}.${format}`
          break
        default:
          throw new Error(`Unsupported export type: ${type}`)
      }

      ExportService.downloadBlob(blob, filename || defaultFilename)
    } catch (error) {
      console.error("Export failed:", error)
      // In a real app, show error toast
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <Table className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <Code className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
