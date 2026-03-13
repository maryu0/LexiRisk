import React from "react";
import {
  LayoutDashboard,
  History,
  Library,
  Settings,
  ShieldAlert,
} from "lucide-react";

type ActiveView = "dashboard" | "history" | "library" | "settings";

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const navItems = [
    {
      name: "Parser Dashboard",
      icon: LayoutDashboard,
      view: "dashboard" as ActiveView,
    },
    {
      name: "Document History",
      icon: History,
      view: "history" as ActiveView,
    },
    {
      name: "Entity Library",
      icon: Library,
      view: "library" as ActiveView,
    },
    {
      name: "Settings",
      icon: Settings,
      view: "settings" as ActiveView,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-400 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-900 z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-500" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Lexi</span>
            <span className="text-indigo-500">Risk</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive ? "bg-slate-900 text-white relative" : "hover:bg-slate-900/50 hover:text-slate-200"}`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full" />
              )}
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}`}
              />

              <span className="font-medium text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-900">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-sm">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              Jane Doe
            </p>
            <p className="text-xs text-slate-500 truncate">Senior Counsel</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
