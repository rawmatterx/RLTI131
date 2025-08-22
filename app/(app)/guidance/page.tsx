import { DocCard } from "@/components/guidance/DocCard"

export default function GuidancePage() {
  const docs = [
    {
      title: "I-131 Isolation Room Preparation",
      summary:
        "Checklist and SOP for preparing isolation rooms including shielding, signage, and contamination controls.",
      evidence: ["NCRP-123", "IAEA-Safety", "Institution SOP"],
      lastReviewed: "Aug 2025",
    },
    {
      title: "Discharge Criteria & Safety",
      summary:
        "Guidance for discharge thresholds, contact precautions, and home-care instructions for caregivers.",
      evidence: ["IAEA-TecDoc", "ABNM Position"],
      lastReviewed: "Jul 2025",
    },
    {
      title: "Waste Handling SOP",
      summary:
        "Procedures for collection, storage, decay-in-storage, and documentation of radioactive waste.",
      evidence: ["AERB India", "IAEA-TRS"],
      lastReviewed: "Jun 2025",
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Guidance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((d) => (
          <DocCard key={d.title} {...d} />
        ))}
      </div>
    </div>
  )
}


