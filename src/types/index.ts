// Core data types for I-131 therapy assistant

export type Contraindication =
  | "pregnancy"
  | "breastfeeding"
  | "recent-iodinated-contrast"
  | "severe-renal-impairment"
  | "uncontrolled-thyrotoxicosis"

export type LabKey = "TSH" | "Tg" | "TgAb" | "Creatinine" | "eGFR" | "ALT" | "AST"

export type Patient = {
  id: string
  name?: string
  sex?: "F" | "M" | "Other"
  dob?: string
  mrn?: string
}

export type Clinical = {
  diagnosis: string
  priorI131?: boolean
  thyroidectomy?: "total" | "near_total" | "partial" | "none"
}

export type Prep = {
  path: "withdrawal" | "rhTSH" | null
  startDate?: string
  lowIodineDiet?: boolean
}

export type Safety = {
  inpatient?: boolean
  isolationReady?: boolean
  homeEnvironmentNotes?: string
}

export type Imaging = {
  metastatic?: boolean
  remnant?: boolean
  notes?: string
}

export type Labs = Partial<
  Record<
    LabKey,
    {
      value: number
      unit: string
      date?: string
    }
  >
>

export type Assessment = {
  patient: Patient
  clinical: Clinical
  prep: Prep
  safety: Safety
  labs: Labs
  contraindications: Contraindication[]
  medications?: string
  imaging?: Imaging
  risk?: RiskFactors
}

export type RuleResult = {
  id: string
  title: string
  severity: "PASS" | "WARN" | "FAIL"
  rationale: string
  inputsUsed: string[]
  references?: string[]
  type?: "absolute" | "relative" | "lab" | "info"
  action?: string
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  citations?: Citation[]
}

export type Citation = {
  id: string
  source: string
  quote: string
  url?: string
  metadata?: Record<string, any>
}

export type SessionEvent = {
  id: string
  timestamp: Date
  type: "data_collected" | "rules_run" | "note_added" | "export_generated"
  description: string
  data?: any
}

export type RiskFactors = {
  extrathyroidalExtension?: 'none' | 'micro' | 'gross'
  lymphNodeMetastasis?: 'none' | 'microscopic' | 'macroscopic'
  distantMetastasis?: boolean
  aggressiveHistology?: boolean
  vascularInvasion?: boolean
  primaryTumorSizeCm?: number
  marginStatus?: 'negative' | 'microscopic' | 'positive'
  tallCellPercent?: number
  
  // ATA 2025 molecular markers (Evidence-based)
  brafMutation?: boolean
  rasMutation?: boolean
  retPtcRearrangement?: boolean
  tertPromoterMutation?: boolean
  molecularRiskScore?: 'minimal' | 'low' | 'intermediate' | 'high'
  
  // ATA 2025 ultrasound-based features  
  suspiciousUSFeatures?: boolean
  centralLNImaging?: boolean
  
  // ATA 2025 Official 4-tier Risk Stratification System
  ataRiskCategory?: 'low' | 'intermediate-low' | 'intermediate-high' | 'high'
  
  // ATA 2025 Dynamic Response Assessment
  responseToTherapy?: 'excellent' | 'indeterminate' | 'biochemical-incomplete' | 'structural-incomplete'
  
  // ATA 2025 TNM Staging (8th Edition)
  pTCategory?: 'TX' | 'T0' | 'T1a' | 'T1b' | 'T2' | 'T3a' | 'T3b' | 'T4a' | 'T4b'
  pNCategory?: 'NX' | 'N0' | 'N1a' | 'N1b'
  mCategory?: 'M0' | 'M1'
  ajccStage?: 'I' | 'II' | 'III' | 'IVA' | 'IVB'
  
  // ATA 2025 Specific Risk Factors
  tumorFocality?: 'unifocal-microcarcinoma' | 'multifocal-microcarcinoma' | 'unifocal-larger' | 'multifocal-larger'
  lymphNodeVolume?: 'none' | 'small-volume' | 'intermediate-volume' | 'large-volume'
  extranodal_extension?: boolean
  completenessOfResection?: 'R0' | 'R1' | 'R2'
  postopThyroglobulin?: 'undetectable' | 'low-level' | 'elevated' | 'suggestive-metastases'
  
  // Enhanced molecular profiling (ATA 2025)
  brafTertCombination?: boolean // Co-existent BRAF + TERT mutations (highest risk)
  rasTertCombination?: boolean // Co-existent RAS + TERT mutations
  otherHighRiskMutations?: boolean // TP53, PIK3CA, AKT1, EIF1AX combinations
}

export type Protocol = {
  id: string
  title: string
  category: string
  clinicianView: string
  patientHandout: string
  tags: string[]
}
