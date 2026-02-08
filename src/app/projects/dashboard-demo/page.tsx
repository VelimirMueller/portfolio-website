'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  CheckCircle2,
  MoreHorizontal,
  FileText,
  Mail,
  PieChart,
  Filter,
  Plus,
  ArrowUpRight,
  Globe,
  Smartphone,
  Check,
  Zap,
  Clock,
  Edit3
} from 'lucide-react';

// --- Shared UI Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#111111] rounded-[2rem] p-6 border border-[#222] hover:border-[#333] transition-colors ${className}`}>
    {children}
  </div>
);

const IconButton = ({ icon: Icon, active = false, onClick, label }: { icon: React.ElementType, active?: boolean, onClick?: () => void, label?: string }) => (
  <button onClick={onClick} aria-label={label} className={`p-3 rounded-xl transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[#222] text-gray-500'}`}>
    <Icon size={20} className={active ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'} aria-hidden="true" />
  </button>
);

const NavItem = ({ icon: Icon, label, id, activeId, onClick }: { icon: React.ElementType, label: string, id: string, activeId: string, onClick: (id: string) => void }) => (
  <button
    onClick={() => onClick(id)}
    aria-current={activeId === id ? 'page' : undefined}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeId === id ? 'bg-blue-600/10 text-blue-400' : 'text-gray-500 hover:bg-[#1a1a1a] hover:text-white'}`}
  >
    <Icon size={20} aria-hidden="true" />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const Badge = ({ children, color = "blue" }: { children: React.ReactNode, color?: "blue" | "green" | "purple" | "orange" | "red" }) => {
  const styles = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border uppercase tracking-wide ${styles[color]}`}>
      {children}
    </span>
  );
};

// --- Custom Charts ---

const BarChart = () => (
  <div className="flex items-end justify-between h-32 gap-2 mt-4" role="img" aria-label="Bar chart showing leads per day of week">
    {[40, 65, 45, 80, 55, 70, 30].map((h, i) => (
      <div key={i} className="flex flex-col items-center gap-2 group w-full">
        <div className="relative w-full rounded-t-lg bg-[#222] group-hover:bg-[#333] h-full overflow-hidden transition-all">
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-lg transition-all duration-1000 group-hover:bg-blue-500"
            style={{ height: `${h}%` }}
          ></div>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][i]}
        </span>
      </div>
    ))}
  </div>
);

const WaveLineChart = ({ color = "#818cf8" }: { color?: string }) => (
  <div className="relative h-32 w-full mt-4 overflow-hidden">
    <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none" role="img" aria-label="Line chart showing traffic trend">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,80 C50,80 50,30 100,30 C150,30 150,60 200,60 C250,60 250,10 300,10 V100 H0 Z"
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      <path
        d="M0,80 C50,80 50,30 100,30 C150,30 150,60 200,60 C250,60 250,10 300,10"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const DonutChart = () => (
  <div className="relative w-32 h-32 mx-auto mt-4">
    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" role="img" aria-label="Donut chart showing 75% of monthly goal reached">
      <path
        className="text-[#222]"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]"
        strokeDasharray="75, 100"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-2xl font-bold text-white">75%</span>
      <span className="text-[10px] text-gray-500 uppercase">Goal</span>
    </div>
  </div>
);

// --- Sub-Views ---

