import React from 'react';

interface CodeBlockProps {
  code: string;
  fileName?: string;
}

export const CodeBlock = ({ code, fileName }: CodeBlockProps) => (
  <div className="font-mono text-xs bg-[#0A0A0A] rounded-xl border border-white/10 overflow-hidden">
    {fileName && (
      <div className="bg-[#111] px-4 py-2 border-b border-white/5 flex items-center gap-2 text-gray-500">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
        <span className="ml-2 text-[10px]">{fileName}</span>
      </div>
    )}
    <div className="p-4 overflow-x-auto text-gray-300">
      <pre dangerouslySetInnerHTML={{ __html: code }} />
    </div>
  </div>
);
