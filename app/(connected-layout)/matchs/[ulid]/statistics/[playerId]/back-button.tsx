"use client";

import { Button } from "@/components/ui/button";

export function BackButton() {
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <Button onClick={handleBack} variant="outline">
      Retour à la page précédente
    </Button>
  );
}