"use client"

import { useEffect, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePatientStore } from "@/src/store"

const riskSchema = z.object({
  aggressiveHistology: z.boolean().optional(),
  distantMetastasis: z.boolean().optional(),
  extrathyroidalExtension: z.enum(["none", "micro", "gross"]).optional(),
  lymphNodeMetastasis: z.enum(["none", "microscopic", "macroscopic"]).optional(),
  vascularInvasion: z.boolean().optional(),
  primaryTumorSizeCm: z.number().optional(),
  marginStatus: z.enum(["negative", "microscopic", "positive"]).optional(),
  tallCellPercent: z.number().optional(),
  
  // ATA 2025 molecular markers
  brafMutation: z.boolean().optional(),
  rasMutation: z.boolean().optional(),
  retPtcRearrangement: z.boolean().optional(),
  tertPromoterMutation: z.boolean().optional(),
  brafTertCombination: z.boolean().optional(),
  rasTertCombination: z.boolean().optional(),
  otherHighRiskMutations: z.boolean().optional(),
  molecularRiskScore: z.enum(["minimal", "low", "intermediate", "high"]).optional(),
  
  // ATA 2025 Official Risk Stratification
  ataRiskCategory: z.enum(["low", "intermediate-low", "intermediate-high", "high"]).optional(),
  
  // ATA 2025 TNM Staging (8th Edition)
  pTCategory: z.enum(["TX", "T0", "T1a", "T1b", "T2", "T3a", "T3b", "T4a", "T4b"]).optional(),
  pNCategory: z.enum(["NX", "N0", "N1a", "N1b"]).optional(),
  mCategory: z.enum(["M0", "M1"]).optional(),
  
  // ATA 2025 Specific Risk Factors
  tumorFocality: z.enum(["unifocal-microcarcinoma", "multifocal-microcarcinoma", "unifocal-larger", "multifocal-larger"]).optional(),
  lymphNodeVolume: z.enum(["none", "small-volume", "intermediate-volume", "large-volume"]).optional(),
  extranodal_extension: z.boolean().optional(),
  completenessOfResection: z.enum(["R0", "R1", "R2"]).optional(),
  postopThyroglobulin: z.enum(["undetectable", "low-level", "elevated", "suggestive-metastases"]).optional(),
  
  // ATA 2025 Response Assessment
  responseToTherapy: z.enum(["excellent", "indeterminate", "biochemical-incomplete", "structural-incomplete"]).optional(),
  
  // Legacy fields
  suspiciousUSFeatures: z.boolean().optional(),
  centralLNImaging: z.boolean().optional(),
})

type RiskForm = z.infer<typeof riskSchema>

