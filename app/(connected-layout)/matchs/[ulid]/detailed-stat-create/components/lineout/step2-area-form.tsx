"use client";

import { motion } from "framer-motion";
import { Control, Controller } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group";
import { GroundArea } from "@/generated/prisma";
import { GroundAreaName } from "@/lib/utils";
import { LineoutStatCreateFormSchema } from "@/schemas/lineout-stat-create.schema";

interface Step2AreaFormProps {
  control: Control<LineoutStatCreateFormSchema>;
  showErrors?: boolean;
}

export function Step2AreaForm({
  control,
  showErrors = false,
}: Step2AreaFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <Label htmlFor="area">Dans quel zone terrain ?</Label>
        <Controller
          name="area"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <RadioGroup
                value={field.value}
                onValueChange={(value) => field.onChange(value as GroundArea)}
                className="grid grid-cols-2 md:grid-cols-2 gap-3"
              >
                {Object.entries(GroundAreaName).map(([key, value]) => (
                  <RadioCard key={key} value={key} text={value} />
                ))}
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
