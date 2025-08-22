"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { usePatientStore } from "@/src/store"

export function PreparationStep() {
  const { currentAssessment, updateAssessment } = usePatientStore()
  const [prep, setPrep] = useState({
    path: currentAssessment.prep?.path || null,
    startDate: currentAssessment.prep?.startDate || "",
    lowIodineDiet: currentAssessment.prep?.lowIodineDiet || false,
  })

  useEffect(() => {
    updateAssessment({ prep })
  }, [prep, updateAssessment])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prep-path">Preparation Pathway</Label>
        <Select
          onValueChange={(value) => setPrep((prev) => ({ ...prev, path: value as "withdrawal" | "rhTSH" }))}
          defaultValue={prep.path || undefined}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preparation method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="withdrawal">Thyroid Hormone Withdrawal</SelectItem>
            <SelectItem value="rhTSH">rhTSH (Thyrogen) Stimulation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="start-date">Preparation Start Date</Label>
        <Input
          id="start-date"
          type="date"
          value={prep.startDate}
          onChange={(e) => setPrep((prev) => ({ ...prev, startDate: e.target.value }))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="low-iodine-diet"
          checked={prep.lowIodineDiet}
          onCheckedChange={(checked) => setPrep((prev) => ({ ...prev, lowIodineDiet: checked as boolean }))}
        />
        <Label htmlFor="low-iodine-diet" className="text-sm font-normal">
          Low-iodine diet initiated
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Withdrawal Protocol</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Stop T4 4-6 weeks before</li>
            <li>• Stop T3 2 weeks before</li>
            <li>• Target TSH &gt;30 mIU/L</li>
            <li>• Low-iodine diet 1-2 weeks</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">rhTSH Protocol</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Continue thyroid hormone</li>
            <li>• rhTSH 0.9mg IM x2 days</li>
            <li>• I-131 24h after last injection</li>
            <li>• Low-iodine diet 1-2 weeks</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
