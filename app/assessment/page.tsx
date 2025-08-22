"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react"
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
  const { currentAssessment, updateAssessment } = usePatientStore()
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
      const res = await dataService.saveAssessment({ id: currentAssessment.id as any, ...currentAssessment })
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
    updateAssessment({ patient: {}, clinical: {}, labs: {}, prep: {}, safety: {}, contraindications: [], imaging: {}, medications: '', risk: {} } as any)
    setSavedAt("—")
    toast({ title: 'Cleared', description: 'Assessment data cleared.' })
  }

  const handleExplainRule = (ruleId: string) => {
    setExplainRuleId(ruleId)
    setShowExplainDrawer(true)
  }

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "demographics":
        return <DemographicsStep />
      case "clinical":
        return <ClinicalStep />
      case "labs":
        return <LabsStep />
      case "imaging":
        return <ImagingStep />
      case "medications":
        return <MedicationsStep />
      case "preparation":
        return <PreparationStep />
      case "safety":
        return <SafetyStep />
      case "risk":
        return <RiskStep />
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
                <h1 className="text-xl font-bold text-primary">Patient Assessment</h1>
                <p className="text-sm text-muted-foreground">I-131 Therapy Eligibility Evaluation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                Advisory Only
              </Badge>
              <div className="flex gap-2">
              <Button
                onClick={handleRunRules}
                disabled={isRunningRules || currentStep !== steps.length - 1}
                className="bg-accent hover:bg-accent/90"
                title={currentStep !== steps.length - 1 ? 'Complete assessment steps to run rules' : ''}
              >
                {isRunningRules ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isRunningRules ? 'Running…' : 'Run Eligibility Rules'}
              </Button>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  const aggressive = confirm('Aggressive histology (tall cell/hobnail/columnar)?')
                  const distant = confirm('Distant metastasis present?')
                  const eteGross = confirm('Gross extrathyroidal extension?')
                  const lnMacro = confirm('Macroscopic lymph node metastasis?')
                  const vascular = confirm('Vascular invasion present?')
                  setRiskFactors({
                    aggressiveHistology: aggressive,
                    distantMetastasis: distant,
                    extrathyroidalExtension: eteGross ? 'gross' : 'none',
                    lymphNodeMetastasis: lnMacro ? 'macroscopic' : 'none',
                    vascularInvasion: vascular,
                  })
                  toast({ title: 'Risk factors updated', description: 'Run rules again to re-stratify.' })
                }}
              >Risk Details</Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Assessment Form */}
          <div className="lg:col-span-3">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Navigation */}
            <div className="mb-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                      index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : index < currentStep
                          ? "bg-green-100 text-green-800"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="font-medium">{index + 1}</span>
                    <span>{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Step Content */}
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </CardHeader>
              <CardContent>{renderStep()}</CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Auto-saved {savedAt}</span>
                <Button
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                  className="bg-accent hover:bg-accent/90"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                {currentStep === steps.length - 1 && (
                  <Link href={{ pathname: '/assistant', query: { autosend: '1', prefill: encodeURIComponent('Please provide a detailed breakdown of the assessment and ATA-based recommendations for this patient.') } }}>
                    <Button className="bg-primary hover:bg-primary/90">Complete & Send to Assistant</Button>
                  </Link>
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
                const color = ata.severity === 'PASS' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                return (
                  <Card className={`mb-6 ${color}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">ATA Risk</CardTitle>
                      <CardDescription>2015 ATA recurrence risk stratification</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium mb-1">{ata.title}</div>
                      <p className="text-xs text-muted-foreground">{ata.rationale}</p>
                    </CardContent>
                  </Card>
                )
              })()
            )}
            {showRuleResults && ruleResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rule Results</CardTitle>
                  <CardDescription>Eligibility evaluation outcomes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ruleResults.map((result) => (
                    <div key={result.id} className={`p-3 rounded-lg border ${getSeverityColor(result.severity)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(result.severity)}
                        <span className="font-medium text-sm">{result.title}</span>
                      </div>
                      <p className="text-xs mb-2">{result.rationale}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
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
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={handleSave}>
                  Save Progress
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={handleExport}>
                  Export Summary
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={handleClear}>
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
