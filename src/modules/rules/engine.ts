import type { Assessment, RuleResult } from "../../types"

class RulesEngine {
  private worker: Worker | null = null
  private rulesLoaded = false

  constructor() {
    this.initializeRules()
  }

  private initializeRules() {
    // Load the existing rules.js logic directly
    // In production, this would be loaded in a web worker for better performance
    this.rulesLoaded = true
    console.log("[v0] Rules engine initialized with clinical rulebook")
  }

  // Convert our Assessment type to the format expected by rules.js
  private convertAssessmentToRulesFormat(assessment: Partial<Assessment>): any {
    const patient: Partial<Assessment["patient"]> = assessment.patient || ({} as Partial<Assessment["patient"]>)
    const clinical: Partial<Assessment["clinical"]> = assessment.clinical || ({} as Partial<Assessment["clinical"]>)
    const labs: Assessment["labs"] = assessment.labs || ({} as Assessment["labs"])
    const safety: Partial<Assessment["safety"]> = assessment.safety || ({} as Partial<Assessment["safety"]>)
    const contraindications: Assessment["contraindications"] = assessment.contraindications || ([] as Assessment["contraindications"]) 

    // Calculate age from DOB if available
    let age = 0
    if (patient.dob) {
      const birthDate = new Date(patient.dob)
      const today = new Date()
      age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
    }

    return {
      // Demographics
      age,
      gender: patient.sex === "F" ? "female" : patient.sex === "M" ? "male" : "other",

      // Clinical context
      histologyType: clinical.diagnosis || "",

      // Lab values
      tsh: labs.TSH?.value || 0,
      creatinine: labs.Creatinine?.value || 0,

      // Contraindications
      pregnancyStatus: contraindications.includes("pregnancy") ? "pregnant" : "not-pregnant",
      hcg: contraindications.includes("pregnancy") ? "positive" : "negative",
      breastfeeding: contraindications.includes("breastfeeding") ? "yes" : "no",
      vomiting: false, // Would need to be added to assessment form
      cardiacDisease: contraindications.includes("uncontrolled-thyrotoxicosis"),
      iodineExposure: contraindications.includes("recent-iodinated-contrast"),

      // Safety checks (mock values for now)
      npoConfirmed: safety.inpatient || false,
      pregnancyTestConfirmed: !contraindications.includes("pregnancy"),
      safetyInstructionsReviewed: safety.isolationReady || false,
      consentObtained: true, // Would need to be tracked
      roomPrepared: safety.isolationReady || false,

      // Diet preparation
      dietDuration: 14, // Mock value - would need to be calculated from prep dates
    }
  }

  // Convert rules.js output to our RuleResult format
  private convertRulesOutput(rulesOutput: any): RuleResult[] {
    if (!rulesOutput || !rulesOutput.issues) {
      return []
    }

    return rulesOutput.issues.map((issue: any) => ({
      id: issue.ruleId,
      title: issue.condition,
      severity: this.mapSeverityToOurFormat(issue.type, issue.severity),
      rationale: issue.reason,
      inputsUsed: this.extractInputsUsed(issue.ruleId),
      references: issue.citations || [],
      type: issue.type,
      action: issue.action,
    }))
  }

  private mapSeverityToOurFormat(type: string, severity: string): "PASS" | "WARN" | "FAIL" {
    if (type === "absolute") return "FAIL"
    if (type === "relative" || type === "lab") return "WARN"
    return "PASS"
  }

  private extractInputsUsed(ruleId: string): string[] {
    // Map rule IDs to the inputs they use
    const inputMap: Record<string, string[]> = {
      "ABS-PREG": ["patient.sex", "contraindications"],
      "ABS-BF": ["contraindications"],
      "ABS-GI": ["clinical symptoms"],
      "LAB-TSH": ["labs.TSH"],
      "LAB-HCG": ["patient.sex", "patient.dob"],
      "REL-RENAL": ["labs.Creatinine", "patient.age"],
      "REL-CARD": ["contraindications"],
      "REL-IOD": ["contraindications"],
      "PREP-DIET": ["preparation.startDate"],
      "PREP-RHTSH": ["patient.age", "contraindications"],
      "SAFE-NPO": ["safety.inpatient"],
      "SAFE-HCG-CONFIRM": ["patient.sex", "patient.dob"],
      "SAFE-INSTR": ["safety.isolationReady"],
      "SAFE-CONSENT": ["session.consent"],
      "SAFE-ROOM": ["safety.isolationReady"],
    }

    return inputMap[ruleId] || ["patient data"]
  }