export function RiskStep({ resetToken }: { resetToken?: number }) {
  const { currentAssessment } = usePatientStore()
  const { setRiskFactors } = usePatientStore.getState() as any

  const {
    setValue,
    control,
    reset,
  } = useForm<RiskForm>({
    resolver: zodResolver(riskSchema),
    defaultValues: (currentAssessment as any).risk || {},
  })

  useEffect(() => {
    reset((currentAssessment as any).risk || {})
  }, [resetToken, reset])

  const lastJson = useRef<string>("")
  useEffect(() => {
    const subscription2 = (control as any).watch?.((value: any) => {
      const json = JSON.stringify(value || {})
      if (json !== lastJson.current) {
        lastJson.current = json
        setRiskFactors(value)
      }
    })
    return () => {
      subscription2?.unsubscribe?.()
    }
  }, [control, setRiskFactors])

  return (
    <div className="space-y-6">
      {/* Traditional Risk Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="aggr" 
            checked={!!useWatch({ control, name: 'aggressiveHistology' })} 
            onCheckedChange={v => setValue('aggressiveHistology', v as boolean)} 
          />
          <Label htmlFor="aggr" className="text-sm">Aggressive histology</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox 
            id="dm" 
            checked={!!useWatch({ control, name: 'distantMetastasis' })} 
            onCheckedChange={v => setValue('distantMetastasis', v as boolean)} 
          />
          <Label htmlFor="dm" className="text-sm">Distant metastasis</Label>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Extrathyroidal extension</Label>
          <Select 
            value={useWatch({ control, name: 'extrathyroidalExtension' })} 
            onValueChange={(v) => setValue('extrathyroidalExtension', v as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ETE" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="micro">Microscopic</SelectItem>
              <SelectItem value="gross">Gross</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Primary tumor size (cm)</Label>
          <Input 
            type="number" 
            step="0.1" 
            defaultValue={useWatch({ control, name: 'primaryTumorSizeCm' }) as any} 
            onChange={e => setValue('primaryTumorSizeCm', parseFloat(e.target.value))} 
          />
        </div>
      </div>

      {/* ATA 2025 TNM Staging */}
      <div className="mt-8 p-4 border rounded-lg bg-purple-50">
        <h3 className="text-lg font-semibold mb-4 text-purple-800">🏥 ATA 2025 TNM Staging</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Primary Tumor (pT)</Label>
            <Select 
              value={useWatch({ control, name: 'pTCategory' })} 
              onValueChange={(v) => setValue('pTCategory', v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pT" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T1a">T1a (≤1cm)</SelectItem>
                <SelectItem value="T1b">T1b (1-2cm)</SelectItem>
                <SelectItem value="T2">T2 (2-4cm)</SelectItem>
                <SelectItem value="T3a">T3a (>4cm)</SelectItem>
                <SelectItem value="T4a">T4a (Gross ETE)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Lymph Nodes (pN)</Label>
            <Select 
              value={useWatch({ control, name: 'pNCategory' })} 
              onValueChange={(v) => setValue('pNCategory', v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pN" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N0">N0 (No LN)</SelectItem>
                <SelectItem value="N1a">N1a (Central)</SelectItem>
                <SelectItem value="N1b">N1b (Lateral)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Metastasis (M)</Label>
            <Select 
              value={useWatch({ control, name: 'mCategory' })} 
              onValueChange={(v) => setValue('mCategory', v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select M" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M0">M0 (No distant)</SelectItem>
                <SelectItem value="M1">M1 (Distant present)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ATA 2025 Molecular Markers */}
      <div className="mt-6 p-4 border rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">🧬 ATA 2025 Molecular Profiling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="braf" 
              checked={!!useWatch({ control, name: 'brafMutation' })} 
              onCheckedChange={v => setValue('brafMutation', v as boolean)} 
            />
            <Label htmlFor="braf" className="text-sm">BRAF V600E mutation</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="tert" 
              checked={!!useWatch({ control, name: 'tertPromoterMutation' })} 
              onCheckedChange={v => setValue('tertPromoterMutation', v as boolean)} 
            />
            <Label htmlFor="tert" className="text-sm">TERT promoter mutation</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="braf-tert" 
              checked={!!useWatch({ control, name: 'brafTertCombination' })} 
              onCheckedChange={v => setValue('brafTertCombination', v as boolean)} 
            />
            <Label htmlFor="braf-tert" className="text-sm font-semibold text-red-600">
              BRAF + TERT combination (highest risk)
            </Label>
          </div>

          <div className="space-y-1">
            <Label className="text-sm">Molecular risk score</Label>
            <Select 
              value={useWatch({ control, name: 'molecularRiskScore' })} 
              onValueChange={(v) => setValue('molecularRiskScore', v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select molecular risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ATA 2025 Risk Factors */}
      <div className="mt-6 p-4 border rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold mb-4 text-green-800">📋 ATA 2025 Risk Factors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Lymph Node Volume</Label>
            <Select 
              value={useWatch({ control, name: 'lymphNodeVolume' })} 
              onValueChange={(v) => setValue('lymphNodeVolume', v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select LN volume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No LN Metastases</SelectItem>
                <SelectItem value="small-volume">Small Volume (≤5 micro)</SelectItem>
                <SelectItem value="intermediate-volume">Intermediate Volume</SelectItem>
                <SelectItem value="large-volume">Large Volume (≥3cm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Completeness of Resection</Label>
            <Select 
              value={useWatch({ control, name: 'completenessOfResection' })} 
              onValueChange={(v) => setValue('completenessOfResection', v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R0">R0 (Complete)</SelectItem>
                <SelectItem value="R1">R1 (Microscopic residual)</SelectItem>
                <SelectItem value="R2">R2 (Gross residual)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ATA 2025 Final Assessment */}
      <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
        <h3 className="text-lg font-semibold mb-4 text-yellow-800">📊 ATA 2025 Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">ATA Risk Category</Label>
            <Select 
              value={useWatch({ control, name: 'ataRiskCategory' })} 
              onValueChange={(v) => setValue('ataRiskCategory', v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ATA risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk (1-6%)</SelectItem>
                <SelectItem value="intermediate-low">Intermediate-Low (3-9%)</SelectItem>
                <SelectItem value="intermediate-high">Intermediate-High (8-22%)</SelectItem>
                <SelectItem value="high">High Risk (27-75%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Response to Therapy</Label>
            <Select 
              value={useWatch({ control, name: 'responseToTherapy' })} 
              onValueChange={(v) => setValue('responseToTherapy', v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select response" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent (&lt;15%)</SelectItem>
                <SelectItem value="indeterminate">Indeterminate (~20%)</SelectItem>
                <SelectItem value="biochemical-incomplete">Biochemical Incomplete (53%)</SelectItem>
                <SelectItem value="structural-incomplete">Structural Incomplete (67-75%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}