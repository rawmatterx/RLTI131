"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Activity, FileText, Plus, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { Assessment, RuleResult } from "@/src/types"

interface ContextPanelProps {
  patientData: Partial<Assessment>
  ruleResults: RuleResult[]
  onInsertText: (text: string) => void
}

export function ContextPanel({ patientData, ruleResults, onInsertText }: ContextPanelProps) {
  const quickInserts = [
    {
      title: "Pre-therapy Preparation",
      text: "Please explain the pre-therapy preparation protocol for I-131 therapy, including thyroid hormone withdrawal and low-iodine diet requirements.",
    },
    {
      title: "Radiation Safety Instructions",
      text: "What are the radiation safety instructions for patients receiving I-131 therapy, including isolation periods and precautions?",
    },
    {
      title: "Dosing Guidelines",
      text: "What are the current dosing guidelines for I-131 therapy in differentiated thyroid cancer patients?",
    },
    {
      title: "Contraindications Review",
      text: "Review the absolute and relative contraindications for I-131 therapy.",
    },
    {
      title: "Post-therapy Monitoring",
      text: "What monitoring is required after I-131 therapy administration?",
    },
  ]

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "PASS":
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case "WARN":
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />
      case "FAIL":
        return <XCircle className="h-3 w-3 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Patient Context */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Context
          </CardTitle>
          <CardDescription>Current assessment data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {patientData.patient?.name && (
            <div>
              <span className="text-sm font-medium">Patient:</span>
              <p className="text-sm text-muted-foreground">{patientData.patient.name}</p>
            </div>
          )}

          {patientData.clinical?.diagnosis && (
            <div>
              <span className="text-sm font-medium">Diagnosis:</span>
              <p className="text-sm text-muted-foreground">{patientData.clinical.diagnosis}</p>
            </div>
          )}

          {patientData.labs?.TSH && (
            <div>
              <span className="text-sm font-medium">TSH:</span>
              <p className="text-sm text-muted-foreground">
                {patientData.labs.TSH.value} {patientData.labs.TSH.unit}
              </p>
            </div>
          )}

          {patientData.contraindications && patientData.contraindications.length > 0 && (
            <div>
              <span className="text-sm font-medium">Contraindications:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {patientData.contraindications.map((contraindication) => (
                  <Badge key={contraindication} variant="outline" className="text-xs">
                    {contraindication.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
            onClick={() => onInsertText("Please review my current patient data and provide recommendations.")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Message
          </Button>
        </CardContent>
      </Card>

      {/* Rule Results */}
      {ruleResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Rule Results
            </CardTitle>
            <CardDescription>Recent eligibility evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {ruleResults.map((result) => (
                  <div key={result.id} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                    {getSeverityIcon(result.severity)}
                    <span className="flex-1">{result.title}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 bg-transparent"
              onClick={() =>
                onInsertText("Please explain the current rule evaluation results and their clinical implications.")
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Discuss Results
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Inserts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Inserts
          </CardTitle>
          <CardDescription>Common clinical questions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {quickInserts.map((insert, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3 bg-transparent"
                  onClick={() => onInsertText(insert.text)}
                >
                  <div>
                    <div className="font-medium text-sm mb-1">{insert.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{insert.text.substring(0, 80)}...</div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
