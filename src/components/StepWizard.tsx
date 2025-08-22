"use client"

import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StepWizardProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
}

export function StepWizard({ children, currentStep, totalSteps }: StepWizardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      <Card>
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </div>
  )
}
