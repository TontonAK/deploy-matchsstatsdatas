"use client";

import { motion } from "framer-motion";
import { Control, Controller } from "react-hook-form";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { KickStatCreateFormSchema } from "@/schemas/kick-stat-create.schema";

interface KickStep3ResultFormProps {
  control: Control<KickStatCreateFormSchema>;
  showErrors?: boolean;
}

export function KickStep3ResultForm({
  control,
  showErrors = false,
}: KickStep3ResultFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="deadBall">Ballon mort</Label>
        <Controller
          name="deadBall"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Le coup de pied a-t-il fini en ballon mort ?" />
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

      <div className="space-y-2">
        <Label htmlFor="success">Résultat du coup de pied</Label>
        <Controller
          name="success"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Le coup de pied est-il réussi ?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Réussi</SelectItem>
                  <SelectItem value="false">Manqué</SelectItem>
                </SelectContent>
              </Select>
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">
          Commentaire 
          <span className="text-muted-foreground text-sm ml-1">(optionnel)</span>
        </Label>
        <Controller
          name="comment"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Textarea
                {...field}
                placeholder="Ajoutez un commentaire sur ce coup de pied (optionnel)..."
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {field.value?.length || 0}/500 caractères
              </p>
            </div>
          )}
        />
      </div>

      <div className="p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">
          <strong>Information :</strong> Si le coup de pied est réussi et qu'il s'agit 
          d'un drop, d'une transformation ou d'une pénalité tentée, la statistique 
          correspondante "réussie" sera automatiquement mise à jour.
        </p>
      </div>
    </motion.div>
  );
}