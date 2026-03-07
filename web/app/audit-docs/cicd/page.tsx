"use client";

import Link from "next/link";

export default function AuditCICDPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
      <div className="max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
          <span className="text-[#52525b]">/</span>
          <Link href="/audit-docs" className="text-[#71717a] hover:text-white transition-colors">Forge Audit</Link>
          <span className="text-[#52525b]">/</span>
          <span className="text-white">CI/CD Integration</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">CI/CD Integration</h1>
        <p className="text-[#a1a1aa] text-lg mb-8 leading-relaxed">
          Automate security checks on every commit, pull request, and deployment. Catch vulnerabilities before they reach production.
        </p>

        {/* Prerequisites */}
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-8">
          <h3 className="text-amber-400 font-medium mb-2">Prerequisites</h3>
          <ul className="space-y-2 text-[#a1a1aa] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              A Forge API key (get one from your <Link href="/dashboard" className="text-orange-400 hover:underline">dashboard</Link>)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              Access to your CI/CD platform's configuration
            </li>
          </ul>
        </div>

        {/* GitHub Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            GitHub Actions
          </h2>
          <p className="text-[#a1a1aa] mb-4 leading-relaxed">
            Add Forge Audit to your GitHub Actions workflow to scan code on every push and pull request.
          </p>
          
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-xl overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272a] bg-[#18181b]/50">
              <span className="text-[#52525b] text-xs font-mono">.github/workflows/security.yml</span>
              <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
            </div>
            <pre className="p-4 text-sm font-mono text-[#a1a1aa] overflow-x-auto">
{`name: Security Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Forge Audit
        uses: openframe/forge-audit@v1
        with:
          api-key: \${{ secrets.FORGE_API_KEY }}
          fail-on: critical,high
          path: ./src`}
            </pre>
          </div>

          <h4 className="text-white font-medium mb-2">Configuration options:</h4>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-3 text-[#71717a] font-medium">Option</th>
                  <th className="text-left p-3 text-[#71717a] font-medium">Description</th>
                  <th className="text-left p-3 text-[#71717a] font-medium">Default</th>
                </tr>
              </thead>
              <tbody className="text-[#a1a1aa]">
                <tr className="border-b border-white/[0.06]">
                  <td className="p-3 font-mono text-orange-400">api-key</td>
                  <td className="p-3">Your Forge API key (required)</td>
                  <td className="p-3">—</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="p-3 font-mono text-orange-400">fail-on</td>
                  <td className="p-3">Severity levels that fail the build</td>
                  <td className="p-3">critical</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="p-3 font-mono text-orange-400">path</td>
                  <td className="p-3">Directory to scan</td>
                  <td className="p-3">./</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-orange-400">output</td>
                  <td className="p-3">Output format (json, sarif, text)</td>
                  <td className="p-3">text</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* GitLab CI */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            GitLab CI
          </h2>
          
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-xl overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272a] bg-[#18181b]/50">
              <span className="text-[#52525b] text-xs font-mono">.gitlab-ci.yml</span>
              <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
            </div>
            <pre className="p-4 text-sm font-mono text-[#a1a1aa] overflow-x-auto">
{`security-audit:
  stage: test
  image: openframe/forge-audit:latest
  script:
    - forge-audit scan --api-key $FORGE_API_KEY --fail-on critical,high
  only:
    - main
    - merge_requests`}
            </pre>
          </div>
        </section>

        {/* Jenkins */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            Jenkins
          </h2>
          
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-xl overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272a] bg-[#18181b]/50">
              <span className="text-[#52525b] text-xs font-mono">Jenkinsfile</span>
              <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
            </div>
            <pre className="p-4 text-sm font-mono text-[#a1a1aa] overflow-x-auto">
{`pipeline {
  agent any
  
  environment {
    FORGE_API_KEY = credentials('forge-api-key')
  }
  
  stages {
    stage('Security Audit') {
      steps {
        sh 'npx @openframe/forge-audit --fail-on critical,high'
      }
    }
  }
}`}
            </pre>
          </div>
        </section>

        {/* CircleCI */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            CircleCI
          </h2>
          
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-xl overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272a] bg-[#18181b]/50">
              <span className="text-[#52525b] text-xs font-mono">.circleci/config.yml</span>
              <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
            </div>
            <pre className="p-4 text-sm font-mono text-[#a1a1aa] overflow-x-auto">
{`version: 2.1

orbs:
  forge: openframe/forge-audit@1.0

workflows:
  security:
    jobs:
      - forge/audit:
          api-key: FORGE_API_KEY
          fail-on: critical,high`}
            </pre>
          </div>
        </section>

        {/* PR Comments */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Pull Request Comments</h2>
          <p className="text-[#a1a1aa] mb-4 leading-relaxed">
            Forge Audit can automatically post findings as comments on your pull requests, making it easy for reviewers to see security issues inline.
          </p>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <p className="text-[#a1a1aa] text-sm mb-3">Enable PR comments by adding:</p>
            <code className="block bg-[#18181b] px-3 py-2 rounded-lg text-sm font-mono text-orange-400">
              comment: true
            </code>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
          <Link href="/audit-docs/methods" className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Input Methods
          </Link>
          <Link href="/audit-docs/vulnerabilities" className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors">
            Vulnerability Types
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

