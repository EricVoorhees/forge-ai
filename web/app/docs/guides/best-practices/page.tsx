"use client";

import Link from "next/link";

export default function BestPracticesPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-[#71717a]">Guides</span>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Best Practices</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Best Practices
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Guidelines for getting the best results from FORGE.
          </p>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-white text-xl font-medium mb-4">Write Clear Instructions</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Be specific about what you want. Include details about format, length, style, and any constraints.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                  <div className="text-red-400 text-xs font-medium mb-2">❌ Vague</div>
                  <p className="text-[#a1a1aa] text-sm">"Write some code"</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                  <div className="text-emerald-400 text-xs font-medium mb-2">✓ Specific</div>
                  <p className="text-[#a1a1aa] text-sm">"Write a Python function that takes a list of integers and returns the two numbers that sum to a target value. Include type hints and docstring."</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Use System Messages</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Set context and behavior with a system message at the start of the conversation.
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`messages = [
    {
        "role": "system",
        "content": "You are a senior Python developer. Write clean, "
                   "well-documented code following PEP 8 guidelines. "
                   "Always include error handling and type hints."
    },
    {"role": "user", "content": "Create a file upload handler"}
]`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Provide Examples</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Show the model what you want with examples (few-shot prompting).
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`Convert the following to snake_case:

"HelloWorld" -> "hello_world"
"getUserName" -> "get_user_name"
"APIResponse" -> "api_response"

Now convert: "myVariableName"`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Adjust Temperature</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Use lower temperatures for deterministic tasks, higher for creative ones.
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Temperature</th>
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    <tr>
                      <td className="text-white px-4 py-3 font-mono">0.0 - 0.3</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Code generation, data extraction, factual Q&A</td>
                    </tr>
                    <tr>
                      <td className="text-white px-4 py-3 font-mono">0.4 - 0.7</td>
                      <td className="text-[#a1a1aa] px-4 py-3">General tasks, balanced creativity</td>
                    </tr>
                    <tr>
                      <td className="text-white px-4 py-3 font-mono">0.8 - 1.0</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Creative writing, brainstorming</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Handle Long Contexts</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                FORGE supports 128K tokens, but be strategic about what you include:
              </p>
              <ul className="space-y-2 text-[#a1a1aa]">
                <li className="flex items-start gap-3">
                  <span className="text-white/40">•</span>
                  <span>Put the most important information at the beginning or end</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white/40">•</span>
                  <span>Summarize long documents when possible</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white/40">•</span>
                  <span>Remove irrelevant content to reduce costs</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Implement Retry Logic</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Always handle transient errors with exponential backoff:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`import time
from openai import RateLimitError

def call_with_retry(func, max_retries=3):
    for i in range(max_retries):
        try:
            return func()
        except RateLimitError:
            time.sleep(2 ** i)
    raise Exception("Max retries exceeded")`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/api/errors"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Error Handling</div>
            </Link>
            <Link
              href="/docs/guides/prompts"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Next →</div>
              <div className="text-white text-sm font-medium">Prompt Engineering</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

