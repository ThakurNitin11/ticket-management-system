"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type DashboardChartsProps = {
  statusStats: { status: string; _count: { id: number } }[];
  trendData: { name: string; tickets: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "#8B5CF6",
  OPEN: "#F59E0B",
  PENDING_CUSTOMER: "#F97316",
  RESOLVED: "#10B981",
  CLOSED: "#64748B",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  OPEN: "Open",
  PENDING_CUSTOMER: "Waiting",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default function DashboardCharts({
  statusStats,
  trendData,
}: DashboardChartsProps) {
  const statusData = statusStats.map((stat) => ({
    name: stat.status,
    label: STATUS_LABELS[stat.status] || stat.status,
    value: stat._count.id,
  }));

  const totalStatusTickets = statusData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

      {/* Ticket Volume */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/70">

        {/* Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />

              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Ticket Volume
              </h3>
            </div>

            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Tickets created over the last 7 days
            </p>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
            7 DAYS
          </div>
        </div>

        <div className="relative h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="ticketVolumeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#3B82F6"
                    stopOpacity={0.28}
                  />

                  <stop
                    offset="100%"
                    stopColor="#3B82F6"
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#E2E8F0"
                opacity={0.65}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748B",
                  fontSize: 10,
                  fontWeight: 600,
                }}
                dy={8}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94A3B8",
                  fontSize: 10,
                }}
              />

              <Tooltip
                cursor={{
                  stroke: "#3B82F6",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(226,232,240,0.8)",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
                  fontSize: "11px",
                  padding: "10px 12px",
                }}
                labelStyle={{
                  color: "#475569",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
                itemStyle={{
                  color: "#2563EB",
                  fontWeight: 700,
                }}
              />

              <Area
                type="monotone"
                dataKey="tickets"
                stroke="#2563EB"
                strokeWidth={3}
                fill="url(#ticketVolumeGradient)"
                dot={{
                  r: 3,
                  fill: "#2563EB",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: "#2563EB",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Tickets by Status */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/70">

        {/* Glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative mb-2 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]" />

              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Tickets by Status
              </h3>
            </div>

            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Current ticket pipeline
            </p>
          </div>

          <div className="rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1.5 text-[10px] font-bold text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
            LIVE
          </div>
        </div>

        {statusData.length > 0 ? (
          <div className="relative h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="46%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={5}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || "#94A3B8"}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(226,232,240,0.8)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
                    fontSize: "11px",
                    padding: "10px 12px",
                  }}
                  itemStyle={{
                    color: "#0F172A",
                    fontWeight: 700,
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={34}
                  iconType="circle"
                  formatter={(value) =>
                    STATUS_LABELS[value] || value
                  }
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#64748B",
                  }}
                />

                {/* Center text */}
                <text
                  x="50%"
                  y="43%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-900 dark:fill-white"
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                  }}
                >
                  {totalStatusTickets}
                </text>

                <text
                  x="50%"
                  y="54%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-400"
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                  }}
                >
                  TOTAL
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-52 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                No status data
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Ticket status information will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
