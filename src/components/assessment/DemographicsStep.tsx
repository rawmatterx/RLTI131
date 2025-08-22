"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePatientStore } from "@/src/store"
import type { Patient } from "@/src/types"
import { useEffect, useRef } from "react"

const demographicsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mrn: z.string().min(1, "MRN is required"),
  dob: z.string().min(1, "Date of birth is required"),
  sex: z.enum(["F", "M", "Other"], { required_error: "Sex is required" }),
})

type DemographicsForm = z.infer<typeof demographicsSchema>

export function DemographicsStep({ resetToken }: { resetToken?: number }) {
  const { currentAssessment, updateAssessment } = usePatientStore()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<DemographicsForm>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: {
      name: currentAssessment.patient?.name || "",
      mrn: currentAssessment.patient?.mrn || "",
      dob: currentAssessment.patient?.dob || "",
      sex: currentAssessment.patient?.sex || undefined,
    },
  })

  // Reset form when resetToken changes
  useEffect(() => {
    if (resetToken) {
      reset({
        name: "",
        mrn: "",
        dob: "",
        sex: undefined,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken])

  // Stable patient id across renders/session
  const patientIdRef = useRef<string>(currentAssessment.patient?.id || crypto.randomUUID())

  // Only watch specific fields to avoid object identity changes every render
  const watched = useWatch({ control, name: ["name", "mrn", "dob", "sex"] }) as [string, string, string, "F" | "M" | "Other" | undefined]
  const [name, mrn, dob, sex] = watched || ["", "", "", undefined]

  // Auto-save on form changes
  useEffect(() => {
    const prev: Partial<Patient> = (currentAssessment.patient as Partial<Patient>) || {}
    const next = {
      id: patientIdRef.current,
      name,
      mrn,
      dob,
      sex: sex as "F" | "M" | "Other" | undefined,
    }

    const changed = prev.name !== next.name || prev.mrn !== next.mrn || prev.dob !== next.dob || prev.sex !== next.sex
    if (changed) {
      updateAssessment({ patient: next })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, mrn, dob, sex, updateAssessment])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Patient Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter patient name"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mrn">Medical Record Number *</Label>
          <Input
            id="mrn"
            {...register("mrn")}
            placeholder="Enter MRN"
            className={errors.mrn ? "border-destructive" : ""}
          />
          {errors.mrn && <p className="text-sm text-destructive">{errors.mrn.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth *</Label>
          <Input id="dob" type="date" {...register("dob")} className={errors.dob ? "border-destructive" : ""} />
          {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sex *</Label>
          <Select
            value={sex ?? undefined}
            onValueChange={(value) => setValue("sex", value as "F" | "M" | "Other")}
          >
            <SelectTrigger className={errors.sex ? "border-destructive" : ""}>
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="F">Female</SelectItem>
              <SelectItem value="M">Male</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.sex && <p className="text-sm text-destructive">{errors.sex.message}</p>}
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Privacy Notice:</strong> Patient data is stored locally in your browser and is not transmitted to
          external servers. Use the "Clear All Data" option in settings to remove all stored information.
        </p>
      </div>
    </div>
  )
}
