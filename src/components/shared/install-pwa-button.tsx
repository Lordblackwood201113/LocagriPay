import { Download } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function InstallPWAButton() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();

  if (isInstalled || !canInstall) return null;

  return (
    <button
      type="button"
      onClick={promptInstall}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-geo-border bg-geo-bg/50 text-xs font-bold uppercase tracking-[0.15em] text-geo-dark transition-colors hover:bg-geo-bg"
    >
      <Download className="h-3.5 w-3.5 text-geo-orange" />
      Installer l'application
    </button>
  );
}
