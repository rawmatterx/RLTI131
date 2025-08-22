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
  ArrowRight,
  Zap,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { useSessionStore } from "@/src/store"
import { useEffect, useMemo, useState } from "react"

export default function Dashboard() {
  const { timeline, ruleResults } = useSessionStore()
  const [mounted, setMounted] = useState(false)
  const [lastSync, setLastSync] = useState<string>("—")

  useEffect(() => {
    setMounted(true)
    setLastSync(new Date().toLocaleString())
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Modern Header with Glassmorphism */}
      <header className="glass border-b border-glass-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">I-131 Therapy Assistant</h1>
                <p className="text-muted-foreground font-medium">Clinical Decision Support System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="status-info border-2 px-4 py-2 font-semibold">
                Advisory Only
              </Badge>
              <Button variant="ghost" size="sm" className="hover:bg-accent/10">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Enhanced Disclaimer Banner */}
        <div className="mb-12 p-6 glass rounded-2xl border-2 border-clinical-warning/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-clinical-warning/10 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-clinical-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Important Clinical Notice</h3>
              <p className="text-muted-foreground leading-relaxed">
                This system provides advisory information only and is not intended for autonomous clinical decisions. 
                Always consult current clinical guidelines and use professional judgment. All recommendations require 
                physician verification and approval.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Activity className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Today's Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-hover border-2 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Sessions Today</p>
                    <p className="text-4xl font-bold text-primary">{todaysSessions}</p>
                    <p className="text-sm text-clinical-success mt-1">+12% from yesterday</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-2 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Unresolved Flags</p>
                    <p className="text-4xl font-bold text-clinical-error">{unresolvedFlags}</p>
                    <p className="text-sm text-muted-foreground mt-1">Require attention</p>
                  </div>
                  <div className="p-4 bg-clinical-error/10 rounded-2xl">
                    <AlertTriangle className="h-8 w-8 text-clinical-error" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-2 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">System Status</p>
                    <p className="text-lg font-semibold text-clinical-success">Online</p>
                    <p className="text-sm text-muted-foreground mt-1">Last sync: {lastSync}</p>
                  </div>
                  <div className="p-4 bg-clinical-success/10 rounded-2xl">
                    <Calendar className="h-8 w-8 text-clinical-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Start New Assessment */}
          <Card className="card-hover border-2 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Start New Assessment</CardTitle>
                  <CardDescription className="text-base">
                    Begin patient intake and eligibility evaluation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Collect patient demographics, clinical history, lab results, and run comprehensive eligibility rules 
                for I-131 therapy with real-time validation and safety checks.
              </p>
              <Link href="/assessment">
                <Button className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 group-hover:shadow-lg transition-all duration-300">
                  Start Assessment
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Continue Session */}
          <Card className="card-hover border-2 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-muted/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-secondary/20 rounded-2xl group-hover:bg-secondary/30 transition-colors duration-300">
                  <FileText className="h-8 w-8 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Continue Session</CardTitle>
                  <CardDescription className="text-base">
                    Resume previous patient evaluation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Return to an in-progress assessment or review completed evaluations with comprehensive timeline 
                history and audit trails.
              </p>
              <Link href="/sessions">
                <Button variant="outline" className="w-full h-12 text-base font-semibold border-2 hover:bg-secondary/10 group-hover:shadow-lg transition-all duration-300">
                  View Sessions
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="card-hover border-2 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-colors duration-300 animate-pulse-glow">
                  <Brain className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">AI Assistant</CardTitle>
                  <CardDescription className="text-base">
                    Chat with clinical knowledge assistant
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Get evidence-based guidance on I-131 therapy protocols, safety measures, patient preparation, 
                and clinical decision support with real-time citations.
              </p>
              <Link href="/assistant">
                <Button className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 group-hover:shadow-lg transition-all duration-300">
                  Open Assistant
                  <MessageSquare className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Protocol Library */}
          <Card className="card-hover border-2 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-muted/20 rounded-2xl group-hover:bg-muted/30 transition-colors duration-300">
                  <BookOpen className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Protocol Library</CardTitle>
                  <CardDescription className="text-base">
                    Access standardized treatment protocols
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Browse comprehensive preparation protocols, dosing guidelines, and patient handouts for various 
                I-131 therapy scenarios with export capabilities.
              </p>
              <Link href="/protocols">
                <Button variant="outline" className="w-full h-12 text-base font-semibold border-2 hover:bg-muted/10 group-hover:shadow-lg transition-all duration-300">
                  Browse Protocols
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Safety Center */}
          <Card className="card-hover border-2 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-clinical-warning/5 to-clinical-error/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-clinical-warning/10 rounded-2xl group-hover:bg-clinical-warning/20 transition-colors duration-300">
                  <Shield className="h-8 w-8 text-clinical-warning" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Safety Center</CardTitle>
                  <CardDescription className="text-base">
                    Checklists and discharge planning
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Complete comprehensive safety checklists, verify isolation protocols, and generate detailed 
                discharge instructions with digital sign-offs.
              </p>
              <Link href="/safety">
                <Button variant="outline" className="w-full h-12 text-base font-semibold border-2 hover:bg-clinical-warning/5 group-hover:shadow-lg transition-all duration-300">
                  Safety Tools
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Settings */}
          <Card className="card-hover border-2 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-border/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-muted/20 rounded-2xl group-hover:bg-muted/30 transition-colors duration-300">
                  <Settings className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Admin Settings</CardTitle>
                  <CardDescription className="text-base">
                    System configuration and data management
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Configure API settings, manage data retention policies, export comprehensive session data, 
                and customize system preferences for your institution.
              </p>
              <Link href="/admin">
                <Button variant="outline" className="w-full h-12 text-base font-semibold border-2 hover:bg-muted/10 group-hover:shadow-lg transition-all duration-300">
                  Settings
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gradient mb-4">Powered by Advanced AI</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Leveraging Google's Gemma 3 model for intelligent clinical decision support with evidence-based recommendations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-6 bg-clinical-success/10 rounded-2xl w-fit mx-auto mb-4">
                <Brain className="h-12 w-12 text-clinical-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Intelligent Analysis</h3>
              <p className="text-muted-foreground">Advanced rule-based evaluation with AI-powered insights</p>
            </div>
            
            <div className="text-center">
              <div className="p-6 bg-clinical-info/10 rounded-2xl w-fit mx-auto mb-4">
                <Shield className="h-12 w-12 text-clinical-info" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safety First</h3>
              <p className="text-muted-foreground">Comprehensive safety protocols and radiation protection</p>
            </div>
            
            <div className="text-center">
              <div className="p-6 bg-clinical-warning/10 rounded-2xl w-fit mx-auto mb-4">
                <FileText className="h-12 w-12 text-clinical-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Evidence-Based</h3>
              <p className="text-muted-foreground">Guidelines from ATA, SNMMI, and international standards</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}