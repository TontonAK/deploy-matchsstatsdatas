"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatValueType } from "@/generated/prisma";
import { useState, useEffect } from "react";

interface StatCardEditableProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isEditable?: boolean;
  valueType?: StatValueType;
  statTypeId?: number;
  onValueChange?: (statTypeId: number, newValue: number) => void;
}

export function StatCardEditable({ 
  title, 
  value, 
  subtitle, 
  isEditable = false, 
  valueType = StatValueType.Number,
  statTypeId,
  onValueChange 
}: StatCardEditableProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser la valeur de l'input
  useEffect(() => {
    if (!isInitialized) {
      const numericValue = typeof value === 'string' ? 
        parseInt(value.replace(/[^\d]/g, '')) || 0 : 
        value;
      setInputValue(numericValue.toString());
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Accepter seulement les nombres positifs
    if (/^\d*$/.test(newValue)) {
      setInputValue(newValue);
      
      // Notifier le parent du changement si on a un callback et un statTypeId
      if (onValueChange && statTypeId !== undefined) {
        const numValue = parseInt(newValue) || 0;
        onValueChange(statTypeId, numValue);
      }
    }
  };

  const handleInputBlur = () => {
    // Si l'input est vide, le remettre à 0
    if (inputValue === '') {
      setInputValue('0');
      if (onValueChange && statTypeId !== undefined) {
        onValueChange(statTypeId, 0);
      }
    }
  };

  // Déterminer si on peut éditer cette statistique
  const canEdit = isEditable && valueType === StatValueType.Number;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-bold uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {canEdit ? (
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="text-2xl font-bold text-center border-2 border-blue-200 focus:border-blue-500 transition-colors"
            placeholder="0"
          />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}