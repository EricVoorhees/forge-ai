import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4" style={{ minHeight: '100dvh' }}>
      {/* Logo */}
      <Link href="/" className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">FORGE</h1>
      </Link>
      
      <SignUp 
        appearance={{
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#18181b",
            colorInputBackground: "#27272a",
            colorInputText: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "#a1a1aa",
            colorDanger: "#ef4444",
            borderRadius: "0.75rem",
          },
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
            headerTitle: "text-white text-xl font-semibold",
            headerSubtitle: "text-zinc-400 text-sm",
            socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 transition-colors",
            socialButtonsBlockButtonText: "text-white font-medium",
            formFieldLabel: "text-zinc-300 text-sm",
            formFieldInput: "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500",
            formButtonPrimary: "bg-white text-black font-semibold hover:bg-zinc-200 transition-colors",
            footerActionLink: "text-white hover:text-zinc-300 font-medium",
            footerActionText: "text-zinc-400",
            dividerLine: "bg-zinc-700",
            dividerText: "text-zinc-500",
            identityPreviewText: "text-white",
            identityPreviewEditButton: "text-zinc-400 hover:text-white",
            formResendCodeLink: "text-white hover:text-zinc-300",
            // Waitlist specific styling
            alert: "bg-zinc-800 border-zinc-700 text-zinc-300",
            alertText: "text-zinc-300",
            formFieldSuccessText: "text-green-400",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
      />
      
      {/* Back to home link */}
      <Link 
        href="/" 
        className="mt-8 text-zinc-500 hover:text-white text-sm transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  );
}
