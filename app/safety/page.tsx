"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, FilePenLineIcon as Signature } from "lucide-react"
import Link from "next/link"
import { useSessionStore } from "@/src/store"

interface ChecklistItem {
  id: string
  title: string
  description: string
  required: boolean
  completed: boolean
  notes?: string
}

interface SafetyChecklist {
  id: string
  title: string
  description: string
  items: ChecklistItem[]
}

const safetyChecklists: SafetyChecklist[] = [
  {
    id: "pregnancy-verification",
    title: "Pregnancy Test Verification",
    description: "Mandatory pregnancy screening for women of childbearing age",
    items: [
      {
        id: "age-check",
        title: "Age Assessment",
        description: "Verify patient age and childbearing potential",
        required: true,
        completed: false,
      },
      {
        id: "hcg-ordered",
        title: "β-hCG Test Ordered",
        description: "Laboratory β-hCG test requisitioned",
        required: true,
        completed: false,
      },
      {
        id: "hcg-result",
        title: "β-hCG Result Reviewed",
        description: "Negative pregnancy test result confirmed",
        required: true,
        completed: false,
      },
      {
        id: "patient-counseling",
        title: "Patient Counseling",
        description: "Discussed pregnancy risks and contraception",
        required: true,
        completed: false,
      },
    ],
  },
  {
    id: "isolation-room",
    title: "Isolation Room Preparation",
    description: "Radiation safety room setup and verification",
    items: [
      {
        id: "room-survey",
        title: "Room Radiation Survey",
        description: "Background radiation levels measured and documented",
        required: true,
        completed: false,
      },
      {
        id: "shielding-check",
        title: "Shielding Verification",
        description: "Lead shielding and room barriers inspected",
        required: true,
        completed: false,
      },
      {
        id: "supplies-stocked",
        title: "Supplies Stocked",
        description: "Disposable items, PPE, and monitoring equipment ready",
        required: true,
        completed: false,
      },
      {
        id: "signage-posted",
        title: "Warning Signage Posted",
        description: "Radiation area signs and access restrictions displayed",
        required: true,
        completed: false,
      },
      {
        id: "waste-containers",
        title: "Waste Containers Ready",
        description: "Radioactive waste collection containers positioned",
        required: true,
        completed: false,
      },
    ],
  },
  {
    id: "waste-handling",
    title: "Radioactive Waste Handling",
    description: "Proper collection, storage, and disposal procedures",
    items: [
      {
        id: "collection-setup",
        title: "Collection System Setup",
        description: "Separate containers for different waste types prepared",
        required: true,
        completed: false,
      },
      {
        id: "labeling-system",
        title: "Labeling System Ready",
        description: "Radioactive waste labels and documentation forms available",
        required: true,
        completed: false,
      },
      {
        id: "storage-area",
        title: "Storage Area Prepared",
        description: "Designated decay-in-storage area ready for waste",
        required: true,
        completed: false,
      },
      {
        id: "staff-training",
        title: "Staff Training Verified",
        description: "All handling staff current on radiation safety training",
        required: true,
        completed: false,
      },
    ],
  },
  {
    id: "discharge-instructions",
    title: "Discharge Instructions",
    description: "Patient education and safety instructions for home care",
    items: [
      {
        id: "written-instructions",
        title: "Written Instructions Provided",
        description: "Comprehensive discharge instructions given to patient",
        required: true,
        completed: false,
      },
      {
        id: "isolation-period",
        title: "Isolation Period Explained",
        description: "Duration and requirements of home isolation discussed",
        required: true,
        completed: false,
      },
      {
        id: "contact-precautions",
        title: "Contact Precautions Reviewed",
        description: "Distance requirements from others, especially children/pregnant women",
        required: true,
        completed: false,
      },
      {
        id: "emergency-contacts",
        title: "Emergency Contacts Provided",
        description: "24-hour contact information for questions or emergencies",
        required: true,
        completed: false,
      },
      {
        id: "followup-scheduled",
        title: "Follow-up Scheduled",
        description: "Next appointment and monitoring plan arranged",
        required: true,
        completed: false,
      },
    ],
  },
]

