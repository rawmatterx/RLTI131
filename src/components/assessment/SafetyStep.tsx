"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { usePatientStore } from "@/src/store"

export function SafetyStep() {
  const { currentAssessment, updateAssessment } = usePatientStore()
  const [safety, setSafety] = useState({
    inpatient: currentAssessment.safety?.inpatient || false,
    isolationReady: currentAssessment.safety?.isolationReady || false,
    homeEnvironmentNotes: currentAssessment.safety?.homeEnvironmentNotes || "",
  })

  useEffect(() => {
    updateAssessment({ safety })
  }, [safety, updateAssessment])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inpatient"
            checked={safety.inpatient}
            onCheckedChange={(checked) => setSafety((prev) => ({ ...prev, inpatient: checked as boolean }))}
          />
          <Label htmlFor="inpatient" className="text-sm font-normal">
            Inpatient therapy required
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isolation-ready"
            checked={safety.isolationReady}
            onCheckedChange={(checked) => setSafety((prev) => ({ ...prev, isolationReady: checked as boolean }))}
          />
          <Label htmlFor="isolation-ready" className="text-sm font-normal">
            Isolation room prepared and available
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="home-environment">Home Environment Assessment</Label>
        <Textarea
          id="home-environment"
          placeholder="Describe home environment, family members, pets, work considerations, travel plans, etc."
          value={safety.homeEnvironmentNotes}
          onChange={(e) => setSafety((prev) => ({ ...prev, homeEnvironmentNotes: e.target.value }))}
          rows={4}
        />
      </div>

      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="font-medium text-orange-900 mb-2">Safety Considerations</h4>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• Isolation period typically 2-5 days depending on dose</li>
          <li>• Separate bathroom facilities recommended</li>
          <li>• Minimize contact with pregnant women and children</li>
          <li>• Consider work restrictions and travel limitations</li>
          <li>• Ensure adequate hydration and frequent urination</li>
        </ul>
      </div>
    </div>
  )
}
