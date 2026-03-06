import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold">FORGE</div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-gray-300">
              Docs
            </Link>
            <Link href="/pricing" className="hover:text-gray-300">
              Pricing
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          AI Coding API
          <br />
          <span className="text-gray-400">Built for Developers</span>
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          OpenAI-compatible API powered by state-of-the-art Sparse MoE models.
          Fast, reliable, and cost-effective code generation.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 rounded-lg bg-white text-black font-semibold hover:bg-gray-200"
          >
            Get Started Free
          </Link>
          <Link
            href="/docs"
            className="px-8 py-4 rounded-lg border border-gray-600 hover:border-gray-400"
          >
            View Documentation
          </Link>
        </div>

        {/* Code Example */}
        <div className="mt-24 max-w-3xl mx-auto text-left">
          <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm">
            <div className="text-gray-400 mb-2"># OpenAI-compatible API</div>
            <pre className="text-green-400">
{`curl https://api.forge.ai/v1/chat/completions \\
  -H "Authorization: Bearer sk-forge-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "forge-coder",
    "messages": [
      {"role": "user", "content": "Write a Python quicksort"}
    ]
  }'`}
            </pre>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-lg bg-gray-800/50">
            <h3 className="text-xl font-semibold mb-2">OpenAI Compatible</h3>
            <p className="text-gray-400">
              Drop-in replacement for OpenAI API. Switch with one line of code.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-gray-800/50">
            <h3 className="text-xl font-semibold mb-2">Fast & Reliable</h3>
            <p className="text-gray-400">
              Powered by vLLM with optimized inference. Sub-second first token.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-gray-800/50">
            <h3 className="text-xl font-semibold mb-2">Cost Effective</h3>
            <p className="text-gray-400">
              Sparse MoE architecture means lower costs without sacrificing quality.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <div className="text-gray-400">© 2024 FORGE. All rights reserved.</div>
          <div className="flex gap-6 text-gray-400">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
