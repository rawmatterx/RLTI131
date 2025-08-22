"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, XCircle, Loader2, Users, Settings, Activity } from "lucide-react"
import Link from "next/link"
import { usePatientStore, useSessionStore } from "@/src/store"
import { rulesEngine } from "@/src/modules/rules/engine"
import { DemographicsStep } from "@/src/components/assessment/DemographicsStep"
import { ClinicalStep } from "@/src/components/assessment/ClinicalStep"
import { LabsStep } from "@/src/components/assessment/LabsStep"
import { ImagingStep } from "@/src/components/assessment/ImagingStep"
import { MedicationsStep } from "@/src/components/assessment/MedicationsStep"
import { PreparationStep } from "@/src/components/assessment/PreparationStep"
import { RiskStep } from "@/src/components/assessment/RiskStep"
import { SafetyStep } from "@/src/components/assessment/SafetyStep"
import { RuleExplainDrawer } from "@/src/components/assessment/RuleExplainDrawer"
import { ExportService } from "@/src/utils/export"
import { dataService } from "@/src/modules/data/service"
import { useToast } from "@/components/ui/use-toast"

const steps = [
  { id: "demographics", title: "Demographics", description: "Patient information" },
  { id: "clinical", title: "Clinical Context", description: "Diagnosis and history" },
  { id: "labs", title: "Laboratory Results", description: "TSH, Tg, TgAb, RFT/LFT" },
  { id: "imaging", title: "Imaging", description: "Metastatic and remnant status" },
  { id: "medications", title: "Medications", description: "Current medications and contraindications" },
  { id: "preparation", title: "Preparation", description: "Withdrawal vs rhTSH pathway" },
  { id: "safety", title: "Safety Environment", description: "Isolation and home environment" },
  { id: "risk", title: "Risk Stratification", description: "ATA risk inputs (HPE, ETE, LN, etc.)" },
]

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showRuleResults, setShowRuleResults] = useState(false)
  const [explainRuleId, setExplainRuleId] = useState<string | null>(null)
  const [showExplainDrawer, setShowExplainDrawer] = useState(false)
  const [savedAt, setSavedAt] = useState("—")
  const [isRunningRules, setIsRunningRules] = useState(false)
  const { currentAssessment, updateAssessment, resetToken } = usePatientStore()
  const { setRiskFactors } = usePatientStore.getState() as any
  const { ruleResults, setRuleResults, addTimelineEvent } = useSessionStore()
  const { toast } = useToast()

  const progress = ((currentStep + 1) / steps.length) * 100

  useEffect(() => {
    setSavedAt(new Date().toLocaleTimeString())
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      addTimelineEvent({
        type: "data_collected",
        description: `Completed ${steps[currentStep].title} step`,
      })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRunRules = async () => {
    try {
      setIsRunningRules(true)
      toast({ title: "Running rules", description: "Evaluating eligibility…" })
      const results = await rulesEngine.evaluate(currentAssessment)
      setRuleResults(results)
      setShowRuleResults(true)
      addTimelineEvent({
        type: "rules_run",
        description: `Eligibility rules evaluated - ${results.length} results`,
        data: { resultCount: results.length, failCount: results.filter((r) => r.severity === "FAIL").length },
      })
      toast({ title: "Rules complete", description: `${results.length} findings` })
    } catch (error) {
      console.error("[v0] Error running rules:", error)
      toast({ title: "Rules failed", description: (error as any)?.message || "Unexpected error", variant: 'destructive' as any })
    } finally {
      setIsRunningRules(false)
    }
  }

  const handleSave = async () => {
    try {
      const res = await dataService.saveAssessment({ ...(currentAssessment as any) })
      setSavedAt(new Date().toLocaleTimeString())
      addTimelineEvent({ type: 'data_collected', description: 'Assessment saved' })
      toast({ title: 'Saved', description: `Assessment ${res.id} saved successfully.` })
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' as any })
    }
  }

  const handleExport = async () => {
    try {
      const blob = await ExportService.exportAssessment(currentAssessment as any, { format: 'pdf' })
      ExportService.downloadBlob(blob, `assessment-${currentAssessment?.patient?.id || 'export'}.pdf`)
      addTimelineEvent({ type: 'export_generated', description: 'Assessment exported (PDF)' })
      toast({ title: 'Export ready', description: 'Download started.' })
    } catch (e: any) {
      toast({ title: 'Export failed', description: e.message, variant: 'destructive' as any })
    }
  }

  const handleClear = () => {
    // Reset store completely
    const { clearAssessment, triggerReset } = usePatientStore.getState()
    clearAssessment()
    triggerReset() // Signal to child forms to reset
    // Reset current step and UI state
    setCurrentStep(0)
    setShowRuleResults(false)
    setRuleResults([])
    setSavedAt("—")
    toast({ title: 'Cleared', description: 'Assessment data cleared. Returned to first step.' })
  }

  const handleExplainRule = (ruleId: string) => {
    setExplainRuleId(ruleId)
    setShowExplainDrawer(true)
  }

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "demographics":
        return <DemographicsStep resetToken={resetToken} />
      case "clinical":
        return <ClinicalStep resetToken={resetToken} />
      case "labs":
        return <LabsStep resetToken={resetToken} />
      case "imaging":
        return <ImagingStep resetToken={resetToken} />
      case "medications":
        return <MedicationsStep resetToken={resetToken} />
      case "preparation":
        return <PreparationStep resetToken={resetToken} />
      case "safety":
        return <SafetyStep resetToken={resetToken} />
      case "risk":
        return <RiskStep resetToken={resetToken} />
      default:
        return <div>Step not found</div>
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "FAIL":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
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
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">Patient Assessment</h1>
                  <p className="text-muted-foreground font-medium">I-131 Therapy Eligibility Evaluation</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="status-info border-2 px-4 py-2 font-semibold">
                Advisory Only
              </Badge>
              <Button
                onClick={handleRunRules}
                disabled={isRunningRules || currentStep !== steps.length - 1}
                className="bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 px-6"
                title={currentStep !== steps.length - 1 ? 'Complete assessment steps to run rules' : ''}
              >
                {isRunningRules ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isRunningRules ? 'Running…' : 'Run Eligibility Rules'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Assessment Form */}
          <div className="lg:col-span-3">
            {/* Progress Bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-semibold text-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-base text-muted-foreground font-medium">{Math.round(progress)}% Complete</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3 bg-secondary/30" />
                <div className="absolute inset-0 bg-primary/20 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Step Navigation */}
            <div className="mb-10">
              <div className="flex items-center gap-3 overflow-x-auto pb-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm whitespace-nowrap border-2 transition-all duration-300 ${
                      index === currentStep
                        ? "bg-primary text-primary-foreground shadow-lg border-primary"
                        : index < currentStep
                          ? "bg-clinical-success/10 text-clinical-success border-clinical-success/30"
                          : "bg-muted/50 text-muted-foreground border-border/50"
                    }`}
                  >
                    <span className="font-bold text-lg">{index + 1}</span>
                    <span className="font-semibold">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Step Content */}
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
                <CardDescription className="text-lg">{steps[currentStep].description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8">{renderStep()}</CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                size="lg"
                className="bg-background border-2 hover:bg-muted/10 transition-all duration-300 px-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-base text-muted-foreground font-medium">Auto-saved {savedAt}</span>
                <Button
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                {currentStep === steps.length - 1 && (
                  <div className="flex gap-3">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="bg-background border-2 hover:bg-accent/5 transition-all duration-300 px-8 font-semibold"
                      onClick={handleSave}
                    >
                      Save Patient Data
                    </Button>
                    <Link href={{ pathname: '/assistant', query: { autosend: '1', prefill: encodeURIComponent('Please provide a detailed breakdown of the assessment and ATA-based recommendations for this patient.') } }}>
                      <Button size="lg" className="bg-primary hover:bg-primary/90 transition-all duration-300 px-8 text-primary-foreground font-semibold">
                        Complete & Send to Assistant
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rule Results Sidebar */}
          <div className="lg:col-span-1">
            {/* ATA Risk Card */}
            {ruleResults.length > 0 && (
              (() => {
                const ata = ruleResults.find((r) => r.id.startsWith('ATA-RISK-'))
                if (!ata) return null
                const color = ata.severity === 'PASS' 
                  ? 'bg-clinical-success/10 border-clinical-success/30 border-2' 
                  : 'bg-clinical-warning/10 border-clinical-warning/30 border-2'
                return (
                  <Card className={`mb-8 ${color} shadow-lg`}>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="p-2 bg-clinical-info/10 rounded-lg">
                          <Activity className="h-5 w-5 text-clinical-info" />
                        </div>
                        ATA Risk
                      </CardTitle>
                      <CardDescription className="text-base">2015 ATA recurrence risk stratification</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-lg font-bold mb-2 text-foreground">{ata.title}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ata.rationale}</p>
                    </CardContent>
                  </Card>
                )
              })()
            )}
            {showRuleResults && ruleResults.length > 0 && (
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-clinical-success/10 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-clinical-success" />
                    </div>
                    Rule Results
                  </CardTitle>
                  <CardDescription className="text-base">Eligibility evaluation outcomes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ruleResults.map((result) => (
                    <div key={result.id} className={`p-4 rounded-xl border-2 ${getSeverityColor(result.severity)} shadow-sm`}>
                      <div className="flex items-center gap-3 mb-3">
                        {getSeverityIcon(result.severity)}
                        <span className="font-semibold text-base">{result.title}</span>
                      </div>
                      <p className="text-sm mb-3 leading-relaxed">{result.rationale}</p>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="h-8 px-4 text-sm font-semibold hover:bg-background/50 transition-all duration-300"
                        onClick={() => handleExplainRule(result.id)}
                      >
                        Why?
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="mt-8 border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Settings className="h-5 w-5 text-accent" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="lg" className="w-full justify-start bg-background border-2 hover:bg-accent/5 transition-all duration-300" onClick={handleSave}>
                  Save Progress
                </Button>
                <Button variant="outline" size="lg" className="w-full justify-start bg-background border-2 hover:bg-accent/5 transition-all duration-300" onClick={handleExport}>
                  Export Summary
                </Button>
                <Button variant="outline" size="lg" className="w-full justify-start bg-background border-2 hover:bg-clinical-error/5 hover:border-clinical-error/30 transition-all duration-300" onClick={handleClear}>
                  Clear Form
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Rule Explanation Drawer */}
      <RuleExplainDrawer
        ruleId={explainRuleId}
        isOpen={showExplainDrawer}
        onClose={() => {
          setShowExplainDrawer(false)
          setExplainRuleId(null)
        }}
      />
    </div>
  )
}
