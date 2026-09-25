"use client";

import React from "react";
import { Check } from "lucide-react";

export interface TabItem {
  id: number;
  title: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: number;
  onChange: (tabId: number) => void;
  completedTabs?: number[];
  disabledTabs?: number[];
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  completedTabs = [],
  disabledTabs = [],
}) => {
  return (
    <div className="border-b border-slate-200">
      <nav className="flex items-center overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isCompleted = completedTabs.includes(tab.id);
          const isDisabled = disabledTabs.includes(tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(tab.id)}
              className={`group relative flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium transition-all duration-200

                ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }

                ${isDisabled ? "cursor-not-allowed opacity-40" : ""}
              `}
            >
              {isCompleted ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
                  <Check size={12} className="text-white" />
                </span>
              ) : (
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs

                  ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 text-slate-500"
                  }
                `}
                >
                  {tab.id}
                </span>
              )}

              <span>{tab.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
