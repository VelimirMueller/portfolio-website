import React from 'react';
import { CRM_NOTIFICATIONS } from '../_lib/data';
import { unreadCount } from '../_lib/format';

export const CRMNotificationDropdown = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 glass-demo glass-demo-pop border rounded-2xl shadow-2xl shadow-black/50 z-50 animate-fade-in-up overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
          <span className="text-xs font-bold text-white">Notifications</span>
          <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">{unreadCount(CRM_NOTIFICATIONS)} new</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {CRM_NOTIFICATIONS.map((n, i) => (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 border-b border-[#222]/50 hover:bg-[#1a1a1a] transition-colors ${!n.read ? 'bg-blue-500/[0.02]' : ''}`}>
              <div className={`mt-0.5 ${n.color}`}>
                <n.icon size={14} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[11px] leading-relaxed ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.text}</div>
                <span className="text-[9px] text-gray-600 font-mono">{n.time}</span>
              </div>
              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-[#222]">
          <button className="text-[10px] text-blue-400 font-bold hover:text-blue-300 w-full text-center">Mark all as read</button>
        </div>
      </div>
    </>
  );
};
