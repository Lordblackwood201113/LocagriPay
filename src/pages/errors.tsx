import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--muted))] px-4">
      <div className="text-center">
        <span className="text-6xl block mb-4">404</span>
        <h1 className="text-2xl font-bold mb-2">Page non trouvée</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
      </div>
    </div>
  );
}

export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--muted))] px-4">
      <div className="text-center">
        <span className="text-6xl block mb-4">403</span>
        <h1 className="text-2xl font-bold mb-2">Accès non autorisé</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
      </div>
    </div>
  );
}

export function ErrorBoundaryFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--muted))] px-4">
      <div className="text-center">
        <span className="text-6xl block mb-4">Oups</span>
        <h1 className="text-2xl font-bold mb-2">Une erreur est survenue</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">Veuillez rafraîchir la page ou réessayer plus tard.</p>
        <Button onClick={() => window.location.reload()}>Rafraîchir la page</Button>
      </div>
    </div>
  );
}
