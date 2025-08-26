"use client"

import { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePatientStore } from "@/src/store"

const imagingSchema = z.object({
  metastatic: z.boolean().optional(),
  remnant: z.boolean().optional(),
  notes: z.string().optional(),
  
  // Nuclear Medicine Investigation
  nuclearMedicine: z.object({
    wbs: z.object({
      remnant: z.boolean().optional(),
      node: z.boolean().optional(),
      functional: z.boolean().optional(),
      nonFunction: z.boolean().optional(),
      pulmonary: z.boolean().optional(),
      liver: z.boolean().optional(),
      skeletal: z.boolean().optional(),
      brain: z.boolean().optional(),
      other: z.boolean().optional(),
    }).optional(),
    dose: z.string().optional(),
    tg: z.string().optional(),
    uptake: z.string().optional(),
    raiu: z.object({
      twentyFourHour: z.boolean().optional(),
      fortyEightHour: z.boolean().optional(),
    }).optional(),
    ptScan: z.object({
      additionalLesion: z.boolean().optional(),
      pulmonary: z.boolean().optional(),
      skeletal: z.boolean().optional(),
      both: z.boolean().optional(),
      node: z.boolean().optional(),
      other: z.boolean().optional(),
    }).optional(),
  }).optional(),
  
  // Staging Information
  staging: z.object({
    clinical: z.enum(["I", "II", "III", "IV"]).optional(),
    tnm: z.enum(["I", "II", "III", "IV"]).optional(),
    postOpEvents: z.object({
      vocalCordPalsy: z.boolean().optional(),
      palpableMass: z.boolean().optional(),
      hypoparathyroidism: z.boolean().optional(),
    }).optional(),
  }).optional(),
})

type ImagingForm = z.infer<typeof imagingSchema>

