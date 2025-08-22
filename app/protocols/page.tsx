"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Filter, Download, BookOpen, FileText, Users } from "lucide-react"
import Link from "next/link"

interface Protocol {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  clinicianView: string
  patientHandout: string
  lastUpdated: string
}

const mockProtocols: Protocol[] = [
  {
    id: "wbs-prep",
    title: "Whole Body Scan Preparation",
    category: "Preparation",
    description: "Pre-scan preparation protocol for diagnostic I-131 whole body scanning",
    tags: ["diagnostic", "preparation", "outpatient"],
    lastUpdated: "2024-01-15",
    clinicianView: `# Whole Body Scan Preparation Protocol

## Pre-scan Requirements
1. **Thyroid Hormone Withdrawal**
   - Discontinue T4 (levothyroxine) 4-6 weeks prior
   - Discontinue T3 (liothyronine) 2 weeks prior
   - Target TSH >30 mIU/L

2. **Low-Iodine Diet**
   - Initiate 1-2 weeks before scan
   - Provide patient education materials
   - Verify compliance at appointment

3. **Laboratory Studies**
   - TSH level within 1 week of scan
   - β-hCG if applicable
   - Thyroglobulin and TgAb

## Day of Scan
- Verify NPO status (2+ hours)
- Confirm pregnancy test results
- Administer diagnostic I-131 dose (1-5 mCi)
- Schedule return for imaging (24-72 hours)

## Post-scan Instructions
- Resume normal diet after imaging
- Restart thyroid hormone therapy
- Schedule follow-up as indicated`,
    patientHandout: `# Preparing for Your Thyroid Scan

## Before Your Scan

### Stop Your Thyroid Medicine
- **Synthroid/Levothyroxine**: Stop 4-6 weeks before your scan
- **Cytomel/Liothyronine**: Stop 2 weeks before your scan
- Your doctor will tell you exactly when to stop

### Follow a Low-Iodine Diet
- Start this special diet 1-2 weeks before your scan
- Avoid: seafood, dairy, iodized salt, processed foods
- You will receive a detailed food list

### Blood Tests
- You will need blood tests before your scan
- Women may need a pregnancy test

## Day of Your Scan
- Do not eat or drink for 2 hours before
- Take the radioactive iodine pill
- Return in 1-3 days for pictures

## After Your Scan
- You can eat normally after the pictures
- Restart your thyroid medicine as directed
- Your doctor will discuss results with you

**Questions?** Call our office at any time.`,
  },
  {
    id: "ablation-low",
    title: "Low-Dose Ablation Protocol",
    category: "Treatment",
    description: "30 mCi I-131 ablation protocol for low-risk differentiated thyroid cancer",
    tags: ["treatment", "low-risk", "outpatient"],
    lastUpdated: "2024-01-10",
    clinicianView: `# Low-Dose I-131 Ablation Protocol (30 mCi)

## Patient Selection Criteria
- Low-risk differentiated thyroid cancer
- Total or near-total thyroidectomy
- No distant metastases
- Tumor size <4 cm
- No aggressive histology

## Pre-treatment Preparation
1. **TSH Stimulation**
   - Option 1: Thyroid hormone withdrawal (4-6 weeks T4, 2 weeks T3)
   - Option 2: rhTSH stimulation (preferred in elderly/cardiac patients)

2. **Low-Iodine Diet**
   - 10-14 days duration
   - Patient education and compliance verification

3. **Laboratory Studies**
   - TSH >30 mIU/L
   - Pregnancy test (if applicable)
   - Baseline Tg and TgAb

## Treatment Day
- Verify preparation compliance
- Confirm pregnancy status
- Administer 30 mCi I-131 orally
- Provide radiation safety instructions
- Schedule follow-up

## Post-treatment Care
- Outpatient isolation (2-3 days typical)
- Hydration and frequent urination
- Restart thyroid hormone (24-48 hours post-dose)
- Follow-up scan in 5-7 days`,
    patientHandout: `# Your Low-Dose Radioiodine Treatment

## What to Expect

You will receive a small amount of radioactive iodine (I-131) to destroy any remaining thyroid tissue after your surgery.

## Before Treatment
- Follow the low-iodine diet as instructed
- Stop thyroid medicine or receive Thyrogen shots
- Complete required blood tests

## Treatment Day
- Take the radioactive iodine pill
- Receive safety instructions
- Go home the same day

## After Treatment (First 2-3 Days)
### At Home Safety
- Stay home and limit visitors
- Sleep alone if possible
- Use separate bathroom if available
- Drink plenty of water
- Wash hands frequently

### Who to Avoid
- Pregnant women
- Children under 18
- Anyone for extended periods

## Returning to Normal
- Most restrictions lift after 2-3 days
- Return to work when cleared by your doctor
- Restart thyroid medicine as directed

## Follow-up
- Scan in about 1 week
- Blood tests in 6-12 months
- Regular check-ups as scheduled

**Emergency Contact:** [Hospital Number]`,
  },
  {
    id: "ablation-high",
    title: "High-Dose Ablation Protocol",
    category: "Treatment",
    description: "100-150 mCi I-131 ablation for intermediate/high-risk patients",
    tags: ["treatment", "high-risk", "inpatient"],
    lastUpdated: "2024-01-08",
    clinicianView: `# High-Dose I-131 Ablation Protocol (100-150 mCi)

## Patient Selection Criteria
- Intermediate to high-risk differentiated thyroid cancer
- Gross extrathyroidal extension
- Aggressive histology variants
- Significant nodal involvement
- Distant metastases

## Pre-treatment Evaluation
1. **Multidisciplinary Review**
   - Endocrinology consultation
   - Nuclear medicine evaluation
   - Radiation safety assessment

2. **Preparation Protocol**
   - TSH stimulation (withdrawal vs rhTSH)
   - Extended low-iodine diet (14 days)
   - Comprehensive laboratory panel

3. **Dosimetry Considerations**
   - Blood dosimetry if indicated
   - Pulmonary function assessment
   - Renal function evaluation

## Treatment Administration
- Inpatient isolation required
- Lead-lined room preparation
- Dose administration by authorized personnel
- Continuous radiation monitoring

## Post-treatment Management
- Isolation period: 3-5 days typical
- Daily radiation surveys
- Discharge criteria: <7 mR/hr at 1 meter
- Comprehensive discharge instructions

## Follow-up Protocol
- Post-therapy scan (5-7 days)
- Stimulated Tg at 6-12 months
- Cross-sectional imaging as indicated
- Long-term surveillance plan`,
    patientHandout: `# Your High-Dose Radioiodine Treatment

## Hospital Stay Required

You will need to stay in the hospital for 3-5 days after your treatment for safety reasons.

## Before Coming to Hospital
- Follow low-iodine diet for 2 weeks
- Complete all preparation steps
- Arrange for someone to drive you home
- Pack comfortable clothes and entertainment

## During Your Hospital Stay
### Your Room
- Special room designed for radiation safety
- Limited visitors (short visits only)
- Nursing staff will check on you regularly

### Daily Routine
- Take radiation measurements each day
- Drink lots of water
- Walk around your room for exercise
- Entertainment: books, tablet, phone calls

### Safety Measures
- Staff will wear protective equipment
- Your belongings may need to stay in room
- Special handling of waste and linens

## Going Home
You can go home when radiation levels are safe (usually 3-5 days).

## At Home After Discharge
### First Week
- Continue drinking plenty of water
- Limit close contact with others
- Sleep alone
- Avoid public transportation

### Returning to Normal
- Most activities resume after 1 week
- Work restrictions may apply
- Follow-up appointments are important

## Important Numbers
- Hospital: [Number]
- Doctor's Office: [Number]
- Emergency: 911`,
  },
  {
    id: "safety-inpatient",
    title: "Inpatient Safety Protocol",
    category: "Safety",
    description: "Radiation safety procedures for inpatient I-131 therapy",
    tags: ["safety", "inpatient", "radiation"],
    lastUpdated: "2024-01-12",
    clinicianView: `# Inpatient I-131 Radiation Safety Protocol

## Room Preparation
1. **Isolation Room Requirements**
   - Lead-lined or adequate shielding
   - Private bathroom facilities
   - Restricted access signage
   - Radiation monitoring equipment

2. **Supplies and Equipment**
   - Disposable items when possible
   - Lead aprons for staff
   - Survey meters calibrated
   - Waste containers (radioactive)

## Staff Safety Procedures
1. **ALARA Principles**
   - Time: Minimize exposure duration
   - Distance: Maintain maximum distance
   - Shielding: Use appropriate protection

2. **Personal Protective Equipment**
   - Lead aprons during patient care
   - Disposable gloves and shoe covers
   - Dosimetry badges required

3. **Patient Care Guidelines**
   - Essential care only
   - Minimize time in room (<30 min/shift)
   - Maintain 6-foot distance when possible

## Waste Management
- All patient waste considered radioactive
- Separate collection and storage
- Decay-in-storage protocol
- Documentation requirements

## Discharge Criteria
- Dose rate <7 mR/hr at 1 meter
- Patient education completed
- Written instructions provided
- Follow-up scheduled`,
    patientHandout: `# Hospital Safety Information

## Why These Precautions?

The radioactive iodine in your body gives off radiation that could affect others. These safety steps protect your family and hospital staff.

## During Your Stay

### Your Visitors
- Limited visiting hours
- Short visits only (usually 30 minutes)
- Visitors must stay 6 feet away
- No pregnant women or children under 18

### Hospital Staff
- Will wear protective equipment
- May limit time in your room
- Will check radiation levels daily
- Are specially trained for your care

### Your Room
- Designed for radiation safety
- Private bathroom for your use only
- Special handling of linens and waste
- Entertainment items may need to stay

## Daily Routine
- Drink plenty of water (helps remove radiation)
- Use bathroom frequently
- Light exercise in your room
- Take medications as prescribed

## Questions or Concerns
- Use call button for nursing staff
- Ask questions about your care
- Report any problems immediately

**Remember:** These precautions are temporary and necessary for everyone's safety.`,
  },
]

