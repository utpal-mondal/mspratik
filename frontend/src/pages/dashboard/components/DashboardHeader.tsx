"use client";


export default function DashboardHeader() {
  return (
    <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Welcome back! 👋
        </h1>

        <p className="mt-0.5 text-xs text-slate-500">
          Quick access to your most important reports and insights.
        </p>
      </div>

    </header>
  );
}