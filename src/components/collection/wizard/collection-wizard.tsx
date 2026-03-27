import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { STEPS, INITIAL_WIZARD_DATA, type WizardData } from "./types";
import { StepIdentification } from "./step-identification";
import { StepSampling } from "./step-sampling";
import { StepQuality } from "./step-quality";
import { StepPhotos } from "./step-photos";
import { StepPayment } from "./step-payment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function CollectionWizard() {
  const navigate = useNavigate();
  const createCollection = useMutation(api.mutations.collections.create);
  const generateUploadUrl = useMutation(api.mutations.photos.generateUploadUrl);

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_WIZARD_DATA);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 0: // Identification
        if (!data.date) return "La date est obligatoire";
        if (!data.supplier) return "Veuillez sélectionner un fournisseur";
        return null;
      case 1: // Échantillonnage
        if (!data.bagsInStock || data.bagsInStock <= 0) return "Le nombre de sacs est obligatoire";
        if (!data.estimatedStockKg || data.estimatedStockKg <= 0) return "L'estimation du stock est obligatoire";
        if (!data.bagsSampled || data.bagsSampled <= 0) return "Le nombre de sacs échantillonnés est obligatoire";
        if (data.bagsSampled > data.bagsInStock) return "Les sacs échantillonnés ne peuvent pas dépasser le stock";
        return null;
      case 2: // Qualité
        if (data.visualAspect < 1 || data.visualAspect > 5) return "Aspect visuel invalide";
        if (data.homogeneity < 1 || data.homogeneity > 5) return "Homogénéité invalide";
        if (data.cleanliness < 1 || data.cleanliness > 5) return "Propreté invalide";
        if (data.husking < 1 || data.husking > 5) return "Décorticage invalide";
        if (data.humidity < 0 || data.humidity > 30) return "Humidité invalide";
        return null;
      case 3: // Photos
        if (data.photos.length === 0) return "Au moins 1 photo est requise";
        return null;
      case 4: // Paiement
        if (!data.supplier) return "Fournisseur manquant";
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const validationError = validateStep(currentStep);
    if (validationError) { setError(validationError); return; }
    setError("");
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setError("");
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      const validationError = validateStep(i);
      if (validationError) { setError(validationError); setCurrentStep(i); return; }
    }
    if (!data.supplier) return;

    setSubmitting(true); setError("");
    try {
      const photoIds: string[] = [];
      for (const photo of data.photos) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": photo.type }, body: photo });
        const { storageId } = await result.json();
        photoIds.push(storageId);
      }
      await createCollection({
        date: data.date, supplierId: data.supplier.id, supplierType: data.supplier.type,
        location: data.location || undefined, gpsLat: data.gpsLat ?? undefined, gpsLng: data.gpsLng ?? undefined,
        bagsInStock: data.bagsInStock as number, estimatedStockKg: data.estimatedStockKg as number,
        bagsSampled: data.bagsSampled as number, photoIds,
        payRepresentative: data.supplier.type === "cooperative" ? data.payRepresentative : undefined,
        memberAllocations: data.supplier.type === "cooperative" && !data.payRepresentative && data.memberAllocations.length > 0
          ? data.memberAllocations.filter((a) => a.stockKg > 0).map((a) => ({ memberId: a.memberId as any, memberName: a.memberName, stockKg: a.stockKg }))
          : undefined,
        visualAspect: data.visualAspect,
        humidity: data.humidity,
        homogeneity: data.homogeneity,
        cleanliness: data.cleanliness,
        husking: data.husking,
      });
      navigate("/?submitted=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la soumission");
    } finally { setSubmitting(false); }
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const StepComponent = [StepIdentification, StepSampling, StepQuality, StepPhotos, StepPayment][currentStep];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} disabled={submitting}>&larr; Retour</Button>
        <h1 className="text-xl sm:text-2xl font-bold">Nouvelle collecte</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center w-full gap-1">
        {STEPS.map((step, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className={cn(
              "h-2 w-full rounded-full transition-colors",
              index <= currentStep ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]",
            )} />
            <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
              <step.icon className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">{step.label}</span>
            </span>
          </div>
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
        <StepComponent data={data} onChange={handleChange} />
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 0 || submitting}>&larr; Précédent</Button>
        {isLastStep ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Spinner size="sm" />}
            {submitting ? "Envoi en cours..." : "Soumettre la collecte"}
          </Button>
        ) : (
          <Button onClick={handleNext}>Suivant &rarr;</Button>
        )}
      </div>
    </div>
  );
}
