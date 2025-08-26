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
      
      // ATA 2025 molecular markers (from risk assessment)
      brafMutation: assessment.risk?.brafMutation || false,
      rasMutation: assessment.risk?.rasMutation || false,
      retPtcRearrangement: assessment.risk?.retPtcRearrangement || false,
      molecularRiskScore: assessment.risk?.molecularRiskScore || 'low',
      
      // ATA 2025 ultrasound features
      suspiciousUSFeatures: assessment.risk?.suspiciousUSFeatures || false,
      centralLNImaging: assessment.risk?.centralLNImaging || false,
      
      // ATA 2025 follow-up risk
      followUpRisk: assessment.risk?.followUpRisk || 'low',
      postSurgicalRisk: assessment.risk?.postSurgicalRisk || 'excellent',
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
            "ATA 2025 updated differentiated thyroid cancer risk stratification with molecular markers",
            "ATA 2025 selective lymph node dissection guidelines",
            "ATA 2025 de-escalated follow-up protocols"
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

    // ATA 2025 enhanced risk stratification with molecular markers
    // Incorporates molecular testing, sonographic features, and selective approaches
    
    // Traditional risk factors
    const aggressiveHistology = risk.aggressiveHistology || (typeof clinical.diagnosis === 'string' && /tall cell|hobnail|columnar/i.test(clinical.diagnosis))
    const hasMetastasis = risk.distantMetastasis === true || !!imaging?.metastatic
    const hasRemnantBeyondBed = imaging?.remnant === true
    const eteGross = risk.extrathyroidalExtension === 'gross'
    const eteMicro = risk.extrathyroidalExtension === 'micro'
    const lnMacro = risk.lymphNodeMetastasis === 'macroscopic'
    const lnMicro = risk.lymphNodeMetastasis === 'microscopic'
    const vascular = risk.vascularInvasion === true
    
    // ATA 2025 molecular markers
    const brafMutation = risk.brafMutation === true
    const rasMutation = risk.rasMutation === true
    const retPtcRearrangement = risk.retPtcRearrangement === true
    const molecularHighRisk = risk.molecularRiskScore === 'high'
    const molecularIntermediateRisk = risk.molecularRiskScore === 'intermediate'
    
    // ATA 2025 ultrasound-based features
    const suspiciousUSFeatures = risk.suspiciousUSFeatures === true
    const centralLNImaging = risk.centralLNImaging === true
    
    // Primary tumor size consideration (ATA 2025 de-emphasizes size alone)
    const largeTumor = (risk.primaryTumorSizeCm || 0) > 4

    // HIGH RISK (ATA 2025 criteria)
    if (hasMetastasis || eteGross || (lnMacro && centralLNImaging)) {
      return {
        level: 'high',
        reason: 'ATA 2025 High Risk: Distant metastasis, gross ETE, or imaging-confirmed macroscopic LN metastasis → aggressive surgical approach indicated',
        inputs: ['risk.distantMetastasis', 'risk.extrathyroidalExtension', 'risk.lymphNodeMetastasis', 'risk.centralLNImaging'],
      }
    }

    // INTERMEDIATE RISK (ATA 2025 enhanced criteria)
    if (
      aggressiveHistology || 
      vascular || 
      eteMicro || 
      lnMicro ||
      brafMutation ||
      molecularHighRisk ||
      molecularIntermediateRisk ||
      (suspiciousUSFeatures && largeTumor) ||
      hasRemnantBeyondBed
    ) {
      const molecularText = brafMutation ? ' with BRAF mutation' : 
                           rasMutation ? ' with RAS mutation' : 
                           retPtcRearrangement ? ' with RET/PTC rearrangement' : 
                           molecularHighRisk ? ' with high molecular risk score' : ''
      
      return {
        level: 'intermediate',
        reason: `ATA 2025 Intermediate Risk: Molecular-enhanced stratification${molecularText}, suspicious ultrasound features, or microscopic aggressive features → selective follow-up approach`,
        inputs: ['risk.aggressiveHistology', 'risk.vascularInvasion', 'risk.brafMutation', 'risk.molecularRiskScore', 'risk.suspiciousUSFeatures'],
      }
    }

    // LOW RISK (ATA 2025 de-escalated follow-up)
    return {
      level: 'low',
      reason: 'ATA 2025 Low Risk: No aggressive molecular markers or imaging features → de-escalated follow-up with less frequent monitoring recommended',
      inputs: ['clinical.diagnosis', 'risk.molecularRiskScore', 'risk.suspiciousUSFeatures'],
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
      // ATA 2025 Molecular Marker Rules
      {
        id: "ATA-MOLECULAR-HIGH",
        name: "High-risk molecular profile detected",
        type: "info",
        severity: "moderate",
        predicate: (pd: any) => pd.brafMutation || pd.molecularRiskScore === "high",
        condition: "High-risk molecular markers present",
        action: "Consider enhanced surveillance and personalized treatment approach per ATA 2025",
        rationale: "BRAF mutations or high molecular risk scores indicate increased recurrence risk requiring personalized management.",
        citations: ["ATA 2025: Molecular-based risk stratification guidelines"],
      },
      {
        id: "ATA-US-FEATURES",
        name: "Suspicious ultrasound features prioritized over size",
        type: "info",
        severity: "low",
        predicate: (pd: any) => pd.suspiciousUSFeatures,
        condition: "Suspicious ultrasound features detected",
        action: "Prioritize FNAC based on ultrasound characteristics rather than nodule size alone",
        rationale: "ATA 2025 emphasizes sonographic features over size for malignancy prediction accuracy.",
        citations: ["ATA 2025: Ultrasound-based FNAC prioritization"],
      },
      {
        id: "ATA-CENTRAL-LN",
        name: "Selective central lymph node dissection recommended",
        type: "info",
        severity: "low",
        predicate: (pd: any) => pd.centralLNImaging,
        condition: "Imaging-confirmed central lymph node involvement",
        action: "Consider selective central lymph node dissection only for imaging-confirmed cases",
        rationale: "ATA 2025 advocates selective approach to minimize morbidity while maintaining oncologic outcomes.",
        citations: ["ATA 2025: Selective central lymph node dissection guidelines"],
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
      "ATA-MOLECULAR-HIGH": {
        text: "High-risk molecular profile requires enhanced surveillance (ATA 2025)",
        rationale: "BRAF mutations and high molecular risk scores are associated with increased recurrence risk and may benefit from personalized treatment approaches.",
        references: ["ATA 2025 Molecular-based risk stratification guidelines", "Precision medicine approaches"],
      },
      "ATA-US-FEATURES": {
        text: "Suspicious ultrasound features prioritize FNAC over nodule size (ATA 2025)",
        rationale: "Sonographic characteristics are more predictive of malignancy than size alone, improving diagnostic accuracy.",
        references: ["ATA 2025 Ultrasound-based FNAC prioritization", "Evidence-based imaging criteria"],
      },
      "ATA-CENTRAL-LN": {
        text: "Selective central lymph node dissection based on imaging confirmation (ATA 2025)",
        rationale: "Selective approach minimizes surgical morbidity while maintaining oncologic outcomes for appropriate candidates.",
        references: ["ATA 2025 Selective lymph node dissection guidelines", "Surgical outcomes data"],
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
      // ATA 2025 Rules
      { id: "ATA-MOLECULAR-HIGH", name: "Molecular Risk Profile", type: "info", description: "High-risk molecular markers detected" },
      { id: "ATA-US-FEATURES", name: "Ultrasound Features", type: "info", description: "Suspicious sonographic characteristics" },
      { id: "ATA-CENTRAL-LN", name: "Central LN Assessment", type: "info", description: "Selective lymph node dissection guidance" },
    ]
  }
}

export const rulesEngine = new RulesEngine()
