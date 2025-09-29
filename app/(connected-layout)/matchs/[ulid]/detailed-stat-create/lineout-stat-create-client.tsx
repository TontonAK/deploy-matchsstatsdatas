"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";
import {
  LineoutStatCreateFormSchema,
  LineoutStatCreateSchema,
} from "@/schemas/lineout-stat-create.schema";
import { Step1TeamForm } from "./components/lineout/step1-team-form";
import { Step2AreaForm } from "./components/lineout/step2-area-form";
import { Step3NumberForm } from "./components/lineout/step3-number-form";
import { Step4ResultForm } from "./components/lineout/step4-result-form";
import { createLineoutStatAction } from "./lineout-stat-create.action";

interface MatchData {
  id: number;
  ulid: string;
  homeTeam: { id: number; name: string; club: { name: string } };
  awayTeam: { id: number; name: string; club: { name: string } };
  homeLineup: {
    playerId: string;
    number: number;
    player: { firstname: string; lastname: string };
  }[];
  awayLineup: {
    playerId: string;
    number: number;
    player: { firstname: string; lastname: string };
  }[];
}

interface LineoutStatCreateClientProps {
  matchData: MatchData;
  matchUlid: string;
}

const steps = [
  { id: 1, label: "Équipe", description: "Sélection équipe et joueur" },
  { id: 2, label: "Zone terrain", description: "Zone de jeu" },
  { id: 3, label: "Nombre", description: "Joueurs en touche" },
  { id: 4, label: "Zone saut & résultat", description: "Détails et résultat" },
];

export function LineoutStatCreateClient({
  matchData,
  matchUlid,
}: LineoutStatCreateClientProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepValidationErrors, setStepValidationErrors] = useState<
    Record<number, boolean>
  >({});
  const router = useRouter();

  const { control, handleSubmit, watch, trigger } =
    useForm<LineoutStatCreateFormSchema>({
      resolver: zodResolver(LineoutStatCreateSchema),
      mode: "onSubmit",
      defaultValues: {
        matchUlid: matchUlid,
      },
    });

  const watchedTeamId = watch("teamId");

  // Validation selon l'étape courante
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof LineoutStatCreateFormSchema)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["teamId"];
        break;
      case 2:
        fieldsToValidate = ["area"];
        break;
      case 3:
        fieldsToValidate = ["nbPlayer"];
        break;
      case 4:
        fieldsToValidate = ["catchBlockArea", "success"];
        break;
      default:
        return false;
    }

    const isStepValid = await trigger(fieldsToValidate);

    // Marquer cette étape comme ayant été validée pour afficher les erreurs
    setStepValidationErrors((prev) => ({
      ...prev,
      [currentStep]: !isStepValid,
    }));

    return isStepValid;
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      // Réinitialiser les erreurs pour la prochaine étape
      setStepValidationErrors((prev) => ({
        ...prev,
        [currentStep + 1]: false,
      }));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: LineoutStatCreateFormSchema) => {
    if (currentStep !== steps.length) return;

    setIsSubmitting(true);

    try {
      const result = await createLineoutStatAction(data);

      if (result?.serverError) {
        const errorMessage = typeof result.serverError === 'string'
          ? result.serverError
          : "Erreur lors de la création de la statistique";
        toast.error(errorMessage);
      } else if (result?.data) {
        toast.success("Statistique de touche créée avec succès !");
        router.push(`/matchs/${matchUlid}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitError = () => {
    // Si on arrive ici, c'est que la validation finale a échoué
    // On affiche les erreurs de l'étape courante
    setStepValidationErrors((prev) => ({
      ...prev,
      [currentStep]: true,
    }));
    toast.error("Veuillez corriger les erreurs avant de valider");
  };

  const renderCurrentStepForm = () => {
    const showErrors = stepValidationErrors[currentStep] || false;

    switch (currentStep) {
      case 1:
        return (
          <Step1TeamForm
            control={control}
            matchData={matchData}
            selectedTeamId={watchedTeamId}
            showErrors={showErrors}
          />
        );
      case 2:
        return <Step2AreaForm control={control} showErrors={showErrors} />;
      case 3:
        return <Step3NumberForm control={control} showErrors={showErrors} />;
      case 4:
        return <Step4ResultForm control={control} showErrors={showErrors} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  return (
    <div className="container max-w-4xl mx-auto pt-15">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Créer une statistique détaillée
          </h1>
          <p className="text-muted-foreground">
            Match: {matchData.homeTeam.club.name} vs{" "}
            {matchData.awayTeam.club.name}
          </p>
        </div>

        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Étape {currentStep} : {steps[currentStep - 1].label}
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit, onSubmitError)}>
            <CardContent className="min-h-[300px]">
              {renderCurrentStepForm()}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={cn("flex items-center gap-2")}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn("flex items-center gap-2")}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    <>
                      Valider
                      <Check className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className={cn("flex items-center gap-2")}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
