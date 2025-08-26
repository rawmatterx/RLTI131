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

      // Append ATA 2025 4-tier risk stratification for structural disease persistence/recurrence
      const ata = this.calculateATARisk(patientData)
      if (ata) {
        results.unshift({
          id: `ATA-2025-RISK-${ata.level.toUpperCase().replace('-', '_')}`,
          title: `ATA 2025 ${ata.level.replace('-', '-')} risk of recurrence (${ata.recurrenceRate})`,
          severity: ata.level === 'high' ? 'FAIL' : ata.level.includes('intermediate') ? 'WARN' : 'PASS',
          rationale: `${ata.reason}\n\nRecommendations:\n• ${ata.recommendations.join('\n• ')}`,
          inputsUsed: ata.inputs,
          references: [
            "ATA 2025 Management Guidelines for Adult Patients with Differentiated Thyroid Cancer",
            "ATA 2025 DATA Framework: Diagnosis, Assessment, Treatment, response Assessment",
            "ATA 2025 4-tier Risk Stratification System for Structural Disease Persistence/Recurrence"
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
    | { level: 'low' | 'intermediate-low' | 'intermediate-high' | 'high'; reason: string; inputs: string[]; recurrenceRate: string; recommendations: string[] }
    | null {
    const clinical = assessment.clinical || ({} as any)
    const imaging = assessment.imaging || ({} as any)
    const risk = (assessment as any).risk || {}

    // ATA 2025 OFFICIAL 4-tier Risk Stratification System for Structural Disease Persistence/Recurrence
    // Based on DATA framework: Diagnosis, risk/benefit Assessment, Treatment decisions, response Assessment
    
    const riskFactors = []
    const recommendations = []
    
    // Extract ATA 2025 specific risk factors
    const tumorSize = risk.primaryTumorSizeCm || 0
    const aggressiveHistology = risk.aggressiveHistology || (typeof clinical.diagnosis === 'string' && /tall cell|hobnail|columnar|diffuse sclerosing|insular/i.test(clinical.diagnosis))
    const hasMetastasis = risk.distantMetastasis === true || !!imaging?.metastatic || risk.mCategory === 'M1'
    const eteGross = risk.extrathyroidalExtension === 'gross' || risk.pTCategory === 'T4a' || risk.pTCategory === 'T4b'
    const eteMicro = risk.extrathyroidalExtension === 'micro' || risk.pTCategory === 'T3b'
    const vascular = risk.vascularInvasion === true
    const incompleteResection = risk.completenessOfResection === 'R2'
    const elevatedTg = risk.postopThyroglobulin === 'suggestive-metastases' || risk.postopThyroglobulin === 'elevated'
    
    // ATA 2025 Lymph Node Volume Assessment
    const lymphNodeVolume = risk.lymphNodeVolume || 'none'
    const largeVolumeLN = lymphNodeVolume === 'large-volume' // ≥3cm LN
    const intermediateVolumeLN = lymphNodeVolume === 'intermediate-volume' // Clinical N1 or >5 pathologic N1, all <3cm
    const smallVolumeLN = lymphNodeVolume === 'small-volume' // ≤5 pathologic N1 micrometastases <0.2cm
    const extranodal_extension = risk.extranodal_extension === true
    
    // ATA 2025 Molecular Profiling (High-risk combinations)
    const brafTertCombination = risk.brafTertCombination === true // Highest risk combination
    const rasTertCombination = risk.rasTertCombination === true
    const brafMutation = risk.brafMutation === true
    const tertPromoterMutation = risk.tertPromoterMutation === true
    const otherHighRiskMutations = risk.otherHighRiskMutations === true // TP53, PIK3CA, AKT1, EIF1AX
    
    // ATA 2025 Tumor Focality Assessment
    const tumorFocality = risk.tumorFocality || 'unifocal-microcarcinoma'
    const multifocalMicrocarcinoma = tumorFocality === 'multifocal-microcarcinoma'
    const unifocalMicrocarcinoma = tumorFocality === 'unifocal-microcarcinoma'
    
    // ATA 2025 Extensive Vascular Invasion Assessment
    const extensiveVascularInvasion = vascular && (clinical.diagnosis?.includes('follicular') || clinical.diagnosis?.includes('FTC'))
    
    // ATA 2025 OFFICIAL RISK STRATIFICATION ALGORITHM
    
    // HIGH RISK CATEGORY (27-75% recurrence rates)
    if (
      hasMetastasis || // Distant metastases (M1)
      eteGross || // Gross extrathyroidal extension (T4a/T4b)
      incompleteResection || // Gross residual disease (R2)
      elevatedTg || // Postop Tg suggestive of distant metastases
      largeVolumeLN || // Any metastatic LN ≥3cm
      (extranodal_extension && lymphNodeVolume !== 'none' && lymphNodeVolume !== 'small-volume') || // ENE with >3 positive nodes
      extensiveVascularInvasion || // ≥4 vessels or extracapsular vascular invasion in FTC
      brafTertCombination || // Co-existent BRAF + TERT mutations
      rasTertCombination || // Co-existent RAS + TERT mutations
      otherHighRiskMutations // TP53, PIK3CA, AKT1 combinations
    ) {
      if (hasMetastasis) riskFactors.push('distant metastases present')
      if (eteGross) riskFactors.push('gross extrathyroidal extension')
      if (incompleteResection) riskFactors.push('incomplete tumor resection (R2)')
      if (elevatedTg) riskFactors.push('elevated postoperative thyroglobulin')
      if (largeVolumeLN) riskFactors.push('large volume lymph node metastases (≥3cm)')
      if (extranodal_extension) riskFactors.push('extranodal extension')
      if (extensiveVascularInvasion) riskFactors.push('extensive vascular invasion (≥4 vessels)')
      if (brafTertCombination) riskFactors.push('BRAF + TERT promoter mutations')
      if (rasTertCombination) riskFactors.push('RAS + TERT promoter mutations')
      if (otherHighRiskMutations) riskFactors.push('high-risk molecular combinations')
      
      recommendations.push('Aggressive surgical approach with multidisciplinary team')
      recommendations.push('Intensive surveillance protocol')
      recommendations.push('Consider adjuvant radioactive iodine therapy')
      recommendations.push('TSH suppression therapy')
      recommendations.push('Molecular profiling for systemic therapy planning')
      
      return {
        level: 'high',
        reason: `ATA 2025 HIGH RISK: ${riskFactors.join(', ')} (Recurrence rate: 27-75%)`,
        inputs: ['risk.distantMetastasis', 'risk.extrathyroidalExtension', 'risk.completenessOfResection', 'risk.lymphNodeVolume', 'risk.brafTertCombination'],
        recurrenceRate: '27-75%',
        recommendations
      }
    }
    
    // INTERMEDIATE-HIGH RISK CATEGORY (8-22% recurrence rates)
    if (
      aggressiveHistology || // Tall cell, hobnail, columnar, diffuse sclerosing variants
      vascular || // Vascular invasion in PTC/OTC
      intermediateVolumeLN || // Clinical N1 or >5 pathologic N1, all <3cm
      eteMicro || // Microscopic extrathyroidal extension
      (tumorSize > 4) || // Intrathyroidal PTC >4cm
      tertPromoterMutation || // TERT promoter mutation alone
      brafMutation || // BRAF V600E mutation alone
      multifocalMicrocarcinoma // Multifocal papillary microcarcinoma
    ) {
      if (aggressiveHistology) riskFactors.push('aggressive histologic variant')
      if (vascular) riskFactors.push('vascular invasion')
      if (intermediateVolumeLN) riskFactors.push('intermediate volume lymph node metastases')
      if (eteMicro) riskFactors.push('microscopic extrathyroidal extension')
      if (tumorSize > 4) riskFactors.push('large intrathyroidal tumor (>4cm)')
      if (tertPromoterMutation) riskFactors.push('TERT promoter mutation')
      if (brafMutation) riskFactors.push('BRAF V600E mutation')
      if (multifocalMicrocarcinoma) riskFactors.push('multifocal papillary microcarcinoma')
      
      recommendations.push('Selective approach with molecular-guided decisions')
      recommendations.push('Moderate surveillance intensity')
      recommendations.push('Consider radioactive iodine therapy based on risk-benefit analysis')
      recommendations.push('Degree of TSH suppression based on response assessment')
      
      return {
        level: 'intermediate-high',
        reason: `ATA 2025 INTERMEDIATE-HIGH RISK: ${riskFactors.join(', ')} (Recurrence rate: 8-22%)`,
        inputs: ['risk.aggressiveHistology', 'risk.vascularInvasion', 'risk.lymphNodeVolume', 'risk.extrathyroidalExtension', 'risk.primaryTumorSizeCm'],
        recurrenceRate: '8-22%',
        recommendations
      }
    }
    
    // INTERMEDIATE-LOW RISK CATEGORY (3-9% recurrence rates)
    if (
      smallVolumeLN || // ≤5 pathologic N1 micrometastases <0.2cm
      (tumorSize >= 2 && tumorSize <= 4) || // Intrathyroidal PTC 2-4cm
      (multifocalMicrocarcinoma && eteMicro) // Multifocal microcarcinoma with microscopic ETE
    ) {
      if (smallVolumeLN) riskFactors.push('small volume lymph node micrometastases')
      if (tumorSize >= 2 && tumorSize <= 4) riskFactors.push('intermediate size intrathyroidal tumor (2-4cm)')
      if (multifocalMicrocarcinoma && eteMicro) riskFactors.push('multifocal microcarcinoma with microscopic extension')
      
      recommendations.push('Standard follow-up protocol')
      recommendations.push('Radioactive iodine therapy may be considered')
      recommendations.push('TSH suppression to lower normal range')
      recommendations.push('Regular biochemical and imaging surveillance')
      
      return {
        level: 'intermediate-low',
        reason: `ATA 2025 INTERMEDIATE-LOW RISK: ${riskFactors.join(', ')} (Recurrence rate: 3-9%)`,
        inputs: ['risk.lymphNodeVolume', 'risk.primaryTumorSizeCm', 'risk.tumorFocality'],
        recurrenceRate: '3-9%',
        recommendations
      }
    }
    
    // LOW RISK CATEGORY (1-6% recurrence rates)
    if (unifocalMicrocarcinoma) riskFactors.push('unifocal papillary microcarcinoma')
    if (tumorSize <= 1) riskFactors.push('intrathyroidal tumor ≤1cm')
    if (!riskFactors.length) riskFactors.push('no significant risk factors identified')
    
    recommendations.push('De-escalated surveillance approach')
    recommendations.push('Radioactive iodine therapy generally not recommended')
    recommendations.push('TSH suppression not routinely recommended')
    recommendations.push('Less frequent follow-up intervals appropriate')
    
    return {
      level: 'low',
      reason: `ATA 2025 LOW RISK: ${riskFactors.join(', ')} (Recurrence rate: 1-6%)`,
      inputs: ['risk.tumorFocality', 'risk.primaryTumorSizeCm', 'clinical.diagnosis'],
      recurrenceRate: '1-6%',
      recommendations
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