export function ImagingStep({ resetToken }: { resetToken?: number }) {
  const { currentAssessment, updateAssessment } = usePatientStore()

  const {
    register,
    setValue,
    control,
    reset,
  } = useForm<ImagingForm>({
    resolver: zodResolver(imagingSchema),
    defaultValues: currentAssessment.imaging || {},
  })

  // Reset when resetToken changes
  useEffect(() => {
    if (resetToken) {
      reset({})
    }
  }, [resetToken, reset])

  useEffect(() => {
    const subscription = control.watch((value) => {
      updateAssessment({ imaging: value as any })
    })
    return () => subscription.unsubscribe()
  }, [control, updateAssessment])

  return (
    <div className="space-y-6">
      {/* Basic Imaging Findings */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Basic Imaging Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metastatic"
                checked={!!useWatch({ control, name: 'metastatic' })}
                onCheckedChange={(checked) => setValue('metastatic', checked as boolean)}
              />
              <Label htmlFor="metastatic" className="text-sm font-normal">
                Metastatic disease present
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remnant"
                checked={!!useWatch({ control, name: 'remnant' })}
                onCheckedChange={(checked) => setValue('remnant', checked as boolean)}
              />
              <Label htmlFor="remnant" className="text-sm font-normal">
                Thyroid remnant present
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imaging-notes">Imaging Notes</Label>
            <Textarea
              id="imaging-notes"
              {...register("notes")}
              placeholder="Additional imaging findings, locations of metastases, remnant size, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Nuclear Medicine Investigation */}
      <Card>
        <CardHeader>
          <CardTitle>☢️ Nuclear Medicine Investigation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Whole Body Scan (WBS) */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Whole Body Scan (WBS) Findings</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="wbs-remnant"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.wbs.remnant' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.wbs.remnant', checked as boolean)}
                />
                <Label htmlFor="wbs-remnant" className="text-sm">Remnant</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="wbs-node"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.wbs.node' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.wbs.node', checked as boolean)}
                />
                <Label htmlFor="wbs-node" className="text-sm">Node</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="wbs-functional"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.wbs.functional' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.wbs.functional', checked as boolean)}
                />
                <Label htmlFor="wbs-functional" className="text-sm">Functional</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="wbs-nonfunction"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.wbs.nonFunction' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.wbs.nonFunction', checked as boolean)}
                />
                <Label htmlFor="wbs-nonfunction" className="text-sm">Non-Function</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="wbs-pulmonary"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.wbs.pulmonary' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.wbs.pulmonary', checked as boolean)}
                />
                <Label htmlFor="wbs-pulmonary" className="text-sm">Pulmonary</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="wbs-liver"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.wbs.liver' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.wbs.liver', checked as boolean)}
                />
                <Label htmlFor="wbs-liver" className="text-sm">Liver</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="wbs-skeletal"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.wbs.skeletal' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.wbs.skeletal', checked as boolean)}
                />
                <Label htmlFor="wbs-skeletal" className="text-sm">Skeletal</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="wbs-brain"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.wbs.brain' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.wbs.brain', checked as boolean)}
                />
                <Label htmlFor="wbs-brain" className="text-sm">Brain</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="wbs-other"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.wbs.other' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.wbs.other', checked as boolean)}
                />
                <Label htmlFor="wbs-other" className="text-sm">Other</Label>
              </div>
            </div>
          </div>

          {/* Nuclear Medicine Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Dose</Label>
              <Input 
                {...register("nuclearMedicine.dose")} 
                placeholder="e.g., 5 mCi" 
              />
            </div>

            <div className="space-y-2">
              <Label>Thyroglobulin (Tg)</Label>
              <Input 
                {...register("nuclearMedicine.tg")} 
                placeholder="e.g., 2.5 ng/mL" 
              />
            </div>

            <div className="space-y-2">
              <Label>Uptake</Label>
              <Input 
                {...register("nuclearMedicine.uptake")} 
                placeholder="e.g., 15%" 
              />
            </div>
          </div>

          {/* RAIU */}
          <div className="space-y-3">
            <h5 className="font-medium">RAIU (Radioactive Iodine Uptake)</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="raiu-24h"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.raiu.twentyFourHour' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.raiu.twentyFourHour', checked as boolean)}
                />
                <Label htmlFor="raiu-24h" className="text-sm">24 Hour</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="raiu-48h"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.raiu.fortyEightHour' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.raiu.fortyEightHour', checked as boolean)}
                />
                <Label htmlFor="raiu-48h" className="text-sm">48 Hour</Label>
              </div>
            </div>
          </div>

          {/* PET Scan */}
          <div className="space-y-3">
            <h5 className="font-medium">PET Scan - Additional Lesions</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pt-additional"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.ptScan.additionalLesion' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.ptScan.additionalLesion', checked as boolean)}
                />
                <Label htmlFor="pt-additional" className="text-sm">Additional Lesion</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="pt-pulmonary"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.ptScan.pulmonary' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.ptScan.pulmonary', checked as boolean)}
                />
                <Label htmlFor="pt-pulmonary" className="text-sm">Pulmonary</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="pt-skeletal"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.ptScan.skeletal' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.ptScan.skeletal', checked as boolean)}
                />
                <Label htmlFor="pt-skeletal" className="text-sm">Skeletal</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="pt-both"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.ptScan.both' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.ptScan.both', checked as boolean)}
                />
                <Label htmlFor="pt-both" className="text-sm">Both</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="pt-node"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.ptScan.node' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.ptScan.node', checked as boolean)}
                />
                <Label htmlFor="pt-node" className="text-sm">Node</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="pt-other"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.ptScan.other' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.ptScan.other', checked as boolean)}
                />
                <Label htmlFor="pt-other" className="text-sm">Other</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staging Information */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Staging Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Clinical Staging</Label>
              <Select
                value={useWatch({ control, name: 'staging.clinical' })}
                onValueChange={(value) => setValue('staging.clinical', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clinical stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Stage I</SelectItem>
                  <SelectItem value="II">Stage II</SelectItem>
                  <SelectItem value="III">Stage III</SelectItem>
                  <SelectItem value="IV">Stage IV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>TNM Staging</Label>
              <Select
                value={useWatch({ control, name: 'staging.tnm' })}
                onValueChange={(value) => setValue('staging.tnm', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select TNM stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Stage I</SelectItem>
                  <SelectItem value="II">Stage II</SelectItem>
                  <SelectItem value="III">Stage III</SelectItem>
                  <SelectItem value="IV">Stage IV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium">Post-Operative Events</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="vocal-cord-palsy"
                  checked={!!useWatch({ control, name: 'staging.postOpEvents.vocalCordPalsy' })}
                  onCheckedChange={(checked) => setValue('staging.postOpEvents.vocalCordPalsy', checked as boolean)}
                />
                <Label htmlFor="vocal-cord-palsy" className="text-sm">Vocal Cord Palsy</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="palpable-mass"
                  checked={!!useWatch({ control, name: 'staging.postOpEvents.palpableMass' })}
                  onCheckedChange={(checked) => setValue('staging.postOpEvents.palpableMass', checked as boolean)}
                />
                <Label htmlFor="palpable-mass" className="text-sm">Palpable Mass/Node</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="hypoparathyroidism"
                  checked={!!useWatch({ control, name: 'staging.postOpEvents.hypoparathyroidism' })}
                  onCheckedChange={(checked) => setValue('staging.postOpEvents.hypoparathyroidism', checked as boolean)}
                />
                <Label htmlFor="hypoparathyroidism" className="text-sm">Hypoparathyroidism</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nuclear Medicine Considerations:</strong> Comprehensive nuclear medicine evaluation including WBS, 
          uptake studies, and PET scan findings help determine optimal I-131 therapy protocols and doses. Staging 
          information guides treatment intensity and follow-up strategies.
        </p>
      </div>
    </div>
  )
}