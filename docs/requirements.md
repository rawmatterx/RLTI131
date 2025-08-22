Role: You are a senior frontend engineer and designer. Deliver a production-ready React + Vite + TypeScript app using Tailwind CSS and shadcn/ui, with state managed by TanStack Query + Zustand. Prioritize accessibility (WCAG 2.2 AA), clinical clarity, and explainability of rule-based outputs.

Goal: Implement a clinician-facing web app that wraps a RAG chat assistant and a deterministic “rules engine” for I-131 therapy workflows (pre-therapy triage, eligibility, preparation, safety, discharge). The UI must:

collect structured inputs,

run rules and show “why” explanations,

stream assistant responses with citations,

export/share summaries, and

keep an auditable session timeline.

Tech & project setup

Stack: React 18, TypeScript, Vite, Tailwind, shadcn/ui, lucide-react, TanStack Query, Zustand, React Hook Form + Zod.

Structure:

/src/app routing (file-based)

/src/components shared UI

/src/modules/rules wrapper that can consume existing rules.js logic as a web worker (for responsiveness)

/src/modules/rag for chat API helpers

/src/types (Patient, Labs, Contraindications, RuleResult, ChatMessage, Citation)

/src/store (Zustand slices: patient, session, ui)

/public (logo, printable CSS)

Theming: Light by default; high-contrast toggle; print-optimized stylesheet for discharge/handout PDFs.

Security: No PHI storage server-side by default; local persistence via indexedDB with a “Clear All Data” control.

Pages & primary flows

/ (Dashboard)

Cards: “Start New Assessment”, “Continue Session”, “Protocol Library”, “Safety Checklists”, “Admin/Settings”.

KPI chips for session count today, unresolved flags, last sync.

/assessment (Patient Intake & Triage Wizard)

Sections: Demographics → Clinical context (Dx, prior I-131, thyroidectomy status) → Labs (TSH, Tg, TgAb, RFT/LFT) → Imaging flags (metastatic, remnant) → Meds & pregnancy status → Preparation path (withdrawal vs rhTSH) → Radiation safety environment.

UX: multi-step with progress bar, validation, autosave.

Actions: “Run Eligibility Rules” → opens Rule Results panel with PASS/WARN/FAIL chips, and a Why? drawer showing the rule text, input snippets, and references.

/assistant (RAG Chat)

Left: Session timeline (events: data collected, rules run, notes).

Center: Chat with streaming tokens, Markdown, tables, and inline citations.

Right: Context panel: selected patient facts, recent labs, active protocol, quick inserts (e.g., “pre-therapy prep”, “iodine safety instructions”).

Controls: attach structured context (selected form fields) to a message; toggle “advisory only” disclaimer banner on every response.

/protocols (Protocol Library)

Filterable list (I-131 WBS prep, low/high-dose ablation, metastatic dosing considerations, inpatient/outpatient safety).

View protocol → two tabs: Clinician View (concise steps) and Patient Handout (plain-language). “Export PDF”.

/safety (Checklists & Discharge)

Checklists (pregnancy test verification, isolation room prep, waste handling, discharge instructions).

Digital sign-offs → appended to session audit trail.

/admin (Settings)

API keys (RAG backend), data retention policy, export all sessions (.json/.pdf), brand logo/colors, rule set version pinning.

Components to implement

StepWizard, FormCard, KeyValueGrid, RuleBadge, RuleExplainDrawer, CitationList, SessionTimeline, ChatComposer, StreamingMessage, PDFExportButton, Checklist, SignaturePad, Toast, ConfirmDialog.

Rules engine integration

Create /src/modules/rules/engine.ts that wraps the existing rules.js logic:

Load rules.js in a Web Worker, expose evaluate(patientData): RuleResult[].

RuleResult = { id, title, severity: "PASS"|"WARN"|"FAIL", rationale, inputsUsed: string[], references?: string[] }.

Provide explain(ruleId) returning the rule text and source rationale.

Surface a Why? button next to every rule outcome.

If a rule requires a missing field, show “Required input missing” chips and deep-link the user back to that step.

RAG assistant integration (mock + real)

Start with a mock POST /api/assistant returning streamed tokens; later plug in your backend endpoint.

Request body includes: messages, patientContext (selected fields), and ruleOutcomes.

Show inline citation chips [1] that open a side drawer with source metadata and quote snippets.

Persistent disclaimer bar: “Not a diagnostic device. Advisory use only.”

Data model (TypeScript)
type Contraindication = "pregnancy"|"breastfeeding"|"recent-iodinated-contrast"|"severe-renal-impairment"|"uncontrolled-thyrotoxicosis";
type LabKey = "TSH"|"Tg"|"TgAb"|"Creatinine"|"eGFR"|"ALT"|"AST";
type Patient = { id:string; name?:string; sex?: "F"|"M"|"Other"; dob?:string; mrn?:string };
type Clinical = { diagnosis:string; priorI131?:boolean; thyroidectomy?: "total"|"near_total"|"partial"|"none" };
type Prep = { path:"withdrawal"|"rhTSH"|null; startDate?:string; lowIodineDiet?:boolean };
type Safety = { inpatient?:boolean; isolationReady?:boolean; homeEnvironmentNotes?:string };
type Labs = Partial<Record<LabKey,{ value:number; unit:string; date?:string }>>;
type Assessment = { patient:Patient; clinical:Clinical; prep:Prep; safety:Safety; labs:Labs; contraindications:Contraindication[] };
type RuleResult = { id:string; title:string; severity:"PASS"|"WARN"|"FAIL"; rationale:string; inputsUsed:string[]; references?:string[] };

State, persistence, and auditability

Zustand slices:

patientSlice (assessment state + autosave)

sessionSlice (timeline events, signatures, exports)

uiSlice (toasts, drawers, theme)

Autosave to indexedDB; “Clear Data” & “Export Session (.json)”.

Append every important action to SessionTimeline.

UX & clinical safety details

Require explicit confirmation on high-risk actions (e.g., proceeding with contraindications).

Always pair deterministic rule outcomes with assistant narrative for context.

Provide a “Clinical notes (free text)” panel and include it in exports.

Keyboard navigation for forms; large tap targets; live validation summaries.

Print-safe patient handouts with big headings and bullet points.

Testing & quality

Unit tests (Vitest + React Testing Library) for:

rules wrapper → correct severity and rationale,

wizard validation flows,

chat rendering & citation drawer,

PDF export triggers.

Lighthouse ≥ 90 for a11y, performance, best practices.

E2E smoke (Playwright): intake → rules → chat → export.

Deliverables

A working app with the routes and components above.

Example rule set (ported from rules.js) and 3 synthetic patient profiles.

“One-click” npm run dev and npm run build.

README with environment setup and how to plug a real /api/assistant.

Design tone: calm, clinical, low-distraction (grays, ample whitespace), with chips and badges for statuses (PASS/WARN/FAIL). Use iconography sparingly (lucide-react).

Starter UI skeleton (pseudo-code)
// AppRouter.tsx
<Route path="/" element={<Dashboard/>}/>
<Route path="/assessment" element={<AssessmentWizard/>}/>
<Route path="/assistant" element={<AssistantPage/>}/>
<Route path="/protocols" element={<ProtocolLibrary/>}/>
<Route path="/safety" element={<SafetyCenter/>}/>
<Route path="/admin" element={<AdminSettings/>}/>


Important: keep all outputs labeled “Advisory only — not for autonomous clinical decisions.”
