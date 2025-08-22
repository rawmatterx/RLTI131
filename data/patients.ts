export type Patient = {
  id: string
  name: string
  mrn: string
  status: "Pre-therapy" | "Therapy Day" | "Post-therapy" | "Follow-up"
  scheduledAt: string
  therapy: "I-131"
  notes?: string
}

export const patients: Patient[] = [
  { id: "A102", name: "Anjali Verma", mrn: "MRN-0001", status: "Pre-therapy", scheduledAt: "2025-08-23T09:30:00+05:30", therapy: "I-131", notes: "Needs TSH report" },
  { id: "B221", name: "Rohit Mehra", mrn: "MRN-0002", status: "Therapy Day", scheduledAt: "2025-08-23T11:00:00+05:30", therapy: "I-131" },
  { id: "C044", name: "Fatima Khan", mrn: "MRN-0003", status: "Post-therapy", scheduledAt: "2025-08-23T15:00:00+05:30", therapy: "I-131", notes: "Post-care call pending" },
  { id: "D310", name: "Sanjay Patel", mrn: "MRN-0004", status: "Follow-up", scheduledAt: "2025-08-24T10:15:00+05:30", therapy: "I-131" },
  { id: "E155", name: "Meera Joshi", mrn: "MRN-0005", status: "Pre-therapy", scheduledAt: "2025-08-24T12:00:00+05:30", therapy: "I-131" },
]


