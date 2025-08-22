"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { usePatientStore } from "@/src/store"
import { useEffect } from "react"

const clinicalSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  priorI131: z.boolean().optional(),
  thyroidectomy: z.enum(["total", "near_total", "partial", "none"]).optional(),
})

type ClinicalForm = z.infer<typeof clinicalSchema>

export function ClinicalStep() {
  const { currentAssessment, updateAssessment } = usePatientStore()

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClinicalForm>({
    resolver: zodResolver(clinicalSchema),
    defaultValues: {
      diagnosis: currentAssessment.clinical?.diagnosis || "",
      priorI131: currentAssessment.clinical?.priorI131 || false,
      thyroidectomy: currentAssessment.clinical?.thyroidectomy || undefined,
    },
  })

  const priorI131 = watch("priorI131")
  const thyroidectomy = watch("thyroidectomy")

  useEffect(() => {
    const subscription = watch((value) => {
      updateAssessment({ clinical: value as ClinicalForm })
    })
    return () => subscription.unsubscribe()
  }, [watch, updateAssessment])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
        <Input
          id="diagnosis"
          {...register("diagnosis")}
          placeholder="e.g., Differentiated thyroid cancer, post-thyroidectomy"
          className={errors.diagnosis ? "border-destructive" : ""}
        />
        {errors.diagnosis && <p className="text-sm text-destructive">{errors.diagnosis.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="thyroidectomy">Thyroidectomy Status</Label>
        <Select
          value={thyroidectomy}
          onValueChange={(value) => setValue("thyroidectomy", value as "total" | "near_total" | "partial" | "none")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select thyroidectomy status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total thyroidectomy</SelectItem>
            <SelectItem value="near_total">Near-total thyroidectomy</SelectItem>
            <SelectItem value="partial">Partial thyroidectomy</SelectItem>
            <SelectItem value="none">No thyroidectomy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="priorI131"
          checked={!!priorI131}
          onCheckedChange={(checked) => setValue("priorI131", checked as boolean)}
        />
        <Label htmlFor="priorI131" className="text-sm font-normal">
          Previous I-131 therapy
        </Label>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Clinical Context:</strong> This information helps determine appropriate I-131 therapy protocols and
          dosing considerations. Total thyroidectomy is typically required for remnant ablation protocols.
        </p>
      </div>
    </div>
  )
}
