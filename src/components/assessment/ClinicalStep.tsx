"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePatientStore } from "@/src/store"
import { useEffect, useState } from "react"
import { Plus, Minus } from "lucide-react"

const clinicalSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  priorI131: z.boolean().optional(),
  thyroidectomy: z.enum(["total", "near_total", "partial", "none"]).optional(),
  
  // Surgical Information
  surgicalInformation: z.object({
    procedure: z.enum(["no_sx", "nodulectomy", "HT", "STT", "TT", "other"]).optional(),
    hospital: z.string().optional(),
    place: z.string().optional(),
    date: z.string().optional(),
    otherProcedure: z.string().optional(),
  }).optional(),
  
  // Node Information
  nodeInformation: z.object({
    present: z.boolean().optional(),
    nodeSampling: z.boolean().optional(),
    fnd: z.boolean().optional(),
    rnd: z.boolean().optional(),
    other: z.string().optional(),
  }).optional(),
  
  // Invasion Details
  invasion: z.object({
    capsular: z.boolean().optional(),
    vascular: z.boolean().optional(),
    other: z.boolean().optional(),
    nodule: z.string().optional(),
    otherLobe: z.string().optional(),
  }).optional(),
  
  // Retrosternal Extension
  retrosternalExtension: z.object({
    esophagus: z.boolean().optional(),
    carotids: z.boolean().optional(),
    muscle: z.boolean().optional(),
    jugular: z.boolean().optional(),
    trachea: z.boolean().optional(),
    other: z.boolean().optional(),
  }).optional(),
  
  // Histopathology
  histopathology: z.object({
    hpeNo: z.string().optional(),
    type: z.enum(["papillary", "hurthle_cell", "medullary", "follicular", "insular", "anaplastic"]).optional(),
    otherFindings: z.object({
      nodalStatus: z.boolean().optional(),
      tumorSize: z.string().optional(),
      immunostaining: z.boolean().optional(),
    }).optional(),
  }).optional(),
  
  // Previous RAI
  previousRAI: z.object({
    hasReceived: z.boolean().optional(),
    cumulativeDose: z.number().optional(),
    totalTreatments: z.number().optional(),
  }).optional(),
  
  // Family History
  familyHistory: z.object({
    thyroidCancer: z.boolean().optional(),
    goiter: z.boolean().optional(),
    hypo: z.boolean().optional(),
    hyper: z.boolean().optional(),
    brother: z.boolean().optional(),
    sister: z.boolean().optional(),
    other: z.boolean().optional(),
  }).optional(),
  
  // Past History
  pastHistory: z.object({
    affectedRelation: z.string().optional(),
    noncontributory: z.boolean().optional(),
    hcAbdominal: z.boolean().optional(),
    hcHeadNeck: z.boolean().optional(),
    hcAnother: z.boolean().optional(),
    hcTBDMHTBAEP: z.boolean().optional(),
    drugAllergy: z.boolean().optional(),
  }).optional(),
})

type ClinicalForm = z.infer<typeof clinicalSchema>

