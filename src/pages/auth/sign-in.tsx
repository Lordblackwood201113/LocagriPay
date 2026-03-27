import { useAuth, SignIn } from "@clerk/react";
import { Navigate } from "react-router-dom";

function RiceEars({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        width="60"
        height="180"
        viewBox="0 0 60 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 180 Q30 90 28 0"
          stroke="#C88045"
          strokeWidth="1.5"
          fill="none"
        />
        <ellipse
          cx="22"
          cy="30"
          rx="8"
          ry="16"
          fill="#C88045"
          transform="rotate(-20 22 30)"
        />
        <ellipse
          cx="36"
          cy="45"
          rx="7"
          ry="14"
          fill="#C88045"
          transform="rotate(15 36 45)"
        />
        <ellipse
          cx="20"
          cy="65"
          rx="8"
          ry="15"
          fill="#C88045"
          transform="rotate(-25 20 65)"
        />
        <ellipse
          cx="38"
          cy="80"
          rx="7"
          ry="14"
          fill="#C88045"
          transform="rotate(20 38 80)"
        />
        <ellipse
          cx="22"
          cy="100"
          rx="7"
          ry="13"
          fill="#C88045"
          transform="rotate(-15 22 100)"
        />
        <ellipse
          cx="36"
          cy="118"
          rx="6"
          ry="12"
          fill="#C88045"
          transform="rotate(18 36 118)"
        />
        <ellipse
          cx="24"
          cy="135"
          rx="6"
          ry="11"
          fill="#C88045"
          transform="rotate(-12 24 135)"
        />
        <ellipse
          cx="27"
          cy="12"
          rx="5"
          ry="12"
          fill="#C88045"
          transform="rotate(-5 27 12)"
        />
      </svg>
      <svg
        width="50"
        height="150"
        viewBox="0 0 50 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 150 Q26 75 24 0"
          stroke="#EFECE5"
          strokeWidth="1.2"
          fill="none"
        />
        <ellipse
          cx="18"
          cy="25"
          rx="7"
          ry="14"
          fill="#EFECE5"
          transform="rotate(-18 18 25)"
        />
        <ellipse
          cx="32"
          cy="40"
          rx="6"
          ry="12"
          fill="#EFECE5"
          transform="rotate(14 32 40)"
        />
        <ellipse
          cx="17"
          cy="58"
          rx="7"
          ry="13"
          fill="#EFECE5"
          transform="rotate(-22 17 58)"
        />
        <ellipse
          cx="33"
          cy="73"
          rx="6"
          ry="12"
          fill="#EFECE5"
          transform="rotate(16 33 73)"
        />
        <ellipse
          cx="19"
          cy="90"
          rx="6"
          ry="11"
          fill="#EFECE5"
          transform="rotate(-14 19 90)"
        />
        <ellipse
          cx="30"
          cy="105"
          rx="5"
          ry="10"
          fill="#EFECE5"
          transform="rotate(12 30 105)"
        />
        <ellipse
          cx="23"
          cy="12"
          rx="5"
          ry="11"
          fill="#EFECE5"
          transform="rotate(-4 23 12)"
        />
      </svg>
      <svg
        width="45"
        height="160"
        viewBox="0 0 45 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 160 Q23 80 21 0"
          stroke="#C88045"
          strokeWidth="1.3"
          fill="none"
        />
        <ellipse
          cx="16"
          cy="22"
          rx="7"
          ry="13"
          fill="#C88045"
          transform="rotate(-16 16 22)"
        />
        <ellipse
          cx="29"
          cy="38"
          rx="6"
          ry="12"
          fill="#C88045"
          transform="rotate(12 29 38)"
        />
        <ellipse
          cx="15"
          cy="55"
          rx="7"
          ry="13"
          fill="#C88045"
          transform="rotate(-20 15 55)"
        />
        <ellipse
          cx="30"
          cy="70"
          rx="6"
          ry="11"
          fill="#C88045"
          transform="rotate(18 30 70)"
        />
        <ellipse
          cx="17"
          cy="88"
          rx="6"
          ry="11"
          fill="#C88045"
          transform="rotate(-13 17 88)"
        />
        <ellipse
          cx="28"
          cy="103"
          rx="5"
          ry="10"
          fill="#C88045"
          transform="rotate(10 28 103)"
        />
        <ellipse
          cx="19"
          cy="118"
          rx="5"
          ry="9"
          fill="#C88045"
          transform="rotate(-10 19 118)"
        />
        <ellipse
          cx="20"
          cy="10"
          rx="4"
          ry="10"
          fill="#C88045"
          transform="rotate(-3 20 10)"
        />
      </svg>
    </div>
  );
}

