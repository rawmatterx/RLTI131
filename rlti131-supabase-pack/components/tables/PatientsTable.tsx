
"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/exportCsv";

export type Patient = {
  id: string;
  name: string;
  mrn: string;
  status: "Pre-therapy" | "Therapy Day" | "Post-therapy" | "Follow-up";
  scheduled_at: string;
  therapy: "I-131";
  notes?: string;
};

export function PatientsTable({ data, onRowClick }: { data?: Patient[]; onRowClick: (p: Patient) => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("All");
  const [remote, setRemote] = useState<Patient[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && data.length) return;
    setLoading(true);
    const url = `/api/patients?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&page=1&pageSize=200`;
    fetch(url).then(r => r.json()).then((res) => {
      if (res?.data) setRemote(res.data);
    }).finally(() => setLoading(false));
  }, [q, status, data]);

  const rows = data && data.length ? data : (remote || []);

  const filtered = useMemo(() => {
    return rows.filter(p => {
      const matchesQ = (p.name + p.mrn + p.id).toLowerCase().includes(q.toLowerCase());
      const matchesStatus = status === "All" ? true : p.status === status;
      return matchesQ && matchesStatus;
    }).sort((a,b) => a.scheduled_at.localeCompare(b.scheduled_at));
  }, [rows, q, status]);

  const exportRows = () => {
    exportToCsv("patients.csv", filtered.map(p => ({
      id: p.id, name: p.name, mrn: p.mrn, status: p.status, therapy: p.therapy, scheduled_at: p.scheduled_at, notes: p.notes || ""
    })));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="flex-1">
          <Input placeholder="Search name, MRN, ID…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Pre-therapy">Pre-therapy</SelectItem>
            <SelectItem value="Therapy Day">Therapy Day</SelectItem>
            <SelectItem value="Post-therapy">Post-therapy</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportRows} disabled={filtered.length === 0}>Export CSV</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Scheduled</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Therapy</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <Table>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50" onClick={() => onRowClick(p)}>
                  <TableCell className="whitespace-nowrap">{new Date(p.scheduled_at).toLocaleString()}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.mrn}</TableCell>
                  <TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
                  <TableCell><Badge>{p.therapy}</Badge></TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost">Open</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {loading && <div className="p-6 text-sm text-zinc-500">Loading…</div>}
        {!loading && filtered.length === 0 && <div className="p-6 text-sm text-zinc-500">No patients match your filters.</div>}
      </div>
    </div>
  );
}
