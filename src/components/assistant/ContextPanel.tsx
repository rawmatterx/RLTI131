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
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            Patient Context
          </CardTitle>
          <CardDescription className="text-base">Current assessment data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {patientData.patient?.name && (
            <div className="p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-semibold text-primary">Patient:</span>
              <p className="text-base text-foreground font-medium">{patientData.patient.name}</p>
            </div>
          )}

          {patientData.clinical?.diagnosis && (
            <div className="p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-semibold text-primary">Diagnosis:</span>
              <p className="text-base text-foreground">{patientData.clinical.diagnosis}</p>
            </div>
          )}

          {patientData.labs?.TSH && (
            <div className="p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-semibold text-primary">TSH:</span>
              <p className="text-base text-foreground font-medium">
                {patientData.labs.TSH.value} {patientData.labs.TSH.unit}
              </p>
            </div>
          )}

          {patientData.contraindications && patientData.contraindications.length > 0 && (
            <div className="p-3 bg-clinical-error/5 rounded-lg border border-clinical-error/20">
              <span className="text-sm font-semibold text-clinical-error">Contraindications:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {patientData.contraindications.map((contraindication) => (
                  <Badge key={contraindication} className="status-error text-xs font-medium">
                    {contraindication.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => onInsertText("Please review my current patient data and provide recommendations.")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add to Message
          </Button>
        </CardContent>
      </Card>

      {/* Rule Results */}
      {ruleResults.length > 0 && (
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-2 bg-clinical-success/10 rounded-lg">
                <Activity className="h-5 w-5 text-clinical-success" />
              </div>
              Rule Results
            </CardTitle>
            <CardDescription className="text-base">Recent eligibility evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-3">
                {ruleResults.map((result) => (
                  <div key={result.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg border border-border/50">
                    {getSeverityIcon(result.severity)}
                    <span className="flex-1 text-sm font-medium">{result.title}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button
              size="lg"
              className="w-full mt-4 bg-clinical-success hover:bg-clinical-success/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() =>
                onInsertText("Please explain the current rule evaluation results and their clinical implications.")
              }
            >
              <Plus className="h-5 w-5 mr-2" />
              Discuss Results
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Inserts */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="p-2 bg-clinical-info/10 rounded-lg">
              <FileText className="h-5 w-5 text-clinical-info" />
            </div>
            Quick Inserts
          </CardTitle>
          <CardDescription className="text-base">Common clinical questions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <div className="space-y-3">
              {quickInserts.map((insert, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-4 bg-background/50 border-2 hover:bg-accent/5 hover:border-accent/30 transition-all duration-300"
                  onClick={() => onInsertText(insert.text)}
                >
                  <div>
                    <div className="font-semibold text-base mb-2 text-foreground">{insert.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{insert.text.substring(0, 80)}...</div>
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