const DashboardView = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Lead Velocity</h3>
                  <p className="text-xs text-gray-500">Neue Leads pro Tag</p>
                </div>
                <select aria-label="Time period for lead velocity" className="bg-[#222] border-none text-[10px] text-white rounded px-2 py-1 outline-none">
                  <option>Woche</option>
                </select>
            </div>
            <div className="flex-1 min-h-[140px]">
                <BarChart />
            </div>
          </Card>

          <Card className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Traffic Trend</h3>
                  <p className="text-xs text-gray-500">Unique Visitors</p>
                </div>
                <div className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-mono flex items-center gap-1">
                  <TrendingUp size={12} /> +12.5%
                </div>
            </div>
            <div className="flex-1 min-h-[140px] flex items-end">
                <WaveLineChart />
            </div>
          </Card>

          <Card className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Monatsziel</h3>
                  <p className="text-xs text-gray-500">Umsatz vs Ziel</p>
                </div>
                <select aria-label="Time period for monthly goal" className="bg-[#222] border-none text-[10px] text-white rounded px-2 py-1 outline-none">
                  <option>Heute</option>
                </select>
            </div>
            <div className="flex items-center gap-8 mt-4">
                <DonutChart />
                <div className="space-y-4">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-gray-400">Erreicht</span>
                      </div>
                      <div className="text-sm font-bold font-mono">28.9k &euro;</div>
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                        <span className="text-xs text-gray-400">Offen</span>
                      </div>
                      <div className="text-sm font-bold font-mono text-gray-500">1.4k &euro;</div>
                  </div>
                </div>
            </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Content Pipeline</h3>
                <button className="text-xs text-blue-400 font-bold hover:text-blue-300">Alle ansehen</button>
            </div>
            <div className="space-y-3">
                {[
                  { title: "React Performance Guide", type: "Blog", status: "Draft", date: "24. Jul, 14:00", value: "High Priority", icon: FileText, color: "bg-blue-500" },
                  { title: "Case Study: FinTech App", type: "LinkedIn", status: "Scheduled", date: "26. Jul, 09:00", value: "Sales Asset", icon: Users, color: "bg-purple-500" },
                  { title: "Newsletter: Q3 Update", type: "Email", status: "Review", date: "29. Jul, 10:00", value: "Retention", icon: Mail, color: "bg-orange-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0E14] border border-[#1a1a1a] hover:border-[#333] transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${item.color}/20 text-white flex items-center justify-center`}>
                          <item.icon size={18} className={item.color.replace('bg-', 'text-')} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{item.title}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-2">
                              <span>{item.type}</span>
                              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                              <span>{item.date}</span>
                          </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-bold text-white">{item.value}</div>
                          <div className="text-[10px] text-gray-500">{item.status}</div>
                        </div>
                        <button className="p-2 hover:bg-[#222] rounded-lg text-gray-500" aria-label="More options"><MoreHorizontal size={16} aria-hidden="true"/></button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">To Do&apos;s</h3>
                <div className="w-6 h-6 rounded bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</div>
            </div>
            <div className="space-y-4">
                {[
                  { text: "Intro Call mit TechCorp", done: false },
                  { text: "Figma Design Review", done: false },
                  { text: "Rechnung #4023 senden", done: true },
                  { text: "Weekly Analytics Report", done: false },
                  { text: "Domain Transfer", done: true },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.done ? 'bg-blue-600 border-blue-600' : 'border-[#333] group-hover:border-blue-500'}`}>
                        {task.done && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <span className={`text-sm ${task.done ? 'text-gray-600 line-through' : 'text-gray-300 group-hover:text-white'}`}>{task.text}</span>
                  </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 border border-[#333] hover:bg-[#222] rounded-xl text-xs text-gray-400 hover:text-white transition-colors">
                + Neuen Task anlegen
            </button>
          </Card>
      </div>
  </div>
);

const LeadsView = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Leads & Deals</h2>
        <p className="text-gray-500 text-sm">Aktive Pipeline Opportunities</p>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white text-xs font-bold rounded-xl border border-[#333] hover:bg-[#222]">
           <Filter size={14} /> Filter
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20">
           <Plus size={14} /> Neuer Lead
        </button>
      </div>
    </div>

    <Card className="overflow-hidden p-0">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#222] text-xs text-gray-500 uppercase font-mono bg-[#161616]">
              <th scope="col" className="px-6 py-4 font-medium">Lead Name</th>
              <th scope="col" className="px-6 py-4 font-medium">Company</th>
              <th scope="col" className="px-6 py-4 font-medium">Status</th>
              <th scope="col" className="px-6 py-4 font-medium">Value</th>
              <th scope="col" className="px-6 py-4 font-medium">Last Contact</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {[
              { name: "Sarah Connor", email: "s.connor@skynet.com", company: "Cyberdyne Systems", status: "Negotiation", color: "purple" as const, value: "45.000 \u20AC", last: "2h ago" },
              { name: "Tony Stark", email: "tony@stark.ind", company: "Stark Industries", status: "Qualified", color: "green" as const, value: "120.000 \u20AC", last: "1d ago" },
              { name: "Bruce Wayne", email: "bruce@wayne.ent", company: "Wayne Enterprises", status: "New", color: "blue" as const, value: "85.000 \u20AC", last: "4h ago" },
              { name: "Peter Parker", email: "p.parker@dailybugle.com", company: "Daily Bugle", status: "Lost", color: "red" as const, value: "2.500 \u20AC", last: "1w ago" },
              { name: "Diana Prince", email: "d.prince@themsc.gov", company: "Museum of Antiquities", status: "Proposal", color: "orange" as const, value: "12.000 \u20AC", last: "3d ago" },
            ].map((lead, i) => (
              <tr key={i} className="group hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center font-bold text-xs">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{lead.name}</div>
                      <div className="text-[10px] text-gray-500">{lead.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 font-medium">{lead.company}</td>
                <td className="px-6 py-4">
                  <Badge color={lead.color}>{lead.status}</Badge>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-white">{lead.value}</td>
                <td className="px-6 py-4 text-xs text-gray-500">{lead.last}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-[#333] rounded-lg text-gray-500 hover:text-white transition-colors" aria-label="More options">
                    <MoreHorizontal size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-[#222] bg-[#161616] flex justify-between items-center">
        <span className="text-xs text-gray-500">Showing 5 of 24 leads</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border border-[#333] text-xs text-gray-400 hover:text-white hover:bg-[#222]">Previous</button>
          <button className="px-3 py-1 rounded-lg border border-[#333] text-xs text-gray-400 hover:text-white hover:bg-[#222]">Next</button>
        </div>
      </div>
    </Card>
  </div>
);

const ContentView = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Content Planner</h2>
        <p className="text-gray-500 text-sm">Editorial Calendar & Assets</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20">
          <Plus size={14} /> Create Content
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-500"></span> Ideas
            </span>
            <span className="text-xs text-gray-600 bg-[#1a1a1a] px-2 py-0.5 rounded">3</span>
          </div>
          <Card className="p-4 cursor-grab active:cursor-grabbing hover:border-gray-600">
             <div className="flex justify-between mb-3">
               <span className="text-[10px] text-blue-400 border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 rounded">Blog</span>
               <MoreHorizontal size={14} className="text-gray-600" aria-hidden="true"/>
             </div>
             <h4 className="font-bold text-white text-sm mb-2">Comparison: Vue vs React in 2025</h4>
             <p className="text-xs text-gray-500 mb-4">Technical deep dive into the new signals architecture.</p>
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[8px] font-bold text-white">V</div>
             </div>
          </Card>
          <Card className="p-4 cursor-grab active:cursor-grabbing hover:border-gray-600">
             <div className="flex justify-between mb-3">
               <span className="text-[10px] text-purple-400 border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 rounded">LinkedIn</span>
               <MoreHorizontal size={14} className="text-gray-600" aria-hidden="true"/>
             </div>
             <h4 className="font-bold text-white text-sm mb-2">My workspace setup 2025</h4>
             <p className="text-xs text-gray-500 mb-4">Photo carousel with gear breakdown.</p>
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[8px] font-bold text-white">V</div>
             </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Drafting
            </span>
            <span className="text-xs text-gray-600 bg-[#1a1a1a] px-2 py-0.5 rounded">2</span>
          </div>
          <Card className="p-4 border-blue-500/30">
             <div className="flex justify-between mb-3">
               <span className="text-[10px] text-orange-400 border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 rounded">Newsletter</span>
               <MoreHorizontal size={14} className="text-gray-600" aria-hidden="true"/>
             </div>
             <h4 className="font-bold text-white text-sm mb-2">Q3 Agency Update</h4>
             <div className="w-full bg-[#222] h-1 rounded-full mb-4 overflow-hidden">
               <div className="bg-blue-500 h-full w-2/3"></div>
             </div>
             <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Due tomorrow</span>
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500 border border-[#111]"></div>
                  <div className="w-5 h-5 rounded-full bg-green-500 border border-[#111]"></div>
                </div>
             </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Ready
            </span>
            <span className="text-xs text-gray-600 bg-[#1a1a1a] px-2 py-0.5 rounded">1</span>
          </div>
          <Card className="p-4 opacity-75 hover:opacity-100 transition-opacity">
             <div className="flex justify-between mb-3">
               <span className="text-[10px] text-pink-400 border border-pink-500/20 bg-pink-500/10 px-2 py-0.5 rounded">Instagram</span>
               <CheckCircle2 size={14} className="text-green-500"/>
             </div>
             <h4 className="font-bold text-white text-sm mb-2">Client Success Story: Galvany</h4>
             <div className="aspect-video bg-[#222] rounded mb-3 flex items-center justify-center text-gray-600 text-xs">
                Image Preview
             </div>
             <p className="text-xs text-gray-500">Scheduled for Friday, 18:00</p>
          </Card>
        </div>
    </div>
  </div>
);

const AnalyticsView = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analytics Overview</h2>
        <p className="text-gray-500 text-sm">Traffic, Conversions & Engagement</p>
      </div>
      <div className="flex bg-[#111] p-1 rounded-xl border border-[#222]">
        <button className="px-4 py-1.5 text-xs font-bold bg-[#222] text-white rounded-lg shadow">30 Days</button>
        <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors">90 Days</button>
        <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors">Year</button>
      </div>
    </div>

    <Card className="h-80 flex flex-col">
       <div className="flex justify-between items-start mb-6">
         <div>
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
             Total Sessions <span className="text-xs font-normal text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">+24.5%</span>
           </h3>
           <p className="text-xs text-gray-500">Vs. previous period</p>
         </div>
         <div className="text-right">
           <div className="text-2xl font-mono font-bold text-white">124.592</div>
         </div>
       </div>
       <div className="flex-1 w-full relative">
          <WaveLineChart color="#3b82f6" />
       </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <Card>
          <div className="flex items-center gap-3 mb-4">
             <Globe size={18} className="text-blue-400"/>
             <h4 className="font-bold text-white text-sm">Traffic Sources</h4>
          </div>
          <div className="space-y-4">
             {[
               { name: "Organic Search", val: "45%", color: "bg-blue-500" },
               { name: "Direct", val: "25%", color: "bg-purple-500" },
               { name: "Social Media", val: "20%", color: "bg-pink-500" },
               { name: "Referral", val: "10%", color: "bg-orange-500" },
             ].map((item, i) => (
               <div key={i}>
                 <div className="flex justify-between text-xs text-gray-400 mb-1">
                   <span>{item.name}</span>
                   <span>{item.val}</span>
                 </div>
                 <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                   <div className={`h-full ${item.color}`} style={{ width: item.val }}></div>
                 </div>
               </div>
             ))}
          </div>
       </Card>

       <Card>
          <div className="flex items-center gap-3 mb-4">
             <Smartphone size={18} className="text-purple-400"/>
             <h4 className="font-bold text-white text-sm">Devices</h4>
          </div>
          <div className="flex items-center justify-center h-48">
             <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" role="img" aria-label="Device distribution: 60% Mobile, 25% Desktop, 15% Tablet">
                  <path className="text-[#222]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="6"/>
                  <path className="text-blue-500" strokeDasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="6"/>
                  <path className="text-purple-500" strokeDasharray="25, 100" strokeDashoffset="-60" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="6"/>
                  <path className="text-pink-500" strokeDasharray="15, 100" strokeDashoffset="-85" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="6"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-xl font-bold text-white">Mobile</span>
                   <span className="text-[10px] text-gray-500">60%</span>
                </div>
             </div>
          </div>
          <div className="flex justify-center gap-4 text-[10px] text-gray-500 uppercase tracking-wider">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Mobile</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Desktop</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Tablet</span>
          </div>
       </Card>

       <div className="grid grid-rows-2 gap-6">
          <Card className="flex items-center justify-between">
             <div>
                <div className="text-xs text-gray-500 uppercase">Avg. Session</div>
                <div className="text-2xl font-mono font-bold text-white">04:32</div>
             </div>
             <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Clock size={20} />
             </div>
          </Card>
          <Card className="flex items-center justify-between">
             <div>
                <div className="text-xs text-gray-500 uppercase">Bounce Rate</div>
                <div className="text-2xl font-mono font-bold text-white">24.8%</div>
             </div>
             <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <Zap size={20} />
             </div>
          </Card>
       </div>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-500 text-sm">Manage your account and preferences</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       <div className="space-y-1">
          {['General', 'Notifications', 'Billing', 'Team', 'Integrations'].map((item, i) => (
             <div key={i} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${i === 0 ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'}`}>
                {item}
             </div>
          ))}
       </div>

       <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white">Profile Info</h3>
                <button className="text-blue-400 text-xs font-bold hover:text-blue-300">Edit</button>
             </div>
             <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border-4 border-[#111] relative">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Velimir" alt="Avatar" className="w-full h-full rounded-full" />
                   <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white border-2 border-[#111]" aria-label="Change profile picture">
                      <Edit3 size={12} aria-hidden="true" />
                   </button>
                </div>
                <div className="space-y-3 flex-1">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label htmlFor="settings-firstname" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                         <input id="settings-firstname" type="text" defaultValue="Velimir" className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-sm text-gray-300 focus:border-blue-500 focus:outline-none" readOnly />
                      </div>
                      <div>
                         <label htmlFor="settings-lastname" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                         <input id="settings-lastname" type="text" defaultValue="Müller" className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-sm text-gray-300 focus:border-blue-500 focus:outline-none" readOnly />
                      </div>
                   </div>
                   <div>
                       <label htmlFor="settings-role" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Role</label>
                       <input id="settings-role" type="text" defaultValue="Senior Administrator" className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-sm text-gray-300 focus:border-blue-500 focus:outline-none" readOnly />
                   </div>
                </div>
             </div>
          </Card>

          <Card className="p-6">
             <h3 className="text-base font-bold text-white mb-6">Preferences</h3>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                      <div className="text-sm font-bold text-white" id="toggle-darkmode">Dark Mode</div>
                      <div className="text-xs text-gray-500">System default is active</div>
                   </div>
                   <button role="switch" aria-checked="true" aria-labelledby="toggle-darkmode" className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></span>
                   </button>
                </div>
                <div className="flex items-center justify-between">
                   <div>
                      <div className="text-sm font-bold text-white" id="toggle-email">Email Notifications</div>
                      <div className="text-xs text-gray-500">Receive weekly digests</div>
                   </div>
                   <button role="switch" aria-checked="false" aria-labelledby="toggle-email" className="w-12 h-6 bg-[#222] rounded-full relative cursor-pointer border border-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      <span className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full shadow-sm"></span>
                   </button>
                </div>
                <div className="flex items-center justify-between">
                   <div>
                      <div className="text-sm font-bold text-white" id="toggle-public">Public Profile</div>
                      <div className="text-xs text-gray-500">Visible to search engines</div>
                   </div>
                   <button role="switch" aria-checked="true" aria-labelledby="toggle-public" className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></span>
                   </button>
                </div>
             </div>
          </Card>
       </div>
    </div>
  </div>
);

// --- Main Page Component ---

export default function DashboardDemoPage() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch(activeView) {
      case 'dashboard': return <DashboardView />;
      case 'leads': return <LeadsView />;
      case 'content': return <ContentView />;
      case 'analytics': return <AnalyticsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  const getHeaderTitle = () => {
    switch(activeView) {
      case 'dashboard': return 'Dashboard';
      case 'leads': return 'Leads Management';
      case 'content': return 'Content Planning';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#E2E2E2] font-sans overflow-hidden">

      {/* --- Sidebar --- */}
      <aside aria-label="Dashboard sidebar navigation" className="w-20 md:w-64 flex-shrink-0 border-r border-[#222] hidden md:flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-4 mb-12 mt-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
              C
            </div>
            <span className="font-bold text-xl tracking-tight hidden md:block">CRM<span className="text-gray-600">Pro</span></span>
          </div>

          <div className="space-y-2">
            <NavItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeId={activeView} onClick={setActiveView} />
            <NavItem icon={Users} label="Leads" id="leads" activeId={activeView} onClick={setActiveView} />
            <NavItem icon={FileText} label="Content" id="content" activeId={activeView} onClick={setActiveView} />
            <NavItem icon={BarChart3} label="Analytics" id="analytics" activeId={activeView} onClick={setActiveView} />
            <NavItem icon={Settings} label="Settings" id="settings" activeId={activeView} onClick={setActiveView} />
          </div>
        </div>

        <div>
          <div className="bg-[#111] rounded-2xl p-4 mb-4 border border-[#222]">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><Bell size={14}/></div>
               <div>
                 <div className="text-xs font-bold">Meeting</div>
                 <div className="text-[10px] text-gray-500">In 15 min</div>
               </div>
            </div>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
              Join Zoom
            </button>
          </div>

          <Link href="/projects" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-all">
            <LogOut size={20} />
            <span className="font-medium text-sm">Exit Demo</span>
          </Link>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        <header className="h-20 border-b border-[#222] flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur z-20 shrink-0">
           <div className="flex items-center gap-4 md:w-96">
              <button className="md:hidden p-2 text-gray-400" aria-label="Open sidebar menu"><MoreHorizontal aria-hidden="true" /></button>

              <div className="relative w-full hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} aria-hidden="true" />
                  <input
                    type="search"
                    aria-label={`Search in ${getHeaderTitle()}`}
                    placeholder={`Search in ${getHeaderTitle()}...`}
                    className="w-full bg-[#111] border border-[#222] rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="md:hidden">
                 <Link href="/projects" className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                   <LogOut size={14}/> Exit
                 </Link>
              </div>
              <IconButton icon={Bell} label="Notifications" />
              <div className="flex items-center gap-3 pl-6 border-l border-[#222]">
                 <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 border-2 border-[#222] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Velimir" alt="User" className="w-full h-full rounded-full" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111] rounded-full"></div>
                 </div>
                 <div className="hidden md:block">
                    <div className="text-sm font-bold">Velimir M.</div>
                    <div className="text-[10px] text-gray-500">Admin</div>
                 </div>
                 <ChevronDown size={14} className="text-gray-600" />
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
           <div className="max-w-7xl mx-auto h-full">
              {renderView()}
           </div>
        </div>
      </main>
    </div>
  );
}
