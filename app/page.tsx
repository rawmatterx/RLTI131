"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useSessionStore } from "@/src/store"
import { useEffect, useMemo, useState } from "react"

export default function Dashboard() {
  const { timeline, ruleResults } = useSessionStore()

  // Avoid hydration mismatch by deferring dynamic values to client mount
  const [mounted, setMounted] = useState(false)
  const [lastSync, setLastSync] = useState<string>("—")

  useEffect(() => {
    setMounted(true)
    setLastSync(new Date().toLocaleString())
  }, [])

  // Calculate KPIs after mount to keep SSR/CSR markup identical initially
  const todaysSessions = useMemo(() => {
    if (!mounted) return 0
    const today = new Date().toDateString()
    return timeline.filter((event) => new Date(event.timestamp as unknown as string | Date).toDateString() === today)
      .length
  }, [mounted, timeline])

  const unresolvedFlags = useMemo(() => {
    if (!mounted) return 0
    return ruleResults.filter((result) => result.severity === "FAIL").length
  }, [mounted, ruleResults])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">I-131 Therapy Assistant</h1>
              <p className="text-sm text-muted-foreground">Clinical Decision Support System</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                Advisory Only
              </Badge>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Disclaimer Banner */}
        <div className="mb-8 p-4 bg-muted border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <p className="text-sm font-medium">
              <strong>Important:</strong> This system provides advisory information only and is not intended for
              autonomous clinical decisions. Always consult current clinical guidelines and use professional judgment.
            </p>
          </div>
        </div>

        {/* KPI Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Today's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sessions Today</p>
                    <p className="text-2xl font-bold text-primary">{todaysSessions}</p>
                  </div>
                  <Activity className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unresolved Flags</p>
                    <p className="text-2xl font-bold text-destructive">{unresolvedFlags}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Sync</p>
                    <p className="text-sm font-medium text-foreground">{lastSync}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Start New Assessment */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="bg-primary text-primary-foreground">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <div>
                  <CardTitle className="text-lg">Start New Assessment</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Begin patient intake and eligibility evaluation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Collect patient demographics, clinical history, lab results, and run eligibility rules for I-131
                therapy.
              </p>
              <Link href="/assessment">
                <Button className="w-full">Start Assessment</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Continue Session */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="bg-secondary text-secondary-foreground">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                <div>
                  <CardTitle className="text-lg">Continue Session</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Resume previous patient evaluation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Return to an in-progress assessment or review completed evaluations with timeline history.
              </p>
              <Link href="/sessions">
                <Button variant="outline" className="w-full bg-transparent">View Sessions</Button>
              </Link>
            </CardContent>
          </Card>

          {/* RAG Assistant */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="bg-accent text-accent-foreground">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6" />
                <div>
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  <CardDescription className="text-accent-foreground/80">
                    Chat with clinical knowledge assistant
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Get evidence-based guidance on I-131 therapy protocols, safety measures, and patient preparation.
              </p>
              <Link href="/assistant">
                <Button variant="outline" className="w-full bg-transparent">
                  Open Assistant
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Protocol Library */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="bg-muted text-muted-foreground">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6" />
                <div>
                  <CardTitle className="text-lg text-foreground">Protocol Library</CardTitle>
                  <CardDescription>Access standardized treatment protocols</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Browse preparation protocols, dosing guidelines, and patient handouts for various I-131 therapy
                scenarios.
              </p>
              <Link href="/protocols">
                <Button variant="outline" className="w-full bg-transparent">
                  Browse Protocols
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Safety Center */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="bg-muted text-muted-foreground">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6" />
                <div>
                  <CardTitle className="text-lg text-foreground">Safety Center</CardTitle>
                  <CardDescription>Checklists and discharge planning</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Complete safety checklists, verify isolation protocols, and generate discharge instructions.
              </p>
              <Link href="/safety">
                <Button variant="outline" className="w-full bg-transparent">
                  Safety Tools
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Settings */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="bg-muted text-muted-foreground">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6" />
                <div>
                  <CardTitle className="text-lg text-foreground">Admin Settings</CardTitle>
                  <CardDescription>System configuration and data management</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Configure API settings, manage data retention, export sessions, and customize system preferences.
              </p>
              <Link href="/admin">
                <Button variant="outline" className="w-full bg-transparent">
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
