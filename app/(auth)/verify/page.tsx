"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center justify-center">
        <Image src="/logo.png" alt="Logo du club" width={125} height={125} />
      </div>

      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Mail className="h-16 w-16 text-primary" />
            <CheckCircle className="h-6 w-6 text-green-500 absolute -top-1 -right-1 bg-background rounded-full" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">
            Un email contenant un lien de réinitialisation de mot de passe vient
            d'être envoyé à votre adresse email.
          </p>
          <p className="text-sm text-muted-foreground">
            Vérifiez votre boîte de réception (et vos spams) puis cliquez sur le
            lien pour réinitialiser votre mot de passe.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/login">Retour login</Link>
        </Button>
      </div>
    </div>
  );
}
