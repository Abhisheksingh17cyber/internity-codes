"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Zap, Shield } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white relative overflow-hidden">

      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-100 h-100 bg-white/3 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-75 h-75 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[100px_100px] pointer-events-none" />

      <div className="z-10 text-center space-y-12 max-w-4xl">

        {/* Logo/Brand */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
            INTERNITY
            <span className="text-neutral-600">-CODES</span>
          </h1>
          <p className="text-neutral-500 text-sm md:text-base tracking-[0.3em] uppercase mt-4">
            Professional Code Environment
          </p>
        </div>

        {/* Main CTA */}
        <div className="space-y-6">
          <Button
            size="lg"
            className="bg-white text-black hover:bg-neutral-100 px-12 py-8 text-xl font-black tracking-tight gap-3 rounded-full shadow-2xl shadow-white/10 transition-all hover:scale-105"
            onClick={() => signIn("google")}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Loading..." : "START CODING"}
            <ArrowRight className="w-6 h-6" />
          </Button>

          <p className="text-neutral-600 text-sm">
            Sign in with Google to continue
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 pt-8">
          <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-800 rounded-full px-4 py-2 text-sm text-neutral-400">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-800 rounded-full px-4 py-2 text-sm text-neutral-400">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Secure Auth</span>
          </div>
          <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-800 rounded-full px-4 py-2 text-sm text-neutral-400">
            <Code2 className="w-4 h-4 text-blue-500" />
            <span>Multi-Language</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-neutral-700 text-xs font-mono tracking-widest">
        © 2024 INTERNITY-CODES
      </div>
    </main>
  );
}
