'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function McpDemoPage() {
  return (
    <div className="relative w-full h-[100dvh] bg-[#0c0c10] overflow-hidden">
      <Link
        href="/projects"
        className="absolute top-[max(1.5rem,env(safe-area-inset-top))] left-4 sm:top-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131318] border border-[#1c1c28] text-[#a1a1aa] hover:text-white hover:border-[#282838] transition-all text-xs font-mono"
      >
        <ArrowLeft size={14} />
        Back to Projects
      </Link>
      <iframe
        src="/demos/mcp-demo.html"
        className="w-full h-full border-0"
        title="Code Context MCP — Interactive Demo"
      />
    </div>
  );
}
