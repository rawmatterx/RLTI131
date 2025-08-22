"use client"

import { useState } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, BookOpen, AlertCircle } from "lucide-react"
import { rulesEngine } from "@/src/modules/rules/engine"

interface RuleExplainDrawerProps {
  ruleId: string | null
  isOpen: boolean
  onClose: () => void
}

export function RuleExplainDrawer({ ruleId, isOpen, onClose }: RuleExplainDrawerProps) {
  const [explanation, setExplanation] = useState<{
    text: string
    rationale: string
    references?: string[]
  } | null>(null)

  // Load explanation when drawer opens
  useState(() => {
    if (ruleId && isOpen) {
      const exp = rulesEngine.explain(ruleId)
      setExplanation(exp)
    }
  })

  if (!ruleId || !explanation) {
    return null
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-accent" />
              </div>
              <div>
                <DrawerTitle className="text-lg">Rule Explanation</DrawerTitle>
                <DrawerDescription>Clinical rationale and evidence</DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {/* Rule ID Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {ruleId}
            </Badge>
          </div>

          {/* Main Explanation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Clinical Rule</h3>
            <p className="text-foreground leading-relaxed">{explanation.text}</p>
          </div>

          {/* Rationale */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Clinical Rationale</h3>
            <div className="p-4 bg-muted rounded-lg border-l-4 border-accent">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-foreground leading-relaxed">{explanation.rationale}</p>
              </div>
            </div>
          </div>

          {/* References */}
          {explanation.references && explanation.references.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">References</h3>
              <ul className="space-y-2">
                {explanation.references.map((ref, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-accent font-medium text-sm mt-1">[{index + 1}]</span>
                    <span className="text-sm text-muted-foreground">{ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advisory Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Advisory Notice:</strong> This information is for clinical decision support only. Always consult
              current clinical guidelines and use professional judgment when making treatment decisions.
            </p>
          </div>
        </div>

        <DrawerFooter className="border-t border-border">
          <DrawerClose asChild>
            <Button variant="outline" className="bg-transparent">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