export default function SafetyPage() {
  const [checklists, setChecklists] = useState(safetyChecklists)
  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(null)
  const [signatureData, setSignatureData] = useState({
    staffName: "",
    staffId: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const { addTimelineEvent } = useSessionStore()

  const updateChecklistItem = (checklistId: string, itemId: string, completed: boolean, notes?: string) => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) => (item.id === itemId ? { ...item, completed, notes } : item)),
            }
          : checklist,
      ),
    )
  }

  const getChecklistProgress = (checklist: SafetyChecklist) => {
    const completed = checklist.items.filter((item) => item.completed).length
    const total = checklist.items.length
    return { completed, total, percentage: (completed / total) * 100 }
  }

  const handleSignOff = (checklistId: string) => {
    const checklist = checklists.find((c) => c.id === checklistId)
    if (!checklist) return

    const progress = getChecklistProgress(checklist)
    if (progress.completed !== progress.total) {
      alert("Please complete all required items before signing off.")
      return
    }

    // Add to session timeline
    addTimelineEvent({
      type: "note_added",
      description: `Safety checklist completed: ${checklist.title}`,
      data: {
        checklist: checklist.title,
        signedBy: signatureData.staffName,
        staffId: signatureData.staffId,
        completedItems: progress.completed,
        notes: signatureData.notes,
      },
    })

    alert("Checklist signed off successfully!")
  }

  const selectedChecklistData = selectedChecklist ? checklists.find((c) => c.id === selectedChecklist) : null

  if (selectedChecklistData) {
    const progress = getChecklistProgress(selectedChecklistData)

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedChecklist(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Safety Center
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-primary">{selectedChecklistData.title}</h1>
                  <p className="text-sm text-muted-foreground">{selectedChecklistData.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={
                    progress.percentage === 100
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }
                >
                  {progress.completed}/{progress.total} Complete
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Checklist Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checklist Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Checklist Items</CardTitle>
                  <CardDescription>Complete all required safety verification steps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedChecklistData.items.map((item) => (
                      <div key={item.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={item.id}
                            checked={item.completed}
                            onCheckedChange={(checked) =>
                              updateChecklistItem(selectedChecklistData.id, item.id, checked as boolean, item.notes)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label htmlFor={item.id} className="font-medium text-foreground">
                              {item.title}
                              {item.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            <div className="mt-3">
                              <Label htmlFor={`${item.id}-notes`} className="text-sm">
                                Notes (optional)
                              </Label>
                              <Textarea
                                id={`${item.id}-notes`}
                                placeholder="Add any relevant notes..."
                                value={item.notes || ""}
                                onChange={(e) =>
                                  updateChecklistItem(selectedChecklistData.id, item.id, item.completed, e.target.value)
                                }
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sign-off Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Signature className="h-5 w-5" />
                    Digital Sign-off
                  </CardTitle>
                  <CardDescription>Complete and sign the safety checklist</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-name">Staff Name *</Label>
                    <Input
                      id="staff-name"
                      value={signatureData.staffName}
                      onChange={(e) => setSignatureData((prev) => ({ ...prev, staffName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staff-id">Staff ID *</Label>
                    <Input
                      id="staff-id"
                      value={signatureData.staffId}
                      onChange={(e) => setSignatureData((prev) => ({ ...prev, staffId: e.target.value }))}
                      placeholder="Enter your staff ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sign-date">Date</Label>
                    <Input
                      id="sign-date"
                      type="date"
                      value={signatureData.date}
                      onChange={(e) => setSignatureData((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sign-notes">Additional Notes</Label>
                    <Textarea
                      id="sign-notes"
                      value={signatureData.notes}
                      onChange={(e) => setSignatureData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional comments..."
                      rows={3}
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button
                      onClick={() => handleSignOff(selectedChecklistData.id)}
                      disabled={progress.percentage !== 100 || !signatureData.staffName || !signatureData.staffId}
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sign Off Checklist
                    </Button>
                    {progress.percentage !== 100 && (
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        Complete all items to enable sign-off
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-primary">Safety Center</h1>
                <p className="text-sm text-muted-foreground">Radiation safety checklists and procedures</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              {checklists.length} Checklists
            </Badge>
          </div>
        </div>
      </header>

      {/* Safety Checklists */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {checklists.map((checklist) => {
            const progress = getChecklistProgress(checklist)
            return (
              <Card key={checklist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-accent" />
                      <Badge
                        variant="outline"
                        className={
                          progress.percentage === 100
                            ? "bg-green-100 text-green-800 border-green-200"
                            : progress.percentage > 0
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {progress.completed}/{progress.total}
                      </Badge>
                    </div>
                    {progress.percentage === 100 && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <CardTitle className="text-lg">{checklist.title}</CardTitle>
                  <CardDescription>{checklist.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progress.percentage === 100
                            ? "bg-green-600"
                            : progress.percentage > 0
                              ? "bg-yellow-600"
                              : "bg-gray-400"
                        }`}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{progress.percentage.toFixed(0)}% Complete</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedChecklist(checklist.id)}
                        className="bg-transparent"
                      >
                        {progress.percentage === 100 ? "Review" : "Complete"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Safety Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Important Safety Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-foreground mb-2">Regulatory Compliance</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All checklists must be completed before therapy administration</li>
                  <li>• Digital sign-offs are legally binding and auditable</li>
                  <li>• Documentation is retained per institutional policy</li>
                  <li>• Regular safety training is required for all staff</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Emergency Procedures</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Radiation Safety Officer: Ext. 2345</li>
                  <li>• Nuclear Medicine: Ext. 3456</li>
                  <li>• Emergency Response: 911</li>
                  <li>• After-hours support: 555-0123</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
