import { useAuth, SignUp } from "@clerk/react";
import { Navigate } from "react-router-dom";

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--muted))] px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">LOCAGRI PAY</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">
          Plateforme de digitalisation des achats de riz
        </p>
      </div>

      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl rounded-lg",
          },
        }}
      />

      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-8">
        &copy; {new Date().getFullYear()} LOCAGRI PAY
      </p>
    </div>
  );
}
