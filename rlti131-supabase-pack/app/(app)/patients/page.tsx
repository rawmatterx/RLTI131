
"use client";
import { useState } from "react";
import { PatientsTable, Patient } from "@/components/tables/PatientsTable";
import { PatientDetailSheet } from "@/components/patients/PatientDetailSheet";

export default function PatientsPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Patient | undefined>(undefined);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Patients</h1>
      <PatientsTable
        onRowClick={(p) => { setSelected(p); setOpen(true); }}
      />
      <PatientDetailSheet open={open} onOpenChange={setOpen} patient={selected} />
    </div>
  );
}
