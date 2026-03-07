"use client";

import Link from "next/link";

export default function PromptsPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-[#71717a]">Guides</span>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Prompt Engineering</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Prompt Engineering
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Techniques for writing effective prompts.
          </p>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-white text-xl font-medium mb-4">Structure Your Prompts</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                A well-structured prompt has clear sections:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`# Role
You are an expert Python developer specializing in FastAPI.

# Task
Create a REST API endpoint for user authentication.

# Requirements
- Use JWT tokens
- Include refresh token logic
- Add rate limiting
- Return proper HTTP status codes

# Output Format
Provide the complete code with comments explaining each section.`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Chain of Thought</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Ask the model to think step-by-step for complex reasoning tasks:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`Solve this problem step by step:

A train leaves Station A at 9:00 AM traveling at 60 mph.
Another train leaves Station B at 10:00 AM traveling at 80 mph.
The stations are 280 miles apart.
When and where will the trains meet?

Think through each step before giving the final answer.`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Code Generation Patterns</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                For code tasks, specify language, style, and requirements:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`Write a TypeScript function with the following specifications:

Function: parseCSV
Input: string (CSV content)
Output: Array of objects with typed fields

Requirements:
- Handle quoted fields with commas
- Skip empty lines
- First row contains headers
- Include proper TypeScript types
- Add JSDoc documentation
- Include unit tests`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Debugging Prompts</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                When debugging, provide context and the error:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`I'm getting this error:

\`\`\`
TypeError: Cannot read property 'map' of undefined
    at UserList (UserList.tsx:15)
\`\`\`

Here's my code:

\`\`\`tsx
function UserList({ users }) {
  return users.map(user => <div>{user.name}</div>);
}
\`\`\`

What's causing this and how do I fix it?`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Output Formatting</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Request specific output formats for easier parsing:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`Analyze this code for security vulnerabilities.

Return your analysis as JSON with this structure:
{
  "vulnerabilities": [
    {
      "severity": "high" | "medium" | "low",
      "type": "string",
      "line": number,
      "description": "string",
      "fix": "string"
    }
  ],
  "summary": "string"
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/guides/best-practices"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Best Practices</div>
            </Link>
            <Link
              href="/docs/guides/rate-limits"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Next →</div>
              <div className="text-white text-sm font-medium">Rate Limits</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

