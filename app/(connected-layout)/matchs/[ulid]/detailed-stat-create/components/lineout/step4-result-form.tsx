"use client";

import { motion } from "framer-motion";
import { Control, Controller, useWatch } from "react-hook-form";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CatchBlockAreaLineout } from "@/generated/prisma";
import { AreaLineoutName } from "@/lib/utils";
import { LineoutStatCreateFormSchema } from "@/schemas/lineout-stat-create.schema";

interface Step4ResultFormProps {
  control: Control<LineoutStatCreateFormSchema>;
  showErrors?: boolean;
}

export function Step4ResultForm({ control, showErrors = false }: Step4ResultFormProps) {
  // Observer si la touche est un échec pour afficher le textarea
  const success = useWatch({
    control,
    name: "success",
  });

  const isFailure = success === false;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="catchBlockArea">Zone de saut</Label>
        <Controller
          name="catchBlockArea"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Select
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(value as CatchBlockAreaLineout)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la zone de saut" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AreaLineoutName).map(([key, value]) => (
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
          Zone où le ballon est arrivé lors de la touche
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="success">Touche réussie ?</Label>
        <Controller
          name="success"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Select
                value={field.value !== undefined ? String(field.value) : ""}
                onValueChange={(value) => field.onChange(value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le résultat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Oui</SelectItem>
                  <SelectItem value="false">Non</SelectItem>
                </SelectContent>
              </Select>
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {isFailure && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2 pb-4"
        >
          <Label htmlFor="failReason">Raison de l'échec (facultatif)</Label>
          <Controller
            name="failReason"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div>
                <Textarea
                  id="failReason"
                  placeholder="Décrire la raison de l'échec de la touche..."
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  rows={3}
                />
                {showErrors && error && (
                  <p className="text-sm text-destructive mt-1">
                    {error.message}
                  </p>
                )}
              </div>
            )}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
