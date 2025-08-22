"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { usePatientStore } from "@/src/store"

export function ImagingStep() {
  const { currentAssessment, updateAssessment } = usePatientStore()
  const [imagingFlags, setImagingFlags] = useState({
    metastatic: false,
    remnant: false,
    notes: "",
  })

  useEffect(() => {
    updateAssessment({
      imaging: imagingFlags,
    })
  }, [imagingFlags, updateAssessment])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="metastatic"
            checked={imagingFlags.metastatic}
            onCheckedChange={(checked) => setImagingFlags((prev) => ({ ...prev, metastatic: checked as boolean }))}
          />
          <Label htmlFor="metastatic" className="text-sm font-normal">
            Metastatic disease present
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remnant"
            checked={imagingFlags.remnant}
            onCheckedChange={(checked) => setImagingFlags((prev) => ({ ...prev, remnant: checked as boolean }))}
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
          placeholder="Additional imaging findings, locations of metastases, remnant size, etc."
          value={imagingFlags.notes}
          onChange={(e) => setImagingFlags((prev) => ({ ...prev, notes: e.target.value }))}
          rows={4}
        />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Imaging Considerations:</strong> Presence of metastatic disease may require higher I-131 doses.
          Remnant tissue should be considered for ablation protocols.
        </p>
      </div>
    </div>
  )
}
