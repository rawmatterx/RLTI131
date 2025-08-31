"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePatientStore } from "@/src/store"
import { useEffect, useMemo } from "react"
import type { LabKey, Labs } from "@/src/types"
import { calculateEGFR } from "../../utils/medicalCalculations"

const labSchema = z.object({
  TSH: z
    .object({
      value: z.number().min(0, "TSH must be positive"),
      unit: z.string().default("mIU/L"),
      date: z.string().optional(),
    })
    .optional(),
  Tg: z
    .object({
      value: z.number().min(0, "Tg must be positive"),
      unit: z.string().default("ng/mL"),
      date: z.string().optional(),
    })
    .optional(),
  TgAb: z
    .object({
      value: z.number().min(0, "TgAb must be positive"),
      unit: z.string().default("IU/mL"),
      date: z.string().optional(),
    })
    .optional(),
  Creatinine: z
    .object({
      value: z.number().min(0, "Creatinine must be positive"),
      unit: z.string().default("mg/dL"),
      date: z.string().optional(),
    })
    .optional(),
  eGFR: z
    .object({
      value: z.number().min(0, "eGFR must be positive"),
      unit: z.string().default("mL/min/1.73m²"),
      date: z.string().optional(),
    })
    .optional(),
})

type LabForm = z.input<typeof labSchema>

export function LabsStep({ resetToken }: { resetToken?: number }) {
  const { currentAssessment, updateAssessment } = usePatientStore()

  const {
    register,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<LabForm>({
    resolver: zodResolver(labSchema),
    defaultValues: currentAssessment.labs || {},
  })

  // Reset form when resetToken changes
  useEffect(() => {
    if (resetToken) {
      reset({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken])

  // Normalize form values (which may have undefined unit before defaults apply)
  const normalizeLabs = (values: LabForm): Labs => {
    const out: Partial<Labs> = {}
    labFields.forEach((field) => {
      const v = values[field.key]
      if (v && typeof v.value === "number" && !isNaN(v.value)) {
        ;(out as any)[field.key] = {
          value: v.value,
          unit: v.unit ?? field.unit,
          date: v.date,
        }
      }
    })
    return out as Labs
  }

  // Watch creatinine and patient data to calculate eGFR
  const creatinine = watch('Creatinine.value')
  const patient = currentAssessment.patient
  
  // Calculate eGFR when creatinine or patient data changes
  useEffect(() => {
    if (creatinine && patient?.dob && patient?.sex) {
      // Calculate age from DOB
      const birthDate = new Date(patient.dob)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      // Only calculate for valid ages and creatinine
      if (age > 0 && age < 120) {
        const isFemale = patient.sex === 'F'
        const egfr = calculateEGFR(creatinine, age, isFemale)
        setValue('eGFR.value', egfr)
        setValue('eGFR.unit', 'mL/min/1.73m²')
      }
    }
  }, [creatinine, patient?.dob, patient?.sex, setValue])

  // Update assessment when form values change
  useEffect(() => {
    const subscription = watch((value) => {
      const normalized = normalizeLabs(value as LabForm)
      updateAssessment({ labs: normalized })
    })
    return () => subscription.unsubscribe()
  }, [watch, updateAssessment])

  // Only include keys that exist in labSchema to keep react-hook-form path types valid
  type LabFieldKey = keyof LabForm
  const labFields: { key: LabFieldKey; label: string; unit: string; normalRange: string }[] = [
    { key: "TSH", label: "TSH", unit: "mIU/L", normalRange: "0.4-4.0" },
    { key: "Tg", label: "Thyroglobulin", unit: "ng/mL", normalRange: "<1.0 (post-thyroidectomy)" },
    { key: "TgAb", label: "Thyroglobulin Antibody", unit: "IU/mL", normalRange: "<4.0" },
    { key: "Creatinine", label: "Creatinine", unit: "mg/dL", normalRange: "0.6-1.2" },
    { key: "eGFR", label: "eGFR", unit: "mL/min/1.73m²", normalRange: ">60" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labFields.map((field) => (
          <div key={field.key} className="space-y-4 p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="font-medium">{field.label}</Label>
              <span className="text-xs text-muted-foreground">Normal: {field.normalRange}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor={`${field.key}-value`} className="text-sm">
                  Value
                </Label>
                <Input
                  id={`${field.key}-value`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      setValue(`${field.key}.value`, value)
                      setValue(`${field.key}.unit`, field.unit)
                    }
                  }}
                  defaultValue={currentAssessment.labs?.[field.key]?.value}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`${field.key}-unit`} className="text-sm">
                  Unit
                </Label>
                <Input id={`${field.key}-unit`} value={field.unit} readOnly className="bg-muted" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`${field.key}-date`} className="text-sm">
                Date
              </Label>
              <Input
                id={`${field.key}-date`}
                type="date"
                onChange={(e) => setValue(`${field.key}.date`, e.target.value)}
                defaultValue={currentAssessment.labs?.[field.key]?.date}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> TSH levels should typically be &gt;30 mIU/L for optimal radioiodine uptake.
          Consider extending preparation period if TSH is insufficient.
        </p>
      </div>
    </div>
  )
}
