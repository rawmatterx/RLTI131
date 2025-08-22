"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"
import type { RuleResult } from "@/src/types"

interface RuleResultsPanelProps {
  results: RuleResult[]
  onExplain: (ruleId: string) => void
}

export function RuleResultsPanel({ results, onExplain }: RuleResultsPanelProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "FAIL":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "PASS":
        return "bg-green-100 text-green-800 border-green-200"
      case "WARN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "FAIL":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const passCount = results.filter((r) => r.severity === "PASS").length
  const warnCount = results.filter((r) => r.severity === "WARN").length
  const failCount = results.filter((r) => r.severity === "FAIL").length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Rule Evaluation Results
          <div className="flex gap-2">
            {passCount > 0 && <Badge className="bg-green-100 text-green-800">{passCount} PASS</Badge>}
            {warnCount > 0 && <Badge className="bg-yellow-100 text-yellow-800">{warnCount} WARN</Badge>}
            {failCount > 0 && <Badge className="bg-red-100 text-red-800">{failCount} FAIL</Badge>}
          </div>
        </CardTitle>
        <CardDescription>Eligibility assessment based on current patient data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className={`p-4 rounded-lg border ${getSeverityColor(result.severity)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getSeverityIcon(result.severity)}
                <span className="font-medium">{result.title}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onExplain(result.id)} className="h-6 px-2 text-xs">
                Why?
              </Button>
            </div>
            <p className="text-sm mb-2">{result.rationale}</p>
            {result.inputsUsed.length > 0 && (
              <div className="text-xs">
                <span className="font-medium">Based on: </span>
                {result.inputsUsed.join(", ")}
              </div>
            )}
            {result.references && result.references.length > 0 && (
              <div className="text-xs mt-1">
                <span className="font-medium">References: </span>
                {result.references.join(", ")}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
