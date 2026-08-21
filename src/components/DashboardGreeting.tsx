"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Calendar, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardGreeting({
  userName,
  isAdmin,
}: {
  userName: string;
  isAdmin: boolean;
}) {
  const [greeting, setGreeting] = useState("");
  const [isSendingWeekly, setIsSendingWeekly] = useState(false);
  const [isSendingDaily, setIsSendingDaily] = useState(false);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 17) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    };

    updateGreeting();

    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSendWeeklyReport = async () => {
    setIsSendingWeekly(true);

    const toastId = toast.loading(
      "Generating 7-day executive report & CSV..."
    );

    try {
      const res = await fetch("/api/reports/weekly", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(
          "📈 Weekly Executive Report sent to your mailbox!",
          { id: toastId }
        );
      } else {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to dispatch report"
        );
      }
    } catch (err: any) {
      toast.error(
        err.message || "Failed to dispatch weekly report",
        { id: toastId }
      );
    } finally {
      setIsSendingWeekly(false);
    }
  };

  const handleSendDailyReport = async () => {
    setIsSendingDaily(true);

    const toastId = toast.loading(
      "Generating Daily EOD report & CSV..."
    );

    try {
      const res = await fetch("/api/cron/daily-report", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(
          "📅 Daily EOD Report sent to your mailbox!",
          { id: toastId }
        );
      } else {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to dispatch report"
        );
      }
    } catch (err: any) {
      toast.error(
        err.message || "Failed to dispatch daily report",
        { id: toastId }
      );
    } finally {
      setIsSendingDaily(false);
    }
  };

  return (
    <header className="relative mb-5 overflow-hidden rounded-2xl border border-white/60 bg-white/50 px-5 py-5 shadow-sm backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/60 md:px-6">

      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Greeting */}
        <div className="min-w-0">

          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              {isAdmin ? "Admin Dashboard" : "Agent Workspace"}
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
            {greeting
              ? `${greeting}, ${userName}`
              : `Welcome back, ${userName}`}
            <span className="ml-1">👋</span>
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {isAdmin
              ? "Here is what's happening with your support system today."
              : "Here is the latest update on your assigned tickets."}
          </p>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="relative flex flex-wrap items-center gap-2">

            {/* Daily Report */}
            <button
              onClick={handleSendDailyReport}
              disabled={isSendingDaily}
              className="group flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-emerald-500/30 dark:hover:bg-slate-800"
              title="Dispatch Daily 7:00 PM EOD spreadsheet report to your alert mailbox"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </span>

              <span>
                {isSendingDaily
                  ? "Sending..."
                  : "Send Daily Report"}
              </span>
            </button>

            {/* Weekly Report */}
            <button
              onClick={handleSendWeeklyReport}
              disabled={isSendingWeekly}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2.5 text-xs font-black text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              title="Dispatch 7-day executive briefing & spreadsheet report to your alert mailbox"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15">
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </span>

              <span>
                {isSendingWeekly
                  ? "Sending..."
                  : "Send Weekly Report"}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
