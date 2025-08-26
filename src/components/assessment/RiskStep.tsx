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
})

type RiskForm = z.infer<typeof riskSchema>

export function RiskStep({ resetToken }: { resetToken?: number }) {
  const { currentAssessment } = usePatientStore()
  const { setRiskFactors } = usePatientStore.getState() as any

  const {
    register,
    setValue,
    control,
    reset,
  } = useForm<RiskForm>({
    resolver: zodResolver(riskSchema),
    defaultValues: (currentAssessment as any).risk || {},
  })

  useEffect(() => {
    reset((currentAssessment as any).risk || {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken])

  const lastJson = useRef<string>("")
  useEffect(() => {
    const subscription = (control as any)._subjects?.state?.subscribe?.(() => {}) || null
    const unsub = (control as any)._proxyFormState?.subscribe?.(() => {}) || null
    const sub = (control as any)._options?.watch?.subscribe?.(() => {}) || null
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-2">
          <Checkbox id="aggr" checked={!!useWatch({ control, name: 'aggressiveHistology' })} onCheckedChange={v => setValue('aggressiveHistology', v as boolean)} />
          <Label htmlFor="aggr" className="text-sm">Aggressive histology (tall cell/hobnail/columnar)</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="dm" checked={!!useWatch({ control, name: 'distantMetastasis' })} onCheckedChange={v => setValue('distantMetastasis', v as boolean)} />
          <Label htmlFor="dm" className="text-sm">Distant metastasis</Label>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Extrathyroidal extension</Label>
          <Select value={useWatch({ control, name: 'extrathyroidalExtension' })} onValueChange={(v) => setValue('extrathyroidalExtension', v as any)}>
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
          <Label className="text-sm">Lymph node metastasis</Label>
          <Select value={useWatch({ control, name: 'lymphNodeMetastasis' })} onValueChange={(v) => setValue('lymphNodeMetastasis' as any, v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select LN status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="microscopic">Microscopic</SelectItem>
              <SelectItem value="macroscopic">Macroscopic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="vi" checked={!!useWatch({ control, name: 'vascularInvasion' })} onCheckedChange={v => setValue('vascularInvasion', v as boolean)} />
          <Label htmlFor="vi" className="text-sm">Vascular invasion</Label>
        </div>

        <div className="space-y-1">
          <Label className="text-sm" htmlFor="pts">Primary tumor size (cm)</Label>
          <Input id="pts" type="number" step="0.1" defaultValue={useWatch({ control, name: 'primaryTumorSizeCm' }) as any} onChange={e => setValue('primaryTumorSizeCm', parseFloat(e.target.value))} />
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Margin status</Label>
          <Select value={useWatch({ control, name: 'marginStatus' })} onValueChange={(v) => setValue('marginStatus', v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select margin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="microscopic">Microscopic</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm" htmlFor="tcp">Tall cell percentage (%)</Label>
          <Input id="tcp" type="number" step="1" defaultValue={useWatch({ control, name: 'tallCellPercent' }) as any} onChange={e => setValue('tallCellPercent', parseFloat(e.target.value))} />
        </div>
      </div>

      {/* ATA 2025 TNM Staging (8th Edition) */}
      <div className="mt-8 p-4 border rounded-lg bg-purple-50">
        <h3 className="text-lg font-semibold mb-4 text-purple-800">🏥 ATA 2025 TNM Staging (8th Edition)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Primary Tumor (pT)</Label>
            <Select value={useWatch({ control, name: 'pTCategory' })} onValueChange={(v) => setValue('pTCategory', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pT" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T1a">T1a (≤1cm, intrathyroidal)</SelectItem>
                <SelectItem value="T1b">T1b (>1-2cm, intrathyroidal)</SelectItem>
                <SelectItem value="T2">T2 (>2-4cm, intrathyroidal)</SelectItem>
                <SelectItem value="T3a">T3a (>4cm, intrathyroidal)</SelectItem>
                <SelectItem value="T3b">T3b (MEE into strap muscles)</SelectItem>
                <SelectItem value="T4a">T4a (Gross ETE)</SelectItem>
                <SelectItem value="T4b">T4b (Advanced ETE)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Regional Lymph Nodes (pN)</Label>
            <Select value={useWatch({ control, name: 'pNCategory' })} onValueChange={(v) => setValue('pNCategory', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pN" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N0">N0 (No regional LN metastasis)</SelectItem>
                <SelectItem value="N1a">N1a (Central compartment)</SelectItem>
                <SelectItem value="N1b">N1b (Lateral cervical)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Distant Metastasis (M)</Label>
            <Select value={useWatch({ control, name: 'mCategory' })} onValueChange={(v) => setValue('mCategory', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select M" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M0">M0 (No distant metastasis)</SelectItem>
                <SelectItem value="M1">M1 (Distant metastasis present)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ATA 2025 Molecular Markers Section */}
      <div className="mt-6 p-4 border rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">🧬 ATA 2025 Molecular Profiling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="braf" checked={!!useWatch({ control, name: 'brafMutation' })} onCheckedChange={v => setValue('brafMutation', v as boolean)} />
            <Label htmlFor="braf" className="text-sm">BRAF V600E mutation</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="tert" checked={!!useWatch({ control, name: 'tertPromoterMutation' })} onCheckedChange={v => setValue('tertPromoterMutation', v as boolean)} />
            <Label htmlFor="tert" className="text-sm">TERT promoter mutation</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="ras" checked={!!useWatch({ control, name: 'rasMutation' })} onCheckedChange={v => setValue('rasMutation', v as boolean)} />
            <Label htmlFor="ras" className="text-sm">RAS mutation</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="ret" checked={!!useWatch({ control, name: 'retPtcRearrangement' })} onCheckedChange={v => setValue('retPtcRearrangement', v as boolean)} />
            <Label htmlFor="ret" className="text-sm">RET/PTC rearrangement</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="braf-tert" checked={!!useWatch({ control, name: 'brafTertCombination' })} onCheckedChange={v => setValue('brafTertCombination', v as boolean)} />
            <Label htmlFor="braf-tert" className="text-sm font-semibold text-red-600">BRAF + TERT combination (highest risk)</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="ras-tert" checked={!!useWatch({ control, name: 'rasTertCombination' })} onCheckedChange={v => setValue('rasTertCombination', v as boolean)} />
            <Label htmlFor="ras-tert" className="text-sm font-semibold text-red-600">RAS + TERT combination</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="other-high" checked={!!useWatch({ control, name: 'otherHighRiskMutations' })} onCheckedChange={v => setValue('otherHighRiskMutations', v as boolean)} />
            <Label htmlFor="other-high" className="text-sm">Other high-risk mutations (TP53, PIK3CA, AKT1, EIF1AX)</Label>
          </div>

          <div className="space-y-1">
            <Label className="text-sm">Molecular risk score</Label>
            <Select value={useWatch({ control, name: 'molecularRiskScore' })} onValueChange={(v) => setValue('molecularRiskScore', v as any)}>
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

      {/* ATA 2025 Specific Risk Factors */}
      <div className="mt-6 p-4 border rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold mb-4 text-green-800">📋 ATA 2025 Specific Risk Factors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Tumor Focality</Label>
            <Select value={useWatch({ control, name: 'tumorFocality' })} onValueChange={(v) => setValue('tumorFocality', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tumor focality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unifocal-microcarcinoma">Unifocal Papillary Microcarcinoma (1-2% recurrence)</SelectItem>
                <SelectItem value="multifocal-microcarcinoma">Multifocal Papillary Microcarcinoma (4-6% recurrence)</SelectItem>
                <SelectItem value="unifocal-larger">Unifocal Larger Tumor</SelectItem>
                <SelectItem value="multifocal-larger">Multifocal Larger Tumor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Lymph Node Volume</Label>
            <Select value={useWatch({ control, name: 'lymphNodeVolume' })} onValueChange={(v) => setValue('lymphNodeVolume', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select LN volume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Lymph Node Metastases</SelectItem>
                <SelectItem value="small-volume">Small Volume (≤5 micrometastases <0.2cm)</SelectItem>
                <SelectItem value="intermediate-volume">Intermediate Volume (Clinical N1, all <3cm)</SelectItem>
                <SelectItem value="large-volume">Large Volume (Any ≥3cm LN)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="ene" checked={!!useWatch({ control, name: 'extranodal_extension' })} onCheckedChange={v => setValue('extranodal_extension', v as boolean)} />
            <Label htmlFor="ene" className="text-sm">Extranodal Extension (ENE)</Label>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Completeness of Resection</Label>
            <Select value={useWatch({ control, name: 'completenessOfResection' })} onValueChange={(v) => setValue('completenessOfResection', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select resection status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R0">R0 (Complete resection)</SelectItem>
                <SelectItem value="R1">R1 (Microscopic residual)</SelectItem>
                <SelectItem value="R2">R2 (Gross residual disease)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Postoperative Thyroglobulin</Label>
            <Select value={useWatch({ control, name: 'postopThyroglobulin' })} onValueChange={(v) => setValue('postopThyroglobulin', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Tg level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undetectable">Undetectable</SelectItem>
                <SelectItem value="low-level">Low Level</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="suggestive-metastases">Suggestive of Distant Metastases</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="sus-us" checked={!!useWatch({ control, name: 'suspiciousUSFeatures' })} onCheckedChange={v => setValue('suspiciousUSFeatures', v as boolean)} />
            <Label htmlFor="sus-us" className="text-sm">Suspicious ultrasound features</Label>
          </div>
        </div>
      </div>

      {/* ATA 2025 Dynamic Risk Assessment */}
      <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
        <h3 className="text-lg font-semibold mb-4 text-yellow-800">📊 ATA 2025 Dynamic Risk Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">ATA Risk Category (Overall)</Label>
            <Select value={useWatch({ control, name: 'ataRiskCategory' })} onValueChange={(v) => setValue('ataRiskCategory', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select ATA risk category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk (1-6% recurrence)</SelectItem>
                <SelectItem value="intermediate-low">Intermediate-Low Risk (3-9% recurrence)</SelectItem>
                <SelectItem value="intermediate-high">Intermediate-High Risk (8-22% recurrence)</SelectItem>
                <SelectItem value="high">High Risk (27-75% recurrence)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Response to Therapy (Dynamic Assessment)</Label>
            <Select value={useWatch({ control, name: 'responseToTherapy' })} onValueChange={(v) => setValue('responseToTherapy', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select response" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent Response (<15% recurrence)</SelectItem>
                <SelectItem value="indeterminate">Indeterminate Response (~20% progression)</SelectItem>
                <SelectItem value="biochemical-incomplete">Biochemical Incomplete (up to 53% recurrence)</SelectItem>
                <SelectItem value="structural-incomplete">Structural Incomplete (67-75% recurrence)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}


