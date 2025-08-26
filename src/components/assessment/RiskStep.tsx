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
  molecularRiskScore: z.enum(["low", "intermediate", "high"]).optional(),
  
  // ATA 2025 ultrasound-based features  
  suspiciousUSFeatures: z.boolean().optional(),
  centralLNImaging: z.boolean().optional(),
  
  // ATA 2025 follow-up stratification
  followUpRisk: z.enum(["low", "intermediate", "high"]).optional(),
  postSurgicalRisk: z.enum(["excellent", "biochemical", "structural"]).optional(),
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

      {/* ATA 2025 Molecular Markers Section */}
      <div className="mt-8 p-4 border rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">ATA 2025 Molecular Markers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="braf" checked={!!useWatch({ control, name: 'brafMutation' })} onCheckedChange={v => setValue('brafMutation', v as boolean)} />
            <Label htmlFor="braf" className="text-sm">BRAF mutation</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="ras" checked={!!useWatch({ control, name: 'rasMutation' })} onCheckedChange={v => setValue('rasMutation', v as boolean)} />
            <Label htmlFor="ras" className="text-sm">RAS mutation</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="ret" checked={!!useWatch({ control, name: 'retPtcRearrangement' })} onCheckedChange={v => setValue('retPtcRearrangement', v as boolean)} />
            <Label htmlFor="ret" className="text-sm">RET/PTC rearrangement</Label>
          </div>

          <div className="space-y-1">
            <Label className="text-sm">Molecular risk score</Label>
            <Select value={useWatch({ control, name: 'molecularRiskScore' })} onValueChange={(v) => setValue('molecularRiskScore', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select molecular risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ATA 2025 Ultrasound Features Section */}
      <div className="mt-6 p-4 border rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold mb-4 text-green-800">ATA 2025 Ultrasound-Based Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="sus-us" checked={!!useWatch({ control, name: 'suspiciousUSFeatures' })} onCheckedChange={v => setValue('suspiciousUSFeatures', v as boolean)} />
            <Label htmlFor="sus-us" className="text-sm">Suspicious ultrasound features (prioritize over size)</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="central-ln" checked={!!useWatch({ control, name: 'centralLNImaging' })} onCheckedChange={v => setValue('centralLNImaging', v as boolean)} />
            <Label htmlFor="central-ln" className="text-sm">Imaging-confirmed central LN involvement</Label>
          </div>
        </div>
      </div>

      {/* ATA 2025 Follow-up Strategy Section */}
      <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
        <h3 className="text-lg font-semibold mb-4 text-yellow-800">ATA 2025 Follow-up Stratification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm">Follow-up risk category</Label>
            <Select value={useWatch({ control, name: 'followUpRisk' })} onValueChange={(v) => setValue('followUpRisk', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select follow-up risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (de-escalated monitoring)</SelectItem>
                <SelectItem value="intermediate">Intermediate (selective approach)</SelectItem>
                <SelectItem value="high">High (intensive follow-up)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm">Post-surgical risk status</Label>
            <Select value={useWatch({ control, name: 'postSurgicalRisk' })} onValueChange={(v) => setValue('postSurgicalRisk', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select post-surgical status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent response</SelectItem>
                <SelectItem value="biochemical">Biochemical incomplete</SelectItem>
                <SelectItem value="structural">Structural incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}


