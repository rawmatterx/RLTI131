"use client"

import { useEffect, useState } from "react"
import { patients as mockPatients, type Patient } from "@/data/patients"
import { PatientsTable } from "@/src/components/tables/PatientsTable"
import { PatientDetailSheet } from "@/components/patients/PatientDetailSheet"

export default function PatientsPage() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Patient | undefined>(undefined)
  const [rows, setRows] = useState<Patient[]>(mockPatients)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/patients", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load patients")
        const json = await res.json()
        const apiRows = Array.isArray(json?.data) ? json.data : []
        const mapped: Patient[] = apiRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          mrn: r.mrn,
          status: r.status,
          scheduledAt: r.scheduled_at ?? r.scheduledAt ?? new Date().toISOString(),
          therapy: r.therapy ?? "I-131",
          notes: r.notes ?? undefined,
        }))
        if (alive && mapped.length) setRows(mapped)
      } catch (_) {
        // ignore; fall back to mockPatients
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Patients{loading ? " (loading…)" : ""}</h1>
      <PatientsTable data={rows} onRowClick={(p) => { setSelected(p); setOpen(true) }} />
      <PatientDetailSheet open={open} onOpenChange={setOpen} patient={selected} />
    </div>
  )
}