  async evaluate(patientData: Partial<Assessment>): Promise<RuleResult[]> {
    if (!this.rulesLoaded) {
      console.warn("[v0] Rules engine not loaded")
      return []
    }

    try {
      // Convert our data format to rules.js format
      const rulesData = this.convertAssessmentToRulesFormat(patientData)

      // Use the existing rules.js evaluation logic
      const rulesOutput = this.evaluateWithRulesJS(rulesData)

      // Convert back to our format
      const results = this.convertRulesOutput(rulesOutput)

      // Append ATA risk stratification (low/intermediate/high risk of recurrence)
      const ata = this.calculateATARisk(patientData)
      if (ata) {
        results.unshift({
          id: `ATA-RISK-${ata.level.toUpperCase()}`,
          title: `ATA ${ata.level} risk of recurrence`,
          severity: ata.level === 'high' ? 'WARN' : 'PASS',
          rationale: ata.reason,
          inputsUsed: ata.inputs,
          references: [
            "ATA 2015/2016 differentiated thyroid cancer risk stratification",
          ],
        })
      }

      console.log("[v0] Rules evaluation completed:", results.length, "results")
      return results
    } catch (error) {
      console.error("[v0] Error evaluating rules:", error)
      return []
    }
  }

  private calculateATARisk(assessment: Partial<Assessment>):
    | { level: 'low' | 'intermediate' | 'high'; reason: string; inputs: string[] }
    | null {
    const clinical = assessment.clinical || ({} as any)
    const imaging = assessment.imaging || ({} as any)
    const risk = (assessment as any).risk || {}

    // Very simplified heuristic inspired by ATA recurrence risk stratification
    // Low: intrathyroidal, no aggressive histology, no metastasis, no remnant beyond thyroid bed
    // Intermediate: microscopic extrathyroidal extension, cervical LN involvement, aggressive histology/sizes (proxy)
    // High: distant metastasis, gross extrathyroidal extension, incomplete tumor resection (proxied by imaging flags)

    const aggressiveHistology = risk.aggressiveHistology || (typeof clinical.diagnosis === 'string' && /tall cell|hobnail|columnar/i.test(clinical.diagnosis))
    const hasMetastasis = risk.distantMetastasis === true || !!imaging?.metastatic
    const hasRemnantBeyondBed = imaging?.remnant === true // proxy
    const eteGross = risk.extrathyroidalExtension === 'gross'
    const lnMacro = risk.lymphNodeMetastasis === 'macroscopic'
    const vascular = risk.vascularInvasion === true

    if (hasMetastasis || eteGross) {
      return {
        level: 'high',
        reason: 'Distant metastasis or gross ETE → high risk of recurrence (ATA high)',
        inputs: ['risk.distantMetastasis', 'risk.extrathyroidalExtension'],
      }
    }

    if (aggressiveHistology || lnMacro || vascular || hasRemnantBeyondBed) {
      return {
        level: 'intermediate',
        reason: 'Aggressive histology, LN macromets, vascular invasion or structural remnant → intermediate risk (ATA intermediate)',
        inputs: ['risk.aggressiveHistology', 'risk.lymphNodeMetastasis', 'risk.vascularInvasion', 'imaging.remnant'],
      }
    }

    // Default low risk when criteria above not met
    return {
      level: 'low',
      reason: 'No metastatic disease or aggressive features identified (ATA low)',
      inputs: ['clinical.diagnosis', 'imaging.metastatic', 'imaging.remnant'],
    }
  }

