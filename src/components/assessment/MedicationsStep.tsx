"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { usePatientStore } from "@/src/store"
import type { Contraindication } from "@/src/types"

export function MedicationsStep() {
  const { currentAssessment, updateAssessment } = usePatientStore()
  const [contraindications, setContraindications] = useState<Contraindication[]>(
    currentAssessment.contraindications || [],
  )
  const [medications, setMedications] = useState("")

  useEffect(() => {
    updateAssessment({
      contraindications,
      medications,
    })
  }, [contraindications, medications, updateAssessment])

  const handleContraindicationChange = (contraindication: Contraindication, checked: boolean) => {
    if (checked) {
      setContraindications((prev) => [...prev, contraindication])
    } else {
      setContraindications((prev) => prev.filter((c) => c !== contraindication))
    }
  }

  const contraindicationOptions: { value: Contraindication; label: string; description: string }[] = [
    {
      value: "pregnancy",
      label: "Pregnancy",
      description: "Confirmed or suspected pregnancy",
    },
    {
      value: "breastfeeding",
      label: "Breastfeeding",
      description: "Currently breastfeeding",
    },
    {
      value: "recent-iodinated-contrast",
      label: "Recent Iodinated Contrast",
      description: "Iodinated contrast within 6-8 weeks",
    },
    {
      value: "severe-renal-impairment",
      label: "Severe Renal Impairment",
      description: "eGFR <30 mL/min/1.73m²",
    },
    {
      value: "uncontrolled-thyrotoxicosis",
      label: "Uncontrolled Thyrotoxicosis",
      description: "Active hyperthyroidism",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contraindications</h3>
        {contraindicationOptions.map((option) => (
          <div key={option.value} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={contraindications.includes(option.value)}
                onCheckedChange={(checked) => handleContraindicationChange(option.value, checked as boolean)}
              />
              <Label htmlFor={option.value} className="text-sm font-medium">
                {option.label}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">{option.description}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="medications">Current Medications</Label>
        <Textarea
          id="medications"
          placeholder="List current medications, especially those affecting thyroid function or iodine metabolism"
          value={medications}
          onChange={(e) => setMedications(e.target.value)}
          rows={4}
        />
      </div>

      {contraindications.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> {contraindications.length} contraindication(s) identified. Review carefully before
            proceeding with I-131 therapy.
          </p>
        </div>
      )}
    </div>
  )
}
