"use client";

import { motion } from "framer-motion";
import { Control, Controller } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineoutStatCreateFormSchema } from "@/schemas/lineout-stat-create.schema";

interface Step3NumberFormProps {
  control: Control<LineoutStatCreateFormSchema>;
  showErrors?: boolean;
}

export function Step3NumberForm({ control, showErrors = false }: Step3NumberFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="nbPlayer">Nombre de joueurs en touche</Label>
        <Controller
          name="nbPlayer"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                id="nbPlayer"
                type="number"
                min={3}
                max={7}
                placeholder="Saisir le nombre de joueurs"
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  field.onChange(value);
                }}
                onBlur={field.onBlur}
                className="w-full"
              />
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
        <p className="text-sm text-muted-foreground">
          Nombre de joueurs participant à la touche (minimum 3, maximum 7)
        </p>
      </div>
    </motion.div>
  );
}
