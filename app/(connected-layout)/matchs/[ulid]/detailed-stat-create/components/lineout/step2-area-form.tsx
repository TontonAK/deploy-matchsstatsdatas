"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Control, Controller } from "react-hook-form"

import { LineoutStatCreateFormSchema } from "@/schemas/lineout-stat-create.schema"
import { GroundAreaName } from "@/lib/utils"
import { GroundArea } from "@/generated/prisma"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Step2AreaFormProps {
  control: Control<LineoutStatCreateFormSchema>
  showErrors?: boolean
}

export function Step2AreaForm({ control, showErrors = false }: Step2AreaFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="area">Zone du terrain</Label>
        <Controller
          name="area"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value as GroundArea)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la zone du terrain" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GroundAreaName).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
        <p className="text-sm text-muted-foreground">
          Sélectionnez la zone du terrain où la touche a été jouée
        </p>
      </div>
    </motion.div>
  )
}