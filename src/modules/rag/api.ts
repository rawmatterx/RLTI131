import type { ChatMessage, Citation } from "../../types"

export interface AssistantRequest {
  messages: ChatMessage[]
  patientContext?: any
  ruleOutcomes?: any[]
}

export interface AssistantResponse {
  content: string
  citations?: Citation[]
}

export class RAGAssistant {
  private baseUrl: string

  constructor(baseUrl = "/api/assistant") {
    this.baseUrl = baseUrl
  }

  async *streamResponse(request: AssistantRequest): AsyncGenerator<string, void, unknown> {
    try {
      const resp = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          patientContext: request.patientContext,
          ruleOutcomes: request.ruleOutcomes,
        }),
      })

      if (!resp.ok) {
        const text = await resp.text().catch(() => "")
        throw new Error(`Assistant API error ${resp.status}: ${text || resp.statusText}`)
      }

      const data: AssistantResponse & { error?: string } = await resp.json()
      if ((data as any).error) throw new Error((data as any).error)

      const content = data.content || ""
      // Yield pseudo-streaming chunks for smooth UX
      const words = content.split(" ")
      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 15))
        yield words[i] + " "
      }
    } catch (error) {
      console.error("[v0] RAG Assistant error:", error)
      yield "I apologize, but I encountered an error generating a response. Please try again or contact support if the issue persists."
    }
  }

  // Non-streaming completion that returns content and citations
  async completeOnce(request: AssistantRequest): Promise<AssistantResponse> {
    const resp = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        patientContext: request.patientContext,
        ruleOutcomes: request.ruleOutcomes,
      }),
    })
    if (!resp.ok) {
      const text = await resp.text().catch(() => "")
      throw new Error(`Assistant API error ${resp.status}: ${text || resp.statusText}`)
    }
    const data: AssistantResponse & { error?: string } = await resp.json()
    if ((data as any).error) throw new Error((data as any).error)
    return { content: data.content || "", citations: data.citations || [] }
  }

  async getCitations(messageId: string): Promise<Citation[]> {
    // Enhanced mock citations with clinical sources
    return [
      {
        id: "1",
        source: "ATA Guidelines 2015",
        quote:
          "A low-iodine diet should be followed for 1-2 weeks before radioiodine therapy to optimize thyroidal radioiodine uptake.",
        metadata: {
          page: 12,
          section: "Pre-therapy Preparation",
          authors: "Haugen BR, Alexander EK, Bible KC, et al.",
          journal: "Thyroid",
          year: 2016,
        },
      },
      {
        id: "2",
        source: "SNMMI Procedure Standard",
        quote:
          "TSH stimulation to levels >30 mIU/L is recommended to optimize radioiodine uptake and therapeutic efficacy.",
        metadata: {
          page: 8,
          section: "Patient Preparation",
          document: "SNMMI Procedure Standard for Therapy of Thyroid Disease with I-131",
          version: "3.0",
          year: 2012,
        },
      },
      {
        id: "3",
        source: "Radiation Safety Guidelines",
        quote:
          "Patients should maintain appropriate distance from pregnant women and children during the isolation period following I-131 therapy.",
        metadata: {
          page: 15,
          section: "Post-therapy Precautions",
          organization: "Nuclear Regulatory Commission",
          document: "Regulatory Guide 8.39",
        },
      },
    ]
  }

  // Optional helper to get concise recommendations directly (non-streaming)
  async generateRecommendations(args: {
    patientContext?: any
    ruleOutcomes?: any[]
    promptOverride?: string
  }): Promise<AssistantResponse> {
    const { patientContext, ruleOutcomes, promptOverride } = args
    const messages = [
      {
        role: "user" as const,
        content:
          promptOverride ||
          "Provide concise, actionable recommendations for I-131 therapy given the provided patient context and rule outcomes. Include preparation, safety, dosing considerations, and follow-up.",
      },
    ]

    const resp = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, patientContext, ruleOutcomes }),
    })
    if (!resp.ok) {
      const text = await resp.text().catch(() => "")
      throw new Error(`Assistant API error ${resp.status}: ${text || resp.statusText}`)
    }
    const data: AssistantResponse & { error?: string } = await resp.json()
    if ((data as any).error) throw new Error((data as any).error)
    return { content: data.content || "", citations: data.citations || [] }
  }
}

export const ragAssistant = new RAGAssistant()
