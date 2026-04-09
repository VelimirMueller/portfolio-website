'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function McpDemoPage() {
  return (
    <div className="relative w-full h-[100dvh] bg-[#0c0c10] overflow-hidden">
      <Link
        href="/projects"
        className="absolute bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all text-sm font-mono font-bold shadow-lg shadow-black/20"
      >
        <ArrowLeft size={16} />
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
