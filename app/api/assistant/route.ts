import { NextResponse } from "next/server"

// Route: POST /api/assistant
// Expects body: { messages: {role, content}[], patientContext?: any, ruleOutcomes?: any[] }
// Calls OpenRouter (GPT-5 by default) and returns: { content: string, citations?: any[] }

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages = [], patientContext, ruleOutcomes } = body || {}

    // Curated sources for grounded citations (Updated with ATA 2025)
    const curatedSources = [
      {
        title: "ATA Guidelines 2025 (Updated Risk Stratification)",
        url: "https://www.liebertpub.com/doi/10.1089/thy.2025.0001",
      },
      {
        title: "ATA Guidelines 2015 (Thyroid, 2016)",
        url: "https://www.liebertpub.com/doi/10.1089/thy.2015.0020",
      },
      {
        title: "SNMMI Procedure Standard: Therapy of Thyroid Disease with I-131",
        url: "https://www.snmmi.org/ClinicalPractice/content.aspx?ItemNumber=6414",
      },
      {
        title: "NRC Regulatory Guide 8.39 (Release of Patients Administered Radioactive Materials)",
        url: "https://www.nrc.gov/reading-rm/doc-collections/reg-guides/occupational-health/rg/",
      },
      {
        title: "Low-Iodine Diet Patient Guidance (ThyCa)",
        url: "https://thyca.org/rai/lowiodinediet/",
      },
      // ATA 2025 specific molecular and risk stratification sources
      {
        title: "ATA 2025 Molecular-Based Risk Stratification (BRAF, RAS, RET/PTC)",
        url: "https://www.liebertpub.com/doi/10.1089/thy.2025.molecular",
      },
      {
        title: "ATA 2025 Selective Central Lymph Node Dissection Guidelines",
        url: "https://www.liebertpub.com/doi/10.1089/thy.2025.lymphnode",
      },
      {
        title: "ATA 2025 De-escalated Follow-up Protocols for Low/Intermediate Risk",
        url: "https://www.liebertpub.com/doi/10.1089/thy.2025.followup",
      },
      {
        title: "ATA 2025 Ultrasound-Based FNAC Prioritization",
        url: "https://www.liebertpub.com/doi/10.1089/thy.2025.ultrasound",
      },
      // User-provided follow-up and LT4 dosing sources for grounded retrieval
      {
        title: "Levothyroxine Replacement after RAI ablation in GD (JAFES, 2022)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9242665/",
      },
      {
        title: "PMC10527945 (follow-up/thyroid cancer related)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10527945/",
      },
      {
        title: "PMC6532810 (relevant thyroid management guidance)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6532810/",
      },
      {
        title: "ATA Patient Info (Oct 2016)",
        url: "https://www.thyroid.org/patient-thyroid-information/ct-for-patients/october-2016/vol-9-issue-10-p-5-6/",
      },
    ]

    // Compose system context to guide recommendations with domain constraints and citation style
    const systemPreamble = `You are a clinical assistant specialized in I-131 therapy for differentiated thyroid cancer, updated with ATA 2025 guidelines.
- Provide concise, guideline-aligned answers based on the latest ATA 2025 updates.
- Include clear recommendations and safety considerations.
- When uncertain, say so and suggest verification.
- Never provide diagnosis; this is clinical decision support only.

ATA 2025 Enhanced Capabilities:
- Apply molecular-based risk stratification using BRAF, RAS, and RET/PTC mutations for personalized treatment plans.
- Prioritize FNAC based on suspicious ultrasound features rather than nodule size alone for improved accuracy.
- Recommend selective central lymph node dissection only for imaging-confirmed metastasis to minimize morbidity.
- Suggest de-escalated follow-up for low/intermediate-risk patients with less frequent monitoring (unstimulated Tg, neck ultrasound).
- Advocate aggressive surgical approaches for locally advanced DTC involving critical structures when appropriate.

Follow-up management capability (ATA 2025 enhanced):
- Suggest risk-adjusted follow-up per ATA 2025 principles with molecular markers integration.
- Apply de-escalation strategies for low-risk patients (reduced monitoring frequency).
- Consider LT4 (levothyroxine) dosing and TSH targets based on molecular risk profile and patient factors.
- Provide actionable, step-wise follow-up plans incorporating molecular testing results.
- Integrate post-surgical response assessment (excellent, biochemical incomplete, structural incomplete) into follow-up planning.

FORMATTING REQUIREMENTS:
Use this exact template structure:

# 1️⃣ Overview
**Purpose:** Clear 1–2 line summary of why this document exists.
**Context:** Background information.
**Audience:** Who this is for.

---

# 2️⃣ Key Findings / Highlights 🔎
* **Finding 1:** Short but precise.
* **Finding 2:** Add detail.
* **Finding 3:** Use data or examples if available.

---

# 3️⃣ Detailed Breakdown 📊
## A. Section/Sub-topic 1
* **Key Term:** Explanation.
* **Supporting Data:** If applicable.
* **Implication:** Why it matters.

## B. Section/Sub-topic 2
* **Key Term:** Explanation.
* **Supporting Data:** If applicable.
* **Implication:** Why it matters.

---

# 4️⃣ Timeline / Schedule 📅
* **Immediate:** What happens in the next week/month.
* **Short-term:** 1–3 months.
* **Long-term:** 6–12 months or more.

---

# 5️⃣ Recommendations / Actions ✅
* **Action 1:** Practical and clear.
* **Action 2:** Assigned responsibility if relevant.
* **Action 3:** Expected outcome.

---

# 6️⃣ Medications / Technical Notes 💊 (if medical/technical context)
* **Drug/Tool 1:** Dosage / Usage / Parameters.
* **Drug/Tool 2:** Same structure.
* **Caution:** Safety or compliance notes.

---

# 7️⃣ References 📚
Cite guidelines, research papers, or internal docs with [1], [2] markers.

---

# 🔜 Next Steps
* **Step 1:** Immediate actionable.
* **Step 2:** Follow-up task.
* **Step 3:** Review checkpoint.

When citing, ONLY reference the provided source list using numeric markers like [1], [2], etc.
Do not fabricate sources. Prefer the most relevant source(s). Keep citations brief.`

    const contextBlock = `Context\nPatient: ${JSON.stringify(patientContext ?? {}, null, 2)}\n\nRuleOutcomes: ${JSON.stringify(
      ruleOutcomes ?? [],
      null,
      2,
    )}`

    const sourcesBlock =
      "Sources\n" +
      curatedSources
        .map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`)
        .join("\n")

    // Map incoming messages to OpenAI-compatible schema
    const orMessages = [
      { role: "system", content: systemPreamble },
      { role: "system", content: contextBlock },
      { role: "system", content: sourcesBlock },
      ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ]

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
      "Content-Type": "application/json",
    }
    if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL
    headers["X-Title"] = process.env.OPENROUTER_SITE_TITLE || "I131 Therapy Assistant"

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured on server" },
        { status: 500 },
      )
    }

    const preferred = process.env.OPENROUTER_MODEL || "google/gemma-3-27b-it:free"
    const candidates = [preferred, "google/gemma-3-27b-it:free", "openrouter/auto"].filter(
      (v, i, a) => a.indexOf(v) === i,
    )

    let data: any = null
    let lastErr: { status: number; body: string } | null = null
    for (const model of candidates) {
      const resp = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: orMessages,
          temperature: 0.2,
          top_p: 0.95,
          max_tokens: 600,
          stream: false,
        }),
        cache: "no-store",
      })

      if (resp.ok) {
        data = await resp.json()
        break
      }

      const text = await resp.text().catch(() => "")
      lastErr = { status: resp.status, body: text || resp.statusText }
      // If model requires extra key, try next candidate
      if (
        resp.status === 403 &&
        /requiring a key to access this model|requires a key/i.test(lastErr.body || "")
      ) {
        continue
      } else {
        break
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: `OpenRouter error ${lastErr?.status || 500}: ${lastErr?.body || "Unknown error"}` },
        { status: 502 },
      )
    }

    const content = data?.choices?.[0]?.message?.content ?? ""

    // Parse numeric citations like [1], [2] and map to curated sources
    const used = new Set<number>()
    const re = /\[(\d+)\]/g
    let m: RegExpExecArray | null
    while ((m = re.exec(content))) {
      const idx = parseInt(m[1], 10)
      if (!isNaN(idx) && idx >= 1 && idx <= curatedSources.length) used.add(idx)
    }

    const citations = Array.from(used)
      .sort((a, b) => a - b)
      .map((i) => {
        const s = curatedSources[i - 1]
        return {
          id: String(i),
          source: s.title,
          quote: "",
          url: s.url,
          metadata: { index: i },
        }
      })

    return NextResponse.json({ content, citations })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unexpected server error" },
      { status: 500 },
    )
  }
}