export function ClinicalStep({ resetToken }: { resetToken?: number }) {
  const { currentAssessment, updateAssessment } = usePatientStore()
  const [raiTreatments, setRaiTreatments] = useState<Array<{
    date: string
    dose: number
    indication: string
    hospital: string
    notes: string
  }>>([])

  const {
    register,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<ClinicalForm>({
    resolver: zodResolver(clinicalSchema),
    defaultValues: currentAssessment.clinical || {},
  })

  // Reset form when resetToken changes
  useEffect(() => {
    if (resetToken) {
      reset({})
      setRaiTreatments([])
    }
  }, [resetToken, reset])

  useEffect(() => {
    const subscription = control.watch((value) => {
      const updatedClinical = {
        ...value,
        previousRAI: {
          ...value.previousRAI,
          treatments: raiTreatments,
        }
      }
      updateAssessment({ clinical: updatedClinical as any })
    })
    return () => subscription.unsubscribe()
  }, [control, updateAssessment, raiTreatments])

  const hasReceivedRAI = useWatch({ control, name: 'previousRAI.hasReceived' })
  const surgicalProcedure = useWatch({ control, name: 'surgicalInformation.procedure' })

  const addRAITreatment = () => {
    setRaiTreatments([...raiTreatments, {
      date: '',
      dose: 0,
      indication: '',
      hospital: '',
      notes: ''
    }])
  }

  const removeRAITreatment = (index: number) => {
    setRaiTreatments(raiTreatments.filter((_, i) => i !== index))
  }

  const updateRAITreatment = (index: number, field: string, value: any) => {
    const updated = [...raiTreatments]
    updated[index] = { ...updated[index], [field]: value }
    setRaiTreatments(updated)
    
    // Calculate cumulative dose
    const totalDose = updated.reduce((sum, treatment) => sum + (treatment.dose || 0), 0)
    setValue('previousRAI.cumulativeDose', totalDose)
    setValue('previousRAI.totalTreatments', updated.length)
  }

  return (
    <div className="space-y-6">
      {/* Basic Clinical Information */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Basic Clinical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label>Thyroidectomy Status</Label>
            <Select
              value={useWatch({ control, name: 'thyroidectomy' })}
              onValueChange={(value) => setValue("thyroidectomy", value as any)}
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
        </CardContent>
      </Card>

      {/* Surgical Procedure Details */}
      <Card>
        <CardHeader>
          <CardTitle>🏥 Surgical Procedure Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Surgical Procedure</Label>
              <Select
                value={surgicalProcedure}
                onValueChange={(value) => setValue("surgicalInformation.procedure", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select procedure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_sx">No Surgery</SelectItem>
                  <SelectItem value="nodulectomy">Nodulectomy</SelectItem>
                  <SelectItem value="HT">Hemithyroidectomy</SelectItem>
                  <SelectItem value="STT">Subtotal Thyroidectomy</SelectItem>
                  <SelectItem value="TT">Total Thyroidectomy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hospital</Label>
              <Input {...register("surgicalInformation.hospital")} placeholder="Hospital name" />
            </div>

            <div className="space-y-2">
              <Label>Place</Label>
              <Input {...register("surgicalInformation.place")} placeholder="Location" />
            </div>

            <div className="space-y-2">
              <Label>Surgery Date</Label>
              <Input {...register("surgicalInformation.date")} type="date" />
            </div>
          </div>

          {surgicalProcedure === 'other' && (
            <div className="space-y-2">
              <Label>Other Procedure Details</Label>
              <Input {...register("surgicalInformation.otherProcedure")} placeholder="Describe other procedure" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Node Information */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Lymph Node Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="nodes-present"
                checked={!!useWatch({ control, name: 'nodeInformation.present' })}
                onCheckedChange={(checked) => setValue('nodeInformation.present', checked as boolean)}
              />
              <Label htmlFor="nodes-present" className="text-sm">Nodes Present</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="node-sampling"
                checked={!!useWatch({ control, name: 'nodeInformation.nodeSampling' })}
                onCheckedChange={(checked) => setValue('nodeInformation.nodeSampling', checked as boolean)}
              />
              <Label htmlFor="node-sampling" className="text-sm">Node Sampling</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="fnd"
                checked={!!useWatch({ control, name: 'nodeInformation.fnd' })}
                onCheckedChange={(checked) => setValue('nodeInformation.fnd', checked as boolean)}
              />
              <Label htmlFor="fnd" className="text-sm">FND (Functional Neck Dissection)</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="rnd"
                checked={!!useWatch({ control, name: 'nodeInformation.rnd' })}
                onCheckedChange={(checked) => setValue('nodeInformation.rnd', checked as boolean)}
              />
              <Label htmlFor="rnd" className="text-sm">RND (Radical Neck Dissection)</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Other Node Information</Label>
            <Input {...register("nodeInformation.other")} placeholder="Additional node details" />
          </div>
        </CardContent>
      </Card>

      {/* Histopathology */}
      <Card>
        <CardHeader>
          <CardTitle>🔬 Histopathological Examination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>HPE Number</Label>
              <Input {...register("histopathology.hpeNo")} placeholder="Histopathology number" />
            </div>

            <div className="space-y-2">
              <Label>Histological Type</Label>
              <Select
                value={useWatch({ control, name: 'histopathology.type' })}
                onValueChange={(value) => setValue("histopathology.type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="papillary">Papillary</SelectItem>
                  <SelectItem value="follicular">Follicular</SelectItem>
                  <SelectItem value="hurthle_cell">Hurthle Cell</SelectItem>
                  <SelectItem value="medullary">Medullary</SelectItem>
                  <SelectItem value="insular">Insular</SelectItem>
                  <SelectItem value="anaplastic">Anaplastic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tumor Size</Label>
              <Input {...register("histopathology.otherFindings.tumorSize")} placeholder="e.g., 2.5 cm" />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="nodal-status"
                checked={!!useWatch({ control, name: 'histopathology.otherFindings.nodalStatus' })}
                onCheckedChange={(checked) => setValue('histopathology.otherFindings.nodalStatus', checked as boolean)}
              />
              <Label htmlFor="nodal-status" className="text-sm">Positive Nodal Status</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="immunostaining"
                checked={!!useWatch({ control, name: 'histopathology.otherFindings.immunostaining' })}
                onCheckedChange={(checked) => setValue('histopathology.otherFindings.immunostaining', checked as boolean)}
              />
              <Label htmlFor="immunostaining" className="text-sm">Immunostaining Performed</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous RAI Treatment */}
      <Card>
        <CardHeader>
          <CardTitle>☢️ Previous RAI Treatment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="has-received-rai"
              checked={!!hasReceivedRAI}
              onCheckedChange={(checked) => setValue('previousRAI.hasReceived', checked as boolean)}
            />
            <Label htmlFor="has-received-rai" className="text-sm font-medium">
              Patient has received previous RAI therapy
            </Label>
          </div>

          {hasReceivedRAI && (
            <div className="space-y-4 border-l-4 border-blue-200 pl-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Treatment Details</h4>
                <Button onClick={addRAITreatment} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Treatment
                </Button>
              </div>

              {raiTreatments.map((treatment, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium">Treatment #{index + 1}</h5>
                    <Button 
                      onClick={() => removeRAITreatment(index)} 
                      size="sm" 
                      variant="destructive"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={treatment.date}
                        onChange={(e) => updateRAITreatment(index, 'date', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Dose (mCi)</Label>
                      <Input
                        type="number"
                        value={treatment.dose}
                        onChange={(e) => updateRAITreatment(index, 'dose', parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 100"
                      />
                    </div>

                    <div>
                      <Label>Indication</Label>
                      <Select
                        value={treatment.indication}
                        onValueChange={(value) => updateRAITreatment(index, 'indication', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select indication" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remnant_ablation">Remnant Ablation</SelectItem>
                          <SelectItem value="lobar_ablation">Lobar Ablation</SelectItem>
                          <SelectItem value="neck_nodes">Neck Nodes</SelectItem>
                          <SelectItem value="pulm_mets">Pulmonary Metastases</SelectItem>
                          <SelectItem value="skeletal_mets">Skeletal Metastases</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Hospital</Label>
                      <Input
                        value={treatment.hospital}
                        onChange={(e) => updateRAITreatment(index, 'hospital', e.target.value)}
                        placeholder="Hospital name"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={treatment.notes}
                        onChange={(e) => updateRAITreatment(index, 'notes', e.target.value)}
                        placeholder="Additional notes about this treatment"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {raiTreatments.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Treatments</Label>
                      <Input
                        value={raiTreatments.length}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label>Cumulative Dose (mCi)</Label>
                      <Input
                        value={raiTreatments.reduce((sum, t) => sum + (t.dose || 0), 0)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family History */}
      <Card>
        <CardHeader>
          <CardTitle>👨‍👩‍👧‍👦 Family History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="fh-thyroid-cancer"
                checked={!!useWatch({ control, name: 'familyHistory.thyroidCancer' })}
                onCheckedChange={(checked) => setValue('familyHistory.thyroidCancer', checked as boolean)}
              />
              <Label htmlFor="fh-thyroid-cancer" className="text-sm">Thyroid Cancer</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="fh-goiter"
                checked={!!useWatch({ control, name: 'familyHistory.goiter' })}
                onCheckedChange={(checked) => setValue('familyHistory.goiter', checked as boolean)}
              />
              <Label htmlFor="fh-goiter" className="text-sm">Goiter</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="fh-hypo"
                checked={!!useWatch({ control, name: 'familyHistory.hypo' })}
                onCheckedChange={(checked) => setValue('familyHistory.hypo', checked as boolean)}
              />
              <Label htmlFor="fh-hypo" className="text-sm">Hypothyroidism</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="fh-hyper"
                checked={!!useWatch({ control, name: 'familyHistory.hyper' })}
                onCheckedChange={(checked) => setValue('familyHistory.hyper', checked as boolean)}
              />
              <Label htmlFor="fh-hyper" className="text-sm">Hyperthyroidism</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="fh-brother"
                checked={!!useWatch({ control, name: 'familyHistory.brother' })}
                onCheckedChange={(checked) => setValue('familyHistory.brother', checked as boolean)}
              />
              <Label htmlFor="fh-brother" className="text-sm">Brother Affected</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="fh-sister"
                checked={!!useWatch({ control, name: 'familyHistory.sister' })}
                onCheckedChange={(checked) => setValue('familyHistory.sister', checked as boolean)}
              />
              <Label htmlFor="fh-sister" className="text-sm">Sister Affected</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Clinical Context:</strong> Comprehensive clinical information helps determine appropriate I-131 therapy 
          protocols, dosing considerations, and follow-up strategies. Previous RAI treatment history is crucial for 
          cumulative dose tracking and treatment planning.
        </p>
      </div>
    </div>
  )
}