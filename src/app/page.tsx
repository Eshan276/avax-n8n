
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Welcome to AVAX n8n</h1>
      <p className="text-lg mb-8">
        Build and automate Web3 workflows on Avalanche!
      </p>
      <Link href="/workflow">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
          Go to Workflow Builder
        </button>
      </Link>
    </main>
  );
}
