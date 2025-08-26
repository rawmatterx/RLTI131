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
  
  // USG and CT Findings
  usgFindings: z.object({
    thyroidRemnant: z.boolean().optional(),
    suspiciousNodes: z.boolean().optional(),
    vascularInvasion: z.boolean().optional(),
    extrathyroidalExtension: z.boolean().optional(),
    notes: z.string().optional(),
  }).optional(),
  
  ctFindings: z.object({
    neckNodes: z.boolean().optional(),
    pulmonaryMetastases: z.boolean().optional(),
    mediastinalNodes: z.boolean().optional(),
    boneMetastases: z.boolean().optional(),
    otherFindings: z.string().optional(),
  }).optional(),
  
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
      twoHour: z.boolean().optional(),
      twoHourValue: z.number().optional(),
      twentyFourHour: z.boolean().optional(),
      twentyFourHourValue: z.number().optional(),
      normalRange: z.string().optional(),
    }).optional(),
    
    tc99mScan: z.object({
      performed: z.boolean().optional(),
      uptakeValue: z.number().optional(),
      timePoint: z.string().optional(),
      findings: z.string().optional(),
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
    clinical: z.string().optional(),
    tnm: z.string().optional(),
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
    const subscription = (control as any).watch?.((value: any) => {
      updateAssessment({ imaging: value as any })
    })
    return () => subscription?.unsubscribe?.()
  }, [control, updateAssessment])

  return (
    <div className="space-y-6">
      {/* USG Findings */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 USG Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="usg-remnant"
                checked={!!useWatch({ control, name: 'usgFindings.thyroidRemnant' })}
                onCheckedChange={(checked) => setValue('usgFindings.thyroidRemnant', checked as boolean)}
              />
              <Label htmlFor="usg-remnant" className="text-sm font-normal">
                Thyroid remnant present
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="usg-nodes"
                checked={!!useWatch({ control, name: 'usgFindings.suspiciousNodes' })}
                onCheckedChange={(checked) => setValue('usgFindings.suspiciousNodes', checked as boolean)}
              />
              <Label htmlFor="usg-nodes" className="text-sm font-normal">
                Suspicious lymph nodes
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="usg-vascular"
                checked={!!useWatch({ control, name: 'usgFindings.vascularInvasion' })}
                onCheckedChange={(checked) => setValue('usgFindings.vascularInvasion', checked as boolean)}
              />
              <Label htmlFor="usg-vascular" className="text-sm font-normal">
                Vascular invasion
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="usg-extension"
                checked={!!useWatch({ control, name: 'usgFindings.extrathyroidalExtension' })}
                onCheckedChange={(checked) => setValue('usgFindings.extrathyroidalExtension', checked as boolean)}
              />
              <Label htmlFor="usg-extension" className="text-sm font-normal">
                Extrathyroidal extension
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>USG Notes</Label>
            <Textarea
              {...register("usgFindings.notes")}
              placeholder="Additional USG findings, remnant size, node characteristics, etc."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* CT Findings */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 CT Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ct-neck"
                checked={!!useWatch({ control, name: 'ctFindings.neckNodes' })}
                onCheckedChange={(checked) => setValue('ctFindings.neckNodes', checked as boolean)}
              />
              <Label htmlFor="ct-neck" className="text-sm font-normal">
                Neck lymph nodes
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ct-pulmonary"
                checked={!!useWatch({ control, name: 'ctFindings.pulmonaryMetastases' })}
                onCheckedChange={(checked) => setValue('ctFindings.pulmonaryMetastases', checked as boolean)}
              />
              <Label htmlFor="ct-pulmonary" className="text-sm font-normal">
                Pulmonary metastases
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ct-mediastinal"
                checked={!!useWatch({ control, name: 'ctFindings.mediastinalNodes' })}
                onCheckedChange={(checked) => setValue('ctFindings.mediastinalNodes', checked as boolean)}
              />
              <Label htmlFor="ct-mediastinal" className="text-sm font-normal">
                Mediastinal nodes
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ct-bone"
                checked={!!useWatch({ control, name: 'ctFindings.boneMetastases' })}
                onCheckedChange={(checked) => setValue('ctFindings.boneMetastases', checked as boolean)}
              />
              <Label htmlFor="ct-bone" className="text-sm font-normal">
                Bone metastases
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>CT Other Findings</Label>
            <Textarea
              {...register("ctFindings.otherFindings")}
              placeholder="Other CT findings, distant metastases, structural abnormalities, etc."
              rows={2}
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
          <div className="space-y-4 p-4 border rounded-lg bg-green-50">
            <h5 className="font-medium text-green-800">RAIU (Radioactive Iodine Uptake)</h5>
            <div className="text-sm text-green-700 mb-3">
              <strong>Normal Values:</strong> 2-hour: 1-13% | 24-hour: 8-30% (Latest Guidelines 2024)
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="raiu-2h"
                    checked={!!useWatch({ control, name: 'nuclearMedicine.raiu.twoHour' })}
                    onCheckedChange={(checked) => setValue('nuclearMedicine.raiu.twoHour', checked as boolean)}
                  />
                  <Label htmlFor="raiu-2h" className="text-sm font-medium">2 Hour RAIU</Label>
                </div>
                {useWatch({ control, name: 'nuclearMedicine.raiu.twoHour' }) && (
                  <div className="ml-6">
                    <Label className="text-xs">Value (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Normal: 1-13%"
                      onChange={(e) => setValue('nuclearMedicine.raiu.twoHourValue', parseFloat(e.target.value))}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="raiu-24h"
                    checked={!!useWatch({ control, name: 'nuclearMedicine.raiu.twentyFourHour' })}
                    onCheckedChange={(checked) => setValue('nuclearMedicine.raiu.twentyFourHour', checked as boolean)}
                  />
                  <Label htmlFor="raiu-24h" className="text-sm font-medium">24 Hour RAIU</Label>
                </div>
                {useWatch({ control, name: 'nuclearMedicine.raiu.twentyFourHour' }) && (
                  <div className="ml-6">
                    <Label className="text-xs">Value (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Normal: 8-30%"
                      onChange={(e) => setValue('nuclearMedicine.raiu.twentyFourHourValue', parseFloat(e.target.value))}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tc99m Pertechnetate Uptake Scan */}
          <div className="space-y-4 p-4 border rounded-lg bg-purple-50">
            <h5 className="font-medium text-purple-800">Tc99m Pertechnetate Uptake Scan</h5>
            <div className="text-sm text-purple-700 mb-3">
              <strong>Alternative when RAIU not available</strong> - Usually performed at 20-30 minutes post-injection
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tc99m-performed"
                  checked={!!useWatch({ control, name: 'nuclearMedicine.tc99mScan.performed' })}
                  onCheckedChange={(checked) => setValue('nuclearMedicine.tc99mScan.performed', checked as boolean)}
                />
                <Label htmlFor="tc99m-performed" className="text-sm font-medium">
                  Tc99m Pertechnetate Scan Performed
                </Label>
              </div>

              {useWatch({ control, name: 'nuclearMedicine.tc99mScan.performed' }) && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Uptake Value (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 2.5"
                      onChange={(e) => setValue('nuclearMedicine.tc99mScan.uptakeValue', parseFloat(e.target.value))}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Time Point</Label>
                    <Input
                      placeholder="e.g., 20 minutes"
                      {...register("nuclearMedicine.tc99mScan.timePoint")}
                      className="text-sm"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm">Scan Findings</Label>
                    <Textarea
                      placeholder="Tc99m scan findings, uptake pattern, focal areas, etc."
                      {...register("nuclearMedicine.tc99mScan.findings")}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
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
              <Input
                {...register("staging.clinical")}
                placeholder="e.g., Stage I, II, III, or IV"
              />
            </div>

            <div className="space-y-2">
              <Label>TNM Staging</Label>
              <Input
                {...register("staging.tnm")}
                placeholder="e.g., T1N0M0, T3N1aM0"
              />
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
          <strong>Imaging & Nuclear Medicine Considerations:</strong> USG and CT findings help assess local disease extent 
          and metastases. RAIU values guide I-131 therapy planning (Normal: 2h: 1-13%, 24h: 8-30%). Tc99m scan serves as 
          alternative when RAIU unavailable. Comprehensive nuclear medicine evaluation determines optimal therapy protocols.
        </p>
      </div>
    </div>
  )
}