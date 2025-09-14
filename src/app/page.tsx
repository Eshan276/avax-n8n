"use client";
import LightRays from "@/components/LightRays";
import Link from "next/link";
 // Make sure this file exists in app/LightRays.tsx

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background light rays */}
      <div className="absolute inset-0 -z-10">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>

      {/* Foreground content */}
      <div className="mb-4">
        <img
          src="/logo.png"
          alt="AVAX n8n Logo"
          className="h-24 w-auto mx-auto drop-shadow-lg"
        />
      </div>
      <p className="text-lg mb-8 text-white drop-shadow font-mono">
        Build and automate Web3 workflows on Avalanche!
      </p>
      <Link href="/workflow">
        <button className="bg-transparent text-white px-6 py-3 rounded-lg border border-white  hover:text-gray transition font-mono">
          Go to Workflow Builder
        </button>
      </Link>
    </main>
  );
}
