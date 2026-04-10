import Link from 'next/link';
import { Home, FolderOpen, Mail } from 'lucide-react';

const links = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Contact', href: '/contact', icon: Mail },
];

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="bg-[#09090B] text-[#F4F4F5] min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-[96px] font-bold leading-none tracking-tighter bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>
            404
          </h1>
          <h2 className="text-xl font-medium mt-2">Page not found</h2>
          <p className="text-sm text-[#71717A] mt-3 max-w-md mx-auto">
            This route doesn&apos;t resolve. Here&apos;s where you probably meant to go:
          </p>
          <div className="flex gap-6 justify-center mt-8">
            {links.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} className="flex flex-col items-center gap-2 group">
                <div className="w-11 h-11 rounded-xl border border-[#27272A] flex items-center justify-center group-hover:border-[#6366f1] transition-all">
                  <Icon size={18} className="text-[#71717A] group-hover:text-[#6366f1] transition-colors" />
                </div>
                <span className="text-[11px] font-mono text-[#71717A] group-hover:text-white transition-colors">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </body>
    </html>
  );
}
