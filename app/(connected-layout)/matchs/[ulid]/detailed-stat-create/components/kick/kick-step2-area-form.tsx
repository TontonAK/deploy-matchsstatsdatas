"use client";

import { motion } from "framer-motion";
import { Control, Controller } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group";
import { GroundArea } from "@/generated/prisma";
import { GroundAreaName } from "@/lib/utils";
import { KickStatCreateFormSchema } from "@/schemas/kick-stat-create.schema";

interface KickStep2AreaFormProps {
  control: Control<KickStatCreateFormSchema>;
  selectedStatTypeName?: string;
  showErrors?: boolean;
}

export function KickStep2AreaForm({
  control,
  selectedStatTypeName,
  showErrors = false,
}: KickStep2AreaFormProps) {
  // Déterminer si on doit afficher le champ zone de chute
  const shouldShowEndArea =
    selectedStatTypeName &&
    !["Drops tentés", "Transformations tentées", "Pénalités tentées"].includes(
      selectedStatTypeName
    );

  // Convertir les valeurs enum en options pour le select
  const groundAreaOptions = Object.entries(GroundAreaName).map(
    ([key, value]) => ({
      value: key as GroundArea,
      label: value,
    })
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <Label htmlFor="startAreaKick">Zone de frappe</Label>
        <Controller
          name="startAreaKick"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <RadioGroup
                value={field.value}
                onValueChange={(value) => field.onChange(value as GroundArea)}
                className="grid grid-cols-2 md:grid-cols-2 gap-3"
              >
                {groundAreaOptions.map((option) => (
                  <RadioCard
                    key={option.value}
                    value={option.value}
                    text={option.label}
                  />
                ))}
              </RadioGroup>
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {shouldShowEndArea && (
        <div className="space-y-3 mb-5">
          <Label htmlFor="endAreaKick">Zone de chute du ballon</Label>
          <Controller
            name="endAreaKick"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div>
                <RadioGroup
                  value={field.value || ""}
                  onValueChange={(value) => field.onChange(value as GroundArea)}
                  className="grid grid-cols-2 md:grid-cols-2 gap-3"
                >
                  <RadioCard value="none" text="Aucune zone spécifique" />
                  {groundAreaOptions.map((option) => (
                    <RadioCard
                      key={option.value}
                      value={option.value}
                      text={option.label}
                    />
                  ))}
                </RadioGroup>
                {showErrors && error && (
                  <p className="text-sm text-destructive mt-1">
                    {error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      )}

      {!shouldShowEndArea && selectedStatTypeName && (
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Note :</strong> Pour les{" "}
            {selectedStatTypeName.toLowerCase()}, la zone de chute n'est pas
            applicable car l'objectif est de marquer des points.
          </p>
        </div>
      )}
    </motion.div>
  );
}
