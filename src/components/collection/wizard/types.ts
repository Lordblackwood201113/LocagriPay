import type { SelectedSupplier } from "@/components/supplier/supplier-picker";
import { ClipboardList, FlaskConical, Microscope, Camera, Wallet, type LucideIcon } from "lucide-react";

export interface WizardData {
  // Step 1: Identification
  date: string;
  supplier: SelectedSupplier | null;
  location: string;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsStatus: "idle" | "loading" | "success" | "error";

  // Step 2: Sampling
  bagsInStock: number | "";
  estimatedStockKg: number | "";
  bagsSampled: number | "";

  // Step 3: Quality
  visualAspect: number;
  humidity: number;
  homogeneity: number;
  cleanliness: number;
  husking: number;

  // Step 4: Photos
  photos: File[];

  // Step 5: Payment
  payRepresentative: boolean;
  memberAllocations: { memberId: string; memberName: string; stockKg: number }[];
}

export const INITIAL_WIZARD_DATA: WizardData = {
  date: new Date().toISOString().split("T")[0],
  supplier: null,
  location: "",
  gpsLat: null,
  gpsLng: null,
  gpsStatus: "idle",
  bagsInStock: "",
  estimatedStockKg: "",
  bagsSampled: "",
  visualAspect: 3,
  humidity: 14,
  homogeneity: 3,
  cleanliness: 3,
  husking: 3,
  photos: [],
  payRepresentative: false,
  memberAllocations: [],
};

export const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: "Identification", icon: ClipboardList },
  { label: "Échantillonnage", icon: FlaskConical },
  { label: "Qualité", icon: Microscope },
  { label: "Photos", icon: Camera },
  { label: "Paiement", icon: Wallet },
];

export type StepProps = {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
};