  // Embedded rules.js evaluation logic
  private evaluateWithRulesJS(patientData: any): any {
    const RULEBOOK_VERSION = "v0.2"

    // Helper functions from rules.js
    const asNumber = (v: any) => (typeof v === "number" && !isNaN(v) ? v : Number.parseFloat(v))

    const isWomanOfChildbearingAge = (pd: any) => {
      const age = asNumber(pd.age) || 0
      return pd.gender === "female" && age >= 12 && age <= 55
    }

    const approxEGFR = (pd: any) => {
      const age = asNumber(pd.age)
      const creatinine = asNumber(pd.creatinine)
      if (!age || !creatinine || creatinine === 0 || !pd.gender) return 100
      const genderFactor = pd.gender === "female" ? 0.742 : 1
      return 186 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * genderFactor
    }

    // Rules from rules.js
    const rules = [
      {
        id: "ABS-PREG",
        name: "Pregnancy is an absolute contraindication",
        type: "absolute",
        severity: "high",
        predicate: (pd: any) => pd.gender === "female" && (pd.pregnancyStatus === "pregnant" || pd.hcg === "positive"),
        condition: "Pregnancy",
        action: "Absolutely contraindicated — defer therapy",
        rationale: "Transplacental iodine causes severe fetal hypothyroidism and radiation exposure.",
        citations: ["Guideline: Pregnancy/breastfeeding are absolute contraindications."],
      },
      {
        id: "ABS-BF",
        name: "Active breastfeeding is an absolute contraindication",
        type: "absolute",
        severity: "high",
        predicate: (pd: any) => pd.breastfeeding === "yes",
        condition: "Active breastfeeding",
        action: "Discontinue breastfeeding at least 6 weeks prior to therapy",
        rationale: "I-131 concentrates in breast milk and exposes the infant to radiation and thyroid suppression.",
        citations: ["Guideline: Pregnancy/breastfeeding are absolute contraindications."],
      },
      {
        id: "LAB-TSH",
        name: "Insufficient TSH stimulation",
        type: "lab",
        severity: "moderate",
        predicate: (pd: any) => {
          const tsh = asNumber(pd.tsh)
          return tsh > 0 && tsh < 30
        },
        condition: "Inadequate TSH stimulation",
        action: "Continue THW or administer rhTSH to reach TSH >30 mIU/L",
        rationale: "TSH ≥30 mIU/L improves uptake and therapeutic efficacy.",
        citations: ["Guideline: Target TSH >30 mIU/L before therapy."],
      },
      {
        id: "LAB-HCG",
        name: "Missing β-hCG in women of childbearing age",
        type: "lab",
        severity: "moderate",
        predicate: (pd: any) => isWomanOfChildbearingAge(pd) && (!pd.hcg || pd.hcg === ""),
        condition: "Missing pregnancy test",
        action: "Obtain β-hCG test before proceeding",
        rationale: "Screening prevents inadvertent fetal exposure.",
        citations: ["Guideline: Mandatory pregnancy testing when applicable."],
      },
      {
        id: "REL-RENAL",
        name: "Severe renal impairment is a relative contraindication",
        type: "relative",
        severity: "moderate",
        predicate: (pd: any) => {
          const egfr = approxEGFR(pd)
          return asNumber(pd.creatinine) > 0 && egfr < 30
        },
        condition: "Severe renal impairment (eGFR <30)",
        action: "Consider dose reduction or alternative therapy; involve nephrology.",
        rationale: "Delayed clearance increases systemic radiation exposure.",
        citations: ["Guideline: Impaired renal function requires specialist review."],
      },
      {
        id: "REL-IOD",
        name: "Recent iodine exposure reduces I-131 uptake",
        type: "relative",
        severity: "moderate",
        predicate: (pd: any) => !!pd.iodineExposure,
        condition: "Recent iodine exposure",
        action: "Delay therapy 4–8 weeks depending on exposure source",
        rationale: "Competitive iodine load saturates thyroid, reducing therapeutic uptake.",
        citations: ["Guideline: Delay after iodinated contrast/iodine load."],
      },
    ]

    const issues: any[] = []
    let hasAbsolute = false
    let hasNonAbsolute = false

    rules.forEach((rule) => {
      try {
        if (rule.predicate(patientData)) {
          const issue = {
            ruleId: rule.id,
            type: rule.type,
            severity: rule.severity,
            condition: rule.condition,
            reason: rule.rationale,
            action: rule.action,
            citations: rule.citations,
            rulebookVersion: RULEBOOK_VERSION,
          }
          issues.push(issue)
          if (rule.type === "absolute") {
            hasAbsolute = true
          } else if (rule.type === "relative" || rule.type === "lab") {
            hasNonAbsolute = true
          }
        }
      } catch (e) {
        // Fail-safe: ignore predicate errors
      }
    })

    return { issues, hasAbsolute, hasNonAbsolute, rulebookVersion: RULEBOOK_VERSION }
  }