function RiceEarsMobile({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        width="40"
        height="120"
        viewBox="0 0 40 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 120 Q20 60 18 0"
          stroke="#2D4F42"
          strokeWidth="1.2"
          fill="none"
        />
        <ellipse
          cx="14"
          cy="20"
          rx="6"
          ry="12"
          fill="#2D4F42"
          transform="rotate(-18 14 20)"
        />
        <ellipse
          cx="26"
          cy="34"
          rx="5"
          ry="10"
          fill="#2D4F42"
          transform="rotate(14 26 34)"
        />
        <ellipse
          cx="13"
          cy="50"
          rx="6"
          ry="11"
          fill="#2D4F42"
          transform="rotate(-22 13 50)"
        />
        <ellipse
          cx="27"
          cy="64"
          rx="5"
          ry="10"
          fill="#2D4F42"
          transform="rotate(16 27 64)"
        />
        <ellipse
          cx="15"
          cy="80"
          rx="5"
          ry="9"
          fill="#2D4F42"
          transform="rotate(-14 15 80)"
        />
        <ellipse
          cx="24"
          cy="93"
          rx="4"
          ry="8"
          fill="#2D4F42"
          transform="rotate(10 24 93)"
        />
        <ellipse
          cx="18"
          cy="8"
          rx="4"
          ry="9"
          fill="#2D4F42"
          transform="rotate(-4 18 8)"
        />
      </svg>
      <svg
        width="35"
        height="100"
        viewBox="0 0 35 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 100 Q18 50 16 0"
          stroke="#C88045"
          strokeWidth="1.1"
          fill="none"
        />
        <ellipse
          cx="12"
          cy="18"
          rx="5"
          ry="10"
          fill="#C88045"
          transform="rotate(-16 12 18)"
        />
        <ellipse
          cx="23"
          cy="30"
          rx="5"
          ry="9"
          fill="#C88045"
          transform="rotate(12 23 30)"
        />
        <ellipse
          cx="11"
          cy="44"
          rx="5"
          ry="10"
          fill="#C88045"
          transform="rotate(-20 11 44)"
        />
        <ellipse
          cx="24"
          cy="56"
          rx="5"
          ry="9"
          fill="#C88045"
          transform="rotate(14 24 56)"
        />
        <ellipse
          cx="13"
          cy="70"
          rx="4"
          ry="8"
          fill="#C88045"
          transform="rotate(-12 13 70)"
        />
        <ellipse
          cx="16"
          cy="7"
          rx="4"
          ry="8"
          fill="#C88045"
          transform="rotate(-3 16 7)"
        />
      </svg>
      <svg
        width="40"
        height="110"
        viewBox="0 0 40 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 110 Q21 55 19 0"
          stroke="#2D4F42"
          strokeWidth="1.2"
          fill="none"
        />
        <ellipse
          cx="14"
          cy="18"
          rx="6"
          ry="11"
          fill="#2D4F42"
          transform="rotate(-15 14 18)"
        />
        <ellipse
          cx="27"
          cy="32"
          rx="5"
          ry="10"
          fill="#2D4F42"
          transform="rotate(13 27 32)"
        />
        <ellipse
          cx="13"
          cy="48"
          rx="6"
          ry="11"
          fill="#2D4F42"
          transform="rotate(-20 13 48)"
        />
        <ellipse
          cx="27"
          cy="62"
          rx="5"
          ry="10"
          fill="#2D4F42"
          transform="rotate(16 27 62)"
        />
        <ellipse
          cx="15"
          cy="78"
          rx="5"
          ry="9"
          fill="#2D4F42"
          transform="rotate(-12 15 78)"
        />
        <ellipse
          cx="19"
          cy="7"
          rx="4"
          ry="9"
          fill="#2D4F42"
          transform="rotate(-3 19 7)"
        />
      </svg>
    </div>
  );
}