export default function ProtocolsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)

  const categories = ["all", "Preparation", "Treatment", "Safety"]

  const filteredProtocols = mockProtocols.filter((protocol) => {
    const matchesSearch =
      protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocol.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || protocol.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleExportPDF = (protocol: Protocol) => {
    // Mock PDF export functionality
    console.log("[v0] Exporting protocol to PDF:", protocol.title)
    // In production, this would generate and download a PDF
  }

  if (selectedProtocol) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedProtocol(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-primary">{selectedProtocol.title}</h1>
                  <p className="text-sm text-muted-foreground">{selectedProtocol.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                  {selectedProtocol.category}
                </Badge>
                <Button onClick={() => handleExportPDF(selectedProtocol)} className="bg-accent hover:bg-accent/90">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Protocol Content */}
        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="clinician" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clinician" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Clinician View
              </TabsTrigger>
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Patient Handout
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clinician" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Protocol</CardTitle>
                  <CardDescription>Detailed clinical procedures and guidelines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {selectedProtocol.clinicianView}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patient" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Education Handout</CardTitle>
                  <CardDescription>Plain-language instructions for patients and families</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {selectedProtocol.patientHandout}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                <h1 className="text-xl font-bold text-primary">Protocol Library</h1>
                <p className="text-sm text-muted-foreground">Standardized I-131 therapy protocols and procedures</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              {filteredProtocols.length} Protocols
            </Badge>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search protocols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Protocol Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProtocols.map((protocol) => (
            <Card key={protocol.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-accent" />
                    <Badge variant="outline" className="text-xs">
                      {protocol.category}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExportPDF(protocol)
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">{protocol.title}</CardTitle>
                <CardDescription>{protocol.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {protocol.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Updated: {new Date(protocol.lastUpdated).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProtocol(protocol)}
                      className="bg-transparent"
                    >
                      View Protocol
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProtocols.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No protocols found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
