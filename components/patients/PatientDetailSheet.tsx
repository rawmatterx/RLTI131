"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { Patient } from "@/data/patients"

export function PatientDetailSheet({ open, onOpenChange, patient }: { open: boolean; onOpenChange: (v: boolean) => void; patient?: Patient }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{patient ? patient.name : "Patient"}</SheetTitle>
          <SheetDescription>MRN: {patient?.mrn} • ID: {patient?.id}</SheetDescription>
        </SheetHeader>
        {patient && (
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{patient.status}</Badge>
              <Badge>{patient.therapy}</Badge>
            </div>
            <div>
              <div className="text-zinc-500">Scheduled</div>
              <div className="font-medium">{new Date(patient.scheduledAt).toLocaleString()}</div>
            </div>
            {patient.notes && (
              <div>
                <div className="text-zinc-500">Notes</div>
                <div className="font-medium">{patient.notes}</div>
              </div>
            )}
            <div className="pt-2">
              <div className="text-zinc-500">Actions</div>
              <ul className="list-disc ml-5 space-y-1">
                <li>Mark labs complete</li>
                <li>Add checklist item</li>
                <li>Export summary</li>
              </ul>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}


