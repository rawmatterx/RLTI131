"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, FileText, MessageSquare, Shield, Users, Brain, Zap } from "lucide-react"
import Link from "next/link"

function HeroHeader() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">I-131 Therapy Assistant</h1>
            <p className="text-gray-600 mt-1">Clinical Decision Support System</p>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">Advisory Only</Badge>
        </div>
      </div>
    </div>
  )
}

function ClinicalNotice() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900">Important Clinical Notice</h3>
          <p className="text-sm text-red-800 mt-1">
            This system provides advisory information only and is not intended for autonomous clinical decisions. 
            Always consult current clinical guidelines and use professional judgment. All recommendations require 
            physician verification and approval.
          </p>
        </div>
      </div>
    </div>
  )
}

function ClinicalTools() {
  const tools = [
    {
      icon: FileText,
      title: "Start New Assessment",
      description: "Begin patient intake and eligibility evaluation",
      details: "Collect patient demographics, clinical history, lab results, and run comprehensive eligibility rules for I-131 therapy with real-time validation and safety checks.",
      href: "/assessment",
      buttonText: "Get Started",
      color: "blue"
    },
    {
      icon: MessageSquare,
      title: "AI Assistant", 
      description: "Chat with clinical knowledge assistant",
      details: "Get evidence-based guidance on I-131 therapy protocols, safety measures, patient preparation, and clinical decision support with real-time citations.",
      href: "/assistant",
      buttonText: "Get Started",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Safety Center",
      description: "Checklists and discharge planning", 
      details: "Complete comprehensive safety checklists, verify isolation protocols, and generate detailed discharge instructions with digital sign-offs.",
      href: "/safety",
      buttonText: "Get Started",
      color: "blue"
    }
  ]

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Clinical Tools</h2>
      <p className="text-gray-600 mb-8">Access your primary workflow and decision support tools</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Card key={tool.title} className="group hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-2xl border shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">{tool.title}</CardTitle>
                <CardDescription className="text-gray-600">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{tool.details}</p>
                <Link href={tool.href}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    {tool.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PoweredByAI() {
  const features = [
    {
      icon: Brain,
      title: "Intelligent Analysis",
      description: "Advanced rule-based evaluation with AI-powered insights"
    },
    {
      icon: Shield, 
      title: "Safety First",
      description: "Comprehensive safety protocols and radiation protection"
    },
    {
      icon: FileText,
      title: "Evidence-Based", 
      description: "Guidelines from ATA, SNMMI, and international standards"
    }
  ]

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-blue-600" />
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Powered by Advanced AI</h2>
      </div>
      <p className="text-gray-600 mb-12 max-w-3xl mx-auto">
        Leveraging Google's Gemma 3 model for intelligent clinical decision support with evidence-based recommendations
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="text-center">
              <div className="p-4 bg-gray-50 rounded-2xl w-fit mx-auto mb-4">
                <Icon className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ClinicalNotice />
        <ClinicalTools />
        <PoweredByAI />
      </main>
    </div>
  )
}