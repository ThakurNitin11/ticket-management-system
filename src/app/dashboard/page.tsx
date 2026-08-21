import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardGreeting from '@/components/DashboardGreeting';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyJwtToken(token);

  if (!payload) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { name: true }
  });

  const isAdmin = payload.role === 'ADMIN';

  const whereClause = isAdmin ? {} : { assignedAgentId: payload.userId };

  const [totalTickets, openTickets, progressTickets, resolvedTickets, unassignedTickets] = await Promise.all([
    prisma.ticket.count({ where: whereClause }),
    prisma.ticket.count({ where: { ...whereClause, status: { in: ['NEW', 'OPEN'] } } }),
    prisma.ticket.count({ where: { ...whereClause, status: 'PENDING_CUSTOMER' } }),
    prisma.ticket.count({ where: { ...whereClause, status: { in: ['RESOLVED', 'CLOSED'] } } }),
    prisma.ticket.count({ where: { assignedAgentId: null } })
  ]);

  const recentTickets = await prisma.ticket.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  let unassignedRecentTickets: any[] = [];
  if (!isAdmin) {
    unassignedRecentTickets = await prisma.ticket.findMany({
      where: { assignedAgentId: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  let statusStats: any = [];
  let agentStats: any = [];
  let trendData: any = [];
  if (isAdmin) {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentTicketsForChart = await prisma.ticket.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true }
    });

    const countsByDate: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      countsByDate[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
    }

    recentTicketsForChart.forEach(t => {
      const key = t.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
      if (countsByDate[key] !== undefined) countsByDate[key]++;
    });

    trendData = Object.keys(countsByDate).map(key => ({
      name: key,
      tickets: countsByDate[key]
    }));

    statusStats = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' }
      }
    });

    const agents = await prisma.user.findMany({
      where: { role: { in: ['AGENT', 'ADMIN'] } },
      include: {
        assignedTickets: {
          select: { status: true }
        }
      }
    });

    agentStats = agents.map(agent => {
      const total = agent.assignedTickets.length;
      const resolved = agent.assignedTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      const open = agent.assignedTickets.filter(t => t.status === 'OPEN' || t.status === 'NEW' || t.status === 'PENDING_CUSTOMER').length;
      return {
        id: agent.id,
        name: agent.name || 'Unknown',
        email: agent.email,
        role: agent.role,
        total,
        resolved,
        open
      };
    }).sort((a, b) => b.total - a.total);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'OPEN': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'PENDING_CUSTOMER': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'CLOSED': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800';
    }
  };

  const userName = currentUser?.name || (isAdmin ? 'Admin' : 'Agent');

  return (
    <div className="min-h-full p-4 md:p-6">
      <div className="max-w-7xl mx-auto w-full">
        <DashboardGreeting userName={userName} isAdmin={isAdmin} />

        {/* Metric Cards */}
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5 shrink-0">

          {/* Total Tickets */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 8h10M7 12h6M7 16h4" />
                  </svg>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ALL
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Tickets
              </p>

              <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {totalTickets}
              </p>

              <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                Across your workspace
              </p>
            </div>
          </div>

          {/* Open */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v4l3 2" />
                  </svg>
                </div>

                <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Open
              </p>

              <p className="mt-1 text-2xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400">
                {openTickets}
              </p>

              <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                New & open tickets
              </p>
            </div>
          </div>

          {/* In Progress */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-500/10 blur-2xl transition-all group-hover:bg-amber-500/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3a9 9 0 1 0 9 9" />
                    <path d="M12 3v6l4 2" />
                  </svg>
                </div>

                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                In Progress
              </p>

              <p className="mt-1 text-2xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                {progressTickets}
              </p>

              <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                Waiting on customer
              </p>
            </div>
          </div>

          {/* Resolved */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>

                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Resolved
              </p>

              <p className="mt-1 text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                {resolvedTickets}
              </p>

              <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                Successfully completed
              </p>
            </div>
          </div>

          {/* Unassigned */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-rose-500/10 blur-2xl transition-all group-hover:bg-rose-500/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="8" r="3" />
                    <path d="M5 20a7 7 0 0 1 14 0" />
                    <path d="M19 8v6M16 11h6" />
                  </svg>
                </div>

                {unassignedTickets > 0 && (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                )}
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Unassigned
              </p>

              <p className="mt-1 text-2xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                {unassignedTickets}
              </p>

              <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                Need agent assignment
              </p>
            </div>
          </div>

        </div>


        {/* Admin Advanced Visualizations */}
        {isAdmin && (
          <div className="shrink-0">
            <DashboardCharts statusStats={statusStats} trendData={trendData} />
          </div>
        )}

        {/* Tables Section */}
        {/* Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">

          {/* Recent Tickets */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70">

            {/* subtle glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="relative flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                  <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    {isAdmin ? 'Recent System Tickets' : 'Your Active Tickets'}
                  </h2>
                </div>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {isAdmin
                    ? 'Latest activity across the support system'
                    : 'Tickets currently assigned to you'}
                </p>
              </div>

              <Link
                href="/dashboard/tickets"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-blue-500/10"
              >
                View all →
              </Link>
            </div>

            <div className="overflow-x-auto">
              {recentTickets.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M4 5h16v14H4z" />
                      <path d="M8 9h8M8 13h5" />
                    </svg>
                  </div>

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No tickets found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    You are all caught up!
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[650px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200/70 bg-slate-50/70 dark:border-slate-800/70 dark:bg-slate-800/30">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Ticket
                      </th>

                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Status
                      </th>

                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Priority
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {recentTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="group/row transition-colors hover:bg-blue-50/40 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/dashboard/tickets/${ticket.id}`}
                            className="block"
                          >
                            <p className="max-w-[230px] truncate text-xs font-bold text-slate-800 transition-colors group-hover/row:text-blue-600 dark:text-slate-100 dark:group-hover/row:text-blue-400">
                              {ticket.subject}
                            </p>

                            <p className="mt-0.5 max-w-[230px] truncate text-[10px] text-slate-400 dark:text-slate-500">
                              {ticket.studentEmail}
                            </p>
                          </Link>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-wide ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-[9px] font-extrabold tracking-wide ${ticket.priority === 'URGENT'
                                ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
                                : ticket.priority === 'HIGH'
                                  ? 'border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400'
                                  : ticket.priority === 'NORMAL'
                                    ? 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400'
                                    : 'border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                          {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>


          {/* Right Side Card */}
          {!isAdmin && (
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70">

              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-rose-500/5 blur-3xl" />

              <div className="relative flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />

                    <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                      Unassigned Queue
                    </h2>

                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-extrabold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                      {unassignedTickets} NEW
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Tickets waiting for an agent
                  </p>
                </div>

                <Link
                  href="/dashboard/tickets?tab=unassigned"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-blue-500/10"
                >
                  View all →
                </Link>
              </div>

              <div className="overflow-x-auto">
                {unassignedRecentTickets.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>

                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Queue is clear
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      No unassigned tickets right now.
                    </p>
                  </div>
                ) : (
                  <table className="w-full min-w-[500px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200/70 bg-slate-50/70 dark:border-slate-800/70 dark:bg-slate-800/30">
                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Subject
                        </th>

                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Status
                        </th>

                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {unassignedRecentTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="transition-colors hover:bg-rose-50/30 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-3.5">
                            <Link
                              href={`/dashboard/tickets/${ticket.id}`}
                              className="block max-w-[240px] truncate text-xs font-bold text-slate-800 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                            >
                              {ticket.subject}
                            </Link>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-extrabold ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-[10px] font-semibold text-slate-400">
                            {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}


          {/* Agent Performance */}
          {isAdmin && (
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70">

              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl" />

              <div className="relative flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />

                    <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                      Agent Performance
                    </h2>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Current workload and resolution overview
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                {agentStats.length === 0 ? (
                  <div className="flex min-h-[220px] items-center justify-center text-xs text-slate-400">
                    No agent data available.
                  </div>
                ) : (
                  <table className="w-full min-w-[600px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200/70 bg-slate-50/70 dark:border-slate-800/70 dark:bg-slate-800/30">
                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Agent
                        </th>

                        <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Assigned
                        </th>

                        <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Open / WIP
                        </th>

                        <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Resolved
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {agentStats.map((agent: any) => (
                        <tr
                          key={agent.id}
                          className="transition-colors hover:bg-violet-50/30 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-[10px] font-extrabold text-white shadow-sm">
                                {(agent.name || 'U')
                                  .split(' ')
                                  .map((part: string) => part[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
                                  {agent.name}
                                </p>

                                <p className="max-w-[180px] truncate text-[10px] text-slate-400 dark:text-slate-500">
                                  {agent.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex min-w-[30px] justify-center rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {agent.total}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex min-w-[30px] justify-center rounded-full bg-purple-50 px-2 py-1 text-[10px] font-extrabold text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                              {agent.open}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            <span className="inline-flex min-w-[30px] justify-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                              {agent.resolved}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
