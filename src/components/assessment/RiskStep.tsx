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
    </div>
  )
}


