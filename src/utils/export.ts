import type { Assessment, SessionEvent, Protocol } from "@/src/types"
import jsPDF from "jspdf"

export interface ExportOptions {
  format: "pdf" | "csv" | "json"
  includeTimestamps?: boolean
  includeAuditTrail?: boolean
  anonymize?: boolean
}

export class ExportService {
  static async exportAssessment(assessment: Assessment, options: ExportOptions = { format: "pdf" }) {
    const data = {
      assessment,
      exportedAt: new Date().toISOString(),
      exportedBy: "Current User", // Would get from auth context
      ...(options.includeAuditTrail && { auditTrail: await this.getAuditTrail(assessment.patient?.id || "unknown") }),
    }

    switch (options.format) {
      case "pdf":
        return this.generatePDF(data, "assessment")
      case "csv":
        return this.generateCSV(data, "assessment")
      case "json":
        return this.generateJSON(data)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  static async exportProtocol(protocol: Protocol, options: ExportOptions = { format: "pdf" }) {
    const data = {
      protocol,
      exportedAt: new Date().toISOString(),
      exportedBy: "Current User",
    }

    switch (options.format) {
      case "pdf":
        return this.generateProtocolPDF(data)
      case "json":
        return this.generateJSON(data)
      default:
        throw new Error(`Unsupported export format for protocols: ${options.format}`)
    }
  }

  static async exportSessionData(sessionId: string, options: ExportOptions = { format: "json" }) {
    const sessionData = await this.getSessionData(sessionId)
    const data = {
      session: sessionData,
      events: await this.getSessionEvents(sessionId),
      exportedAt: new Date().toISOString(),
      exportedBy: "Current User",
    }

    if (options.anonymize) {
      data.session = this.anonymizeData(data.session)
    }

    switch (options.format) {
      case "pdf":
        return this.generatePDF(data, "session")
      case "csv":
        return this.generateCSV(data, "session")
      case "json":
        return this.generateJSON(data)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  static async exportAuditLogs(dateRange: { start: Date; end: Date }, options: ExportOptions = { format: "csv" }) {
    const auditLogs = await this.getAuditLogs(dateRange)
    const data = {
      auditLogs,
      dateRange,
      exportedAt: new Date().toISOString(),
      exportedBy: "Current User",
    }

    switch (options.format) {
      case "csv":
        return this.generateCSV(data, "audit")
      case "json":
        return this.generateJSON(data)
      default:
        throw new Error(`Unsupported export format for audit logs: ${options.format}`)
    }
  }

  private static async generatePDF(data: any, type: string): Promise<Blob> {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 48
    let y = margin
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(`I-131 Therapy Assistant — ${type.toUpperCase()} Summary`, margin, y)
    y += 20
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date(data.exportedAt || new Date().toISOString()).toLocaleString()}`, margin, y)
    y += 16

    const lines = this.formatForPDF(data, type).split('\n')
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 595 - margin * 2)
      wrapped.forEach((l: string) => {
        if (y > 800 - margin) {
          doc.addPage(); y = margin
        }
        doc.text(l, margin, y)
        y += 14
      })
    })

    const blob = doc.output('blob') as Blob
    return blob
  }

  private static async generateProtocolPDF(data: any): Promise<Blob> {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 48
    let y = margin
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(`I-131 Therapy Protocol`, margin, y)
    y += 20
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const lines = this.formatProtocolForPDF(data).split('\n')
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 595 - margin * 2)
      wrapped.forEach((l: string) => {
        if (y > 800 - margin) { doc.addPage(); y = margin }
        doc.text(l, margin, y)
        y += 14
      })
    })
    return doc.output('blob') as Blob
  }

  private static generateCSV(data: any, type: string): Blob {
    let csvContent = ""

    switch (type) {
      case "assessment":
        csvContent = this.formatAssessmentAsCSV(data)
        break
      case "session":
        csvContent = this.formatSessionAsCSV(data)
        break
      case "audit":
        csvContent = this.formatAuditAsCSV(data)
        break
      default:
        csvContent = this.formatGenericAsCSV(data)
    }

    return new Blob([csvContent], { type: "text/csv" })
  }

  private static generateJSON(data: any): Blob {
    const jsonContent = JSON.stringify(data, null, 2)
    return new Blob([jsonContent], { type: "application/json" })
  }

  private static formatForPDF(data: any, type: string): string {
    // Mock PDF content generation
    return `
      I-131 Therapy Assistant - ${type.toUpperCase()} Export
      
      Generated: ${data.exportedAt}
      Exported by: ${data.exportedBy}
      
      ${JSON.stringify(data, null, 2)}
    `
  }

  private static formatProtocolForPDF(data: any): string {
    const protocol: Protocol = data.protocol
    return `
      I-131 THERAPY PROTOCOL
      
      Protocol: ${protocol.title}
      Category: ${protocol.category}
      
      CLINICIAN VIEW:
      ${protocol.clinicianView}
      
      PATIENT HANDOUT:
      ${protocol.patientHandout}
      
      Generated: ${data.exportedAt}
    `
  }

  private static formatAssessmentAsCSV(data: any): string {
    const assessment: Assessment = data.assessment
    const headers = ["Field", "Value"]
    const rows: Array<[string, string | number | boolean | null | undefined]> = [
      ["Patient ID", assessment.patient?.id],
      ["Sex", assessment.patient?.sex],
      ["DOB", assessment.patient?.dob],
      ["Diagnosis", assessment.clinical?.diagnosis],
      ["Prep Path", assessment.prep?.path],
      ["Low Iodine Diet", assessment.prep?.lowIodineDiet],
      ["Contraindications", assessment.contraindications?.join("; ")],
      ["Medications", assessment.medications],
    ]
    return [headers, ...rows].map((row) => row.map((v) => (v == null ? "" : String(v))).join(",")).join("\n")
  }

  private static formatSessionAsCSV(data: any): string {
    const headers = ["Timestamp", "Event Type", "Description"]
    const rows = data.events.map((event: SessionEvent) => [
      event.timestamp.toISOString(),
      event.type,
      event.description,
    ])
    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  }

  private static formatAuditAsCSV(data: any): string {
    const headers = ["Timestamp", "User", "Action", "Resource", "Details"]
    const rows = data.auditLogs.map((log: any) => [log.timestamp, log.user, log.action, log.resource, log.details])

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  }

  private static formatGenericAsCSV(data: any): string {
    // Fallback CSV formatter
    return Object.entries(data)
      .map(([key, value]) => `${key},${value}`)
      .join("\n")
  }

  private static async getSessionData(sessionId: string) {
    // Mock session data retrieval
    return {
      id: sessionId,
      startTime: new Date().toISOString(),
      endTime: null,
      userId: "current-user",
      patientId: "patient-123",
    }
  }

  private static async getSessionEvents(sessionId: string): Promise<SessionEvent[]> {
    // Mock session events retrieval (conform to SessionEvent type)
    return [
      {
        id: "1",
        timestamp: new Date(),
        type: "data_collected",
        description: `Session ${sessionId} initiated`,
        data: {},
      },
    ]
  }

  private static async getAuditTrail(assessmentId: string) {
    // Mock audit trail retrieval
    return [
      {
        timestamp: new Date().toISOString(),
        action: "assessment_created",
        user: "current-user",
        details: `Assessment ${assessmentId} created`,
      },
    ]
  }

  private static async getAuditLogs(dateRange: { start: Date; end: Date }) {
    // Mock audit logs retrieval
    return [
      {
        timestamp: new Date().toISOString(),
        user: "Dr. Smith",
        action: "assessment_completed",
        resource: "assessment-123",
        details: "I-131 eligibility assessment completed",
      },
    ]
  }

  private static anonymizeData(data: any) {
    // Remove or hash sensitive information
    const anonymized = { ...data }
    if (anonymized.patientId) {
      anonymized.patientId = `ANON_${anonymized.patientId.slice(-4)}`
    }
    if (anonymized.demographics) {
      delete anonymized.demographics.name
      delete anonymized.demographics.mrn
    }
    return anonymized
  }

  static downloadBlob(blob: Blob, filename: string) {
    try {
      // IE/Edge legacy
      // @ts-ignore
      if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
        // @ts-ignore
        navigator.msSaveOrOpenBlob(blob, filename)
        return
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.setAttribute('download', filename.endsWith('.pdf') ? filename : `${filename}.pdf`)

      // Safari/iOS fallback: open in new tab if download unsupported
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isSafari || isIOS || typeof a.download === 'undefined') {
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 4000)
        return
      }

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('[export] download failed', e)
    }
  }
}
