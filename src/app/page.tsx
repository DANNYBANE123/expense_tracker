import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Repeat,
  Wallet,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-6 sm:px-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 shadow-md shadow-blue-500/25 text-white font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">ApexFinance</span>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-semibold">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-xs font-semibold shadow-sm shadow-blue-500/20">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 mb-6 shadow-sm">
          <Zap className="h-3.5 w-3.5" />
          <span>B.Tech Computer Science Major Project Edition</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 max-w-4xl leading-tight sm:leading-none">
          Master Your Wealth With <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Smart Financial Intelligence
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Production-grade personal expense tracker built with Next.js App Router,
          MongoDB & Mongoose, Auth.js, and Recharts. Features integer-paise financial
          precision, automated recurring transactions, and rule-based spending insights.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" className="h-11 px-6 text-sm font-semibold shadow-lg shadow-blue-500/25">
              Launch Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="h-11 px-6 text-sm font-semibold">
              Sign In With Demo Account
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left w-full">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-3">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Integer-Paise Precision
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Zero IEEE-754 floating point inaccuracies. Financial records stored safely as integer paise.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-3">
              <PieChart className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Interactive Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live Recharts visuals, category donut breakdowns, monthly trends, and CSV audit exports.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-3">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Budget Guardrails
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monthly and category budgets with automatic 80% warning triggers and overrun alerts.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 mb-3">
              <Repeat className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Recurring Schedules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automated cadence for rent, subscriptions, and salaries with strict deduplication prevention.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        ApexFinance • B.Tech Computer Science Major Project • MongoDB + Next.js App Router + TypeScript
      </footer>
    </div>
  );
}
