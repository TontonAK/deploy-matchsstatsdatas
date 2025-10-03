"use client";

import { motion } from "framer-motion";
import { Control, Controller } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group";
import { LineoutStatCreateFormSchema } from "@/schemas/lineout-stat-create.schema";

interface Step3NumberFormProps {
  control: Control<LineoutStatCreateFormSchema>;
  showErrors?: boolean;
}

export function Step3NumberForm({
  control,
  showErrors = false,
}: Step3NumberFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <Label htmlFor="nbPlayer">Nb de joueurs en touche</Label>
        <Controller
          name="nbPlayer"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <RadioGroup
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
                className="grid grid-cols-2 md:grid-cols-5 gap-3"
              >
                <RadioCard value="3" text="3 joueurs" />
                <RadioCard value="4" text="4 joueurs" />
                <RadioCard value="5" text="5 joueurs" />
                <RadioCard value="6" text="6 joueurs" />
                <RadioCard value="7" text="7 joueurs" />
              </RadioGroup>
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
      </div>
    </motion.div>
  );
}