export default function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-geo-bg">
      {/* Left panel — branding (hidden on mobile, replaced by compact header) */}
      <div className="hidden md:flex md:w-[42%] lg:w-[42%] bg-geo-green flex-col justify-between p-[60px] relative overflow-hidden">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-geo-orange flex items-center justify-center rounded-sm">
            <span className="text-lg font-black text-[#EFECE5]">L</span>
          </div>
          <span className="text-sm font-bold text-[#EFECE5] tracking-[0.15em] uppercase">
            LocagriPay
          </span>
        </div>

        {/* Hero text */}
        <div className="flex flex-col gap-5 z-10">
          <h1 className="text-5xl lg:text-[56px] font-black text-[#EFECE5] uppercase leading-[0.95] tracking-tight">
            Digitalisez
            <br />
            vos achats
            <br />
            de riz
          </h1>
          <div className="w-[60px] h-[3px] bg-geo-orange" />
          <p className="text-sm text-[#EFECE5]/60 leading-relaxed max-w-[380px]">
            Collecte terrain, contrôle qualité et paiement mobile money — une
            plateforme unifiée pour la filière rizicole.
          </p>
        </div>

        {/* Rice ears decoration */}
        <RiceEars className="flex items-end gap-4 z-10 opacity-25" />
      </div>

      {/* Mobile header (visible only on mobile) */}
      <div className="flex md:hidden flex-col bg-geo-green px-7 pt-12 pb-9 gap-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 bg-geo-orange flex items-center justify-center rounded-sm">
            <span className="text-[15px] font-black text-[#EFECE5]">L</span>
          </div>
          <span className="text-xs font-bold text-[#EFECE5] tracking-[0.15em] uppercase">
            LocagriPay
          </span>
        </div>
        <div className="flex flex-col gap-3 z-10">
          <h1 className="text-[28px] font-black text-[#EFECE5] uppercase leading-[0.95] tracking-tight">
            Digitalisez
            <br />
            vos achats de riz
          </h1>
          <div className="w-10 h-0.5 bg-geo-orange" />
        </div>
      </div>

      {/* Right panel — Sign in form */}
      <div className="flex-1 flex flex-col justify-between bg-geo-card md:items-center md:justify-center px-7 md:px-[60px] py-8 md:py-[60px]">
        <div className="w-full max-w-[380px] flex flex-col gap-10 md:gap-10">
          {/* Header */}
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-geo-gray">
              Espace agent
            </span>
            <h2 className="text-2xl md:text-[32px] font-extrabold uppercase text-geo-dark leading-none">
              Connexion
            </h2>
            <p className="text-[13px] text-geo-gray leading-relaxed mt-1 hidden md:block">
              Accédez à votre tableau de bord pour gérer les collectes et
              paiements.
            </p>
          </div>

          {/* Clerk SignIn component */}
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "shadow-none w-full",
                card: "shadow-none p-0 gap-4 w-full bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "bg-geo-bg border border-geo-border rounded-sm h-12 text-xs font-bold uppercase tracking-wider text-geo-dark hover:bg-geo-bg/70 transition-colors",
                socialButtonsBlockButtonText:
                  "text-xs font-bold uppercase tracking-wider",
                dividerLine: "bg-geo-border",
                dividerText:
                  "text-[10px] text-geo-gray uppercase tracking-widest font-bold",
                formFieldLabel:
                  "text-[10px] font-bold uppercase tracking-[0.15em] text-geo-gray",
                formFieldInput:
                  "h-12 bg-geo-bg border-geo-border rounded-sm px-4 text-[13px] text-geo-dark placeholder:text-geo-gray/50 focus:border-geo-green focus:ring-1 focus:ring-geo-green/20",
                formFieldAction:
                  "text-[11px] text-geo-orange font-semibold hover:text-geo-orange/80",
                formButtonPrimary:
                  "h-[52px] bg-geo-green hover:bg-[#1E362D] rounded-sm text-xs font-bold uppercase tracking-[0.15em] text-[#EFECE5] shadow-none transition-colors",
                footerAction: "justify-center",
                footerActionLink:
                  "text-geo-orange font-semibold hover:text-geo-orange/80",
                footerActionText: "text-xs text-geo-gray",
                formFieldInputShowPasswordButton: "text-geo-gray hover:text-geo-dark",
                identityPreview:
                  "bg-geo-bg border-geo-border rounded-sm",
                identityPreviewEditButton:
                  "text-geo-orange hover:text-geo-orange/80",
                alternativeMethodsBlockButton:
                  "text-xs text-geo-gray hover:text-geo-dark",
                alert: "bg-red-50 border-red-200 text-red-700 rounded-sm text-xs",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                showOptionalFields: false,
              },
            }}
          />
        </div>

        {/* Mobile rice ears */}
        <RiceEarsMobile className="flex md:hidden items-end justify-center gap-3 opacity-15 mt-4" />
      </div>
    </div>
  );
}