  explain(ruleId: string): { text: string; rationale: string; references?: string[] } {
    // Rule explanations based on rules.js
    const explanations: Record<string, { text: string; rationale: string; references?: string[] }> = {
      "ABS-PREG": {
        text: "Pregnancy is an absolute contraindication for I-131 therapy",
        rationale:
          "Radioiodine crosses the placenta and can cause severe fetal hypothyroidism and radiation exposure to the developing fetus.",
        references: ["SNMMI Practice Guideline", "ATA Guidelines 2015"],
      },
      "ABS-BF": {
        text: "Active breastfeeding must be discontinued before I-131 therapy",
        rationale: "I-131 concentrates in breast milk and exposes the infant to radiation and thyroid suppression.",
        references: ["SNMMI Practice Guideline", "EANM Guidelines"],
      },
      "LAB-TSH": {
        text: "TSH stimulation should be ≥30 mIU/L for optimal therapeutic efficacy",
        rationale:
          "Higher TSH levels increase radioiodine uptake by thyroid tissue, improving treatment effectiveness.",
        references: ["ATA Guidelines 2015", "SNMMI Procedure Standard"],
      },
      "LAB-HCG": {
        text: "β-hCG testing is mandatory in women of childbearing age",
        rationale: "Pregnancy screening prevents inadvertent fetal radiation exposure.",
        references: ["Regulatory requirement", "SNMMI Safety Guidelines"],
      },
      "REL-RENAL": {
        text: "Severe renal impairment (eGFR <30) is a relative contraindication",
        rationale: "Delayed radioiodine clearance increases systemic radiation exposure and toxicity risk.",
        references: ["Clinical practice guidelines", "Nephrology consultation recommended"],
      },
      "REL-IOD": {
        text: "Recent iodine exposure reduces I-131 therapeutic uptake",
        rationale: "Competitive iodine load saturates thyroid tissue, reducing radioiodine uptake and efficacy.",
        references: ["Imaging contrast guidelines", "Preparation protocols"],
      },
    }

    return (
      explanations[ruleId] || {
        text: "Rule explanation not available",
        rationale: "Please consult clinical guidelines for detailed information.",
      }
    )
  }

  // Get all available rules for reference
  getRulesCatalog(): Array<{ id: string; name: string; type: string; description: string }> {
    return [
      {
        id: "ABS-PREG",
        name: "Pregnancy Check",
        type: "absolute",
        description: "Pregnancy contraindication screening",
      },
      {
        id: "ABS-BF",
        name: "Breastfeeding Check",
        type: "absolute",
        description: "Breastfeeding contraindication screening",
      },
      { id: "LAB-TSH", name: "TSH Stimulation", type: "lab", description: "TSH level adequacy for therapy" },
      { id: "LAB-HCG", name: "Pregnancy Test", type: "lab", description: "β-hCG testing requirement" },
      { id: "REL-RENAL", name: "Renal Function", type: "relative", description: "Kidney function assessment" },
      { id: "REL-IOD", name: "Iodine Exposure", type: "relative", description: "Recent iodine exposure check" },
    ]
  }
}

export const rulesEngine = new RulesEngine()
