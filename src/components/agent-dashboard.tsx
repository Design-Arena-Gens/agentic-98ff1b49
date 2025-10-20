"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Flame,
  Gauge,
  Layers3,
  ShieldHalf,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AgentTier = "Alpha" | "Prime" | "Quantum";

type Agent = {
  id: string;
  name: string;
  avatar: string;
  tier: AgentTier;
  strategy: string;
  pnl: number;
  pnlHistory: { time: string; value: number }[];
  sharpe: number;
  reaction: number;
  winRate: number;
  volume: number;
  streak: number;
  drawdown: number;
  sentiment: number;
  color: string;
};

type ArenaSnapshot = {
  time: string;
  pnl: number;
  volume: number;
  velocity: number;
};

type MarketPulse = {
  axis: string;
  momentum: number;
  dominance: number;
  volatility: number;
};

type TradeEvent = {
  id: string;
  agentId: string;
  agentName: string;
  pair: string;
  side: "LONG" | "SHORT";
  size: number;
  leverage: number;
  price: number;
  pnl: number;
  exchange: string;
  timestamp: number;
};

const agentRoster: Agent[] = [
  {
    id: "nova",
    name: "Nova",
    avatar: "NV",
    tier: "Alpha",
    strategy: "Latency Arb",
    pnl: 184_200,
    pnlHistory: generateDeterministicSeries(184_200, 0.04),
    sharpe: 4.6,
    reaction: 42,
    winRate: 68,
    volume: 9.5,
    streak: 7,
    drawdown: 5.2,
    sentiment: 82,
    color: "from-cyan-400 via-blue-400 to-indigo-500",
  },
  {
    id: "atlas",
    name: "Atlas",
    avatar: "AT",
    tier: "Prime",
    strategy: "Perp Momentum",
    pnl: 139_450,
    pnlHistory: generateDeterministicSeries(139_450, 0.03),
    sharpe: 3.9,
    reaction: 53,
    winRate: 62,
    volume: 7.8,
    streak: 5,
    drawdown: 8.1,
    sentiment: 74,
    color: "from-emerald-400 via-teal-400 to-sky-500",
  },
  {
    id: "quantum",
    name: "Quantum",
    avatar: "QX",
    tier: "Alpha",
    strategy: "Options Vega",
    pnl: 104_320,
    pnlHistory: generateDeterministicSeries(104_320, 0.028),
    sharpe: 3.4,
    reaction: 61,
    winRate: 64,
    volume: 6.9,
    streak: 3,
    drawdown: 6.3,
    sentiment: 68,
    color: "from-fuchsia-400 via-pink-400 to-orange-400",
  },
  {
    id: "spectrum",
    name: "Spectrum",
    avatar: "SP",
    tier: "Prime",
    strategy: "Triangular Flow",
    pnl: 96_880,
    pnlHistory: generateDeterministicSeries(96_880, 0.024),
    sharpe: 3.1,
    reaction: 49,
    winRate: 59,
    volume: 5.4,
    streak: 2,
    drawdown: 9.4,
    sentiment: 62,
    color: "from-amber-400 via-orange-400 to-rose-500",
  },
  {
    id: "helix",
    name: "Helix",
    avatar: "HX",
    tier: "Quantum",
    strategy: "Cross-Chain Flow",
    pnl: 84_120,
    pnlHistory: generateDeterministicSeries(84_120, 0.021),
    sharpe: 2.8,
    reaction: 57,
    winRate: 55,
    volume: 4.7,
    streak: 4,
    drawdown: 11.2,
    sentiment: 59,
    color: "from-sky-400 via-blue-400 to-purple-500",
  },
];

const baseArenaHistory: ArenaSnapshot[] = buildInitialArenaHistory(agentRoster);

const baseMarketPulse: MarketPulse[] = [
  { axis: "BTC", momentum: 72, dominance: 65, volatility: 31 },
  { axis: "ETH", momentum: 64, dominance: 58, volatility: 26 },
  { axis: "SOL", momentum: 55, dominance: 41, volatility: 38 },
  { axis: "OP", momentum: 47, dominance: 32, volatility: 42 },
];

const baseTrades: TradeEvent[] = [
  {
    id: "t-001",
    agentId: "nova",
    agentName: "Nova",
    pair: "BTC-PERP",
    side: "LONG",
    size: 1.2,
    leverage: 9,
    price: 69_420,
    pnl: 640,
    exchange: "Vertex",
    timestamp: Date.now() - 28_000,
  },
  {
    id: "t-002",
    agentId: "atlas",
    agentName: "Atlas",
    pair: "ETH-PERP",
    side: "SHORT",
    size: 2.4,
    leverage: 7,
    price: 3_280,
    pnl: -120,
    exchange: "Hyperliquid",
    timestamp: Date.now() - 24_000,
  },
  {
    id: "t-003",
    agentId: "quantum",
    agentName: "Quantum",
    pair: "SOL-PERP",
    side: "LONG",
    size: 4.1,
    leverage: 5,
    price: 148.2,
    pnl: 220,
    exchange: "Aevo",
    timestamp: Date.now() - 16_000,
  },
  {
    id: "t-004",
    agentId: "spectrum",
    agentName: "Spectrum",
    pair: "OP-PERP",
    side: "SHORT",
    size: 6.3,
    leverage: 4,
    price: 3.52,
    pnl: 104,
    exchange: "Drift",
    timestamp: Date.now() - 10_000,
  },
];

const tradePairs = ["BTC-PERP", "ETH-PERP", "SOL-PERP", "OP-PERP", "ARB-PERP", "DOGE-PERP"];
const tradeVenues = ["Hyperliquid", "Vertex", "Drift", "Aevo", "DYDX", "Jupiter"];

export function AgentDashboard() {
  const [agents, setAgents] = useState(agentRoster);
  const [arenaHistory, setArenaHistory] = useState(baseArenaHistory);
  const [marketPulse, setMarketPulse] = useState(baseMarketPulse);
  const [tradeFeed, setTradeFeed] = useState(baseTrades);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) => {
        const updated = prev.map((agent, index) => {
          const drift = Math.sin(Date.now() / 24_000 + index) * 1_400;
          const variance = (Math.random() - 0.4) * (1_200 + index * 110);
          const pnlDelta = drift + variance;
          const nextPnl = Math.max(agent.pnl + pnlDelta, -280_000);

          const nextHistory = [...agent.pnlHistory.slice(-31), createHistoryPoint(nextPnl)];
          const updatedAgent: Agent = {
            ...agent,
            pnl: nextPnl,
            pnlHistory: nextHistory,
            streak: pnlDelta > 0 ? agent.streak + 1 : Math.max(agent.streak - 1, 0),
            drawdown: Math.min(Math.max(agent.drawdown + (pnlDelta < 0 ? 0.4 : -0.3), 3.5), 18),
            volume: Number((agent.volume + Math.max(pnlDelta, 0) / 75_000).toFixed(2)),
            winRate: clamp(agent.winRate + (pnlDelta > 0 ? 0.6 : -0.7), 48, 82),
            sharpe: clamp(agent.sharpe + pnlDelta / 85_000, 2, 5.2),
            reaction: clamp(agent.reaction + (Math.random() - 0.4) * 3.5, 35, 74),
            sentiment: clamp(agent.sentiment + (pnlDelta > 0 ? 2.2 : -2.6), 40, 96),
          };
          return updatedAgent;
        });

        const aggregate = updated.reduce(
          (totals, agent) => {
            totals.pnl += agent.pnl;
            totals.volume += agent.volume;
            totals.velocity += agent.reaction;
            return totals;
          },
          { pnl: 0, volume: 0, velocity: 0 }
        );

        setArenaHistory((prevHistory) => {
          const nextEntry: ArenaSnapshot = {
            time: new Intl.DateTimeFormat("en", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).format(Date.now()),
            pnl: Number(aggregate.pnl.toFixed(0)),
            volume: Number((aggregate.volume * 11).toFixed(1)),
            velocity: Number((aggregate.velocity / updated.length).toFixed(2)),
          };
          return [...prevHistory.slice(-31), nextEntry];
        });

        setMarketPulse((prevPulse) =>
          prevPulse.map((asset, idx) => ({
            ...asset,
            momentum: clamp(
              asset.momentum + Math.sin(Date.now() / (19_000 + idx * 3_000)) * 2.4 + (Math.random() - 0.5) * 3.2,
              28,
              96
            ),
            dominance: clamp(asset.dominance + (Math.random() - 0.48) * 2.4, 18, 82),
            volatility: clamp(asset.volatility + (Math.random() - 0.5) * 4.1, 12, 64),
          }))
        );

        maybeAddTradeEvent(updated, setTradeFeed);

        return updated;
      });
    }, 2_600);

    return () => clearInterval(interval);
  }, []);

  const sortedAgents = useMemo(
    () => [...agents].sort((a, b) => b.pnl - a.pnl),
    [agents]
  );

  const leadingAgent = sortedAgents[0];
  const pnlLead =
    leadingAgent?.pnl && sortedAgents[1]?.pnl
      ? leadingAgent.pnl - sortedAgents[1].pnl
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pt-10 md:px-10">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur"
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live Arena Feed
            </span>
            <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Next generation agent combat
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Agentic Crypto Combat Hub
              </h1>
              <p className="mt-3 max-w-xl text-base text-slate-300 md:text-lg">
                Watch autonomous traders battle across perpetual venues in real time. Performance metrics blend P&L velocity, execution quality, and network-wide dominance.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-300 sm:w-auto">
              <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-emerald-200/80">
                <Trophy className="h-4 w-4" />
                Arena Leader
              </div>
              {leadingAgent ? (
                <>
                  <div className="text-3xl font-semibold text-white">{leadingAgent.name}</div>
                  <div className="flex items-center gap-3 text-sm text-emerald-200/70">
                    <ArrowUpRight className="h-4 w-4" />
                    {formatCurrency(leadingAgent.pnl)} total edge
                  </div>
                  <div className="text-xs text-emerald-200/60">
                    Holding a {formatCurrency(pnlLead)} lead over the pack
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </motion.header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Arena Net Edge"
            value={formatCurrency(
              agents.reduce((acc, agent) => acc + agent.pnl, 0)
            )}
            change="+3.7% surge"
            icon={<Zap className="h-5 w-5 text-amber-300" />}
            gradient="from-amber-500/10 via-orange-500/10 to-rose-500/10"
          />
          <StatCard
            title="Velocity Index"
            value={`${(
              agents.reduce((acc, agent) => acc + agent.reaction, 0) / agents.length
            ).toFixed(1)} ms`}
            change="Execution tempo stable"
            icon={<Activity className="h-5 w-5 text-cyan-300" />}
            gradient="from-cyan-500/10 via-sky-500/10 to-indigo-500/10"
          />
          <StatCard
            title="Risk Armor"
            value={`${(
              agents.reduce((acc, agent) => acc + (100 - agent.drawdown), 0) / agents.length
            ).toFixed(1)}%`}
            change="Adaptive hedging online"
            icon={<ShieldHalf className="h-5 w-5 text-emerald-300" />}
            gradient="from-emerald-500/10 via-green-500/10 to-lime-500/10"
          />
          <StatCard
            title="Streak Heat"
            value={`${Math.max(...agents.map((agent) => agent.streak))} wins`}
            change="Arena streak analyzer"
            icon={<Flame className="h-5 w-5 text-rose-300" />}
            gradient="from-rose-500/10 via-pink-500/10 to-purple-500/10"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.4 }}
            className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold text-white">Agent Leaderboard</h2>
                <p className="text-sm text-slate-400">
                  Ranked by real-time P&L velocity and execution precision.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/80 px-3 py-1 text-xs text-slate-300">
                <Gauge className="h-4 w-4 text-cyan-300" />
                Calibrated 0.2s ago
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {sortedAgents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 transition duration-300 hover:border-slate-700 hover:bg-slate-900"
                >
                  <div
                    className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-80"
                    style={{
                      background: `linear-gradient(90deg, ${resolveGradient(agent.color)
                        .map((stop) => withAlpha(stop, 0.2))
                        .join(", ")})`,
                    }}
                  />
                  <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-semibold text-slate-950"
                        style={{
                          background: `linear-gradient(135deg, ${resolveGradient(agent.color).join(", ")})`,
                        }}
                      >
                        {agent.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{index + 1}. {agent.name}</h3>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-200">
                            {agent.tier}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{agent.strategy}</p>
                      </div>
                    </div>

                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4 md:w-auto">
                      <Metric
                        label="Edge"
                        value={formatCurrency(agent.pnl)}
                        accent="text-emerald-300"
                      />
                      <Metric
                        label="Win Rate"
                        value={`${agent.winRate.toFixed(1)}%`}
                        accent="text-cyan-300"
                      />
                      <Metric
                        label="Sharpe"
                        value={agent.sharpe.toFixed(2)}
                        accent="text-amber-300"
                      />
                      <Metric
                        label="Volume (M)"
                        value={agent.volume.toFixed(2)}
                        accent="text-rose-300"
                      />
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 grid gap-4 md:grid-cols-[1.3fr_1fr]">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                      <ResponsiveContainer width="100%" height={70}>
                        <AreaChart data={agent.pnlHistory}>
                          <defs>
                            <linearGradient id={`spark-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#34d399" stopOpacity={0.92} />
                              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Tooltip
                            wrapperClassName="!text-xs"
                            contentStyle={{
                              background: "rgba(15,23,42,0.9)",
                              borderRadius: "0.75rem",
                              border: "1px solid rgba(71,85,105,0.4)",
                              color: "#e2e8f0",
                            }}
                            labelFormatter={(label) => `Snapshot ${label}`}
                            formatter={(value: number) => [formatCurrency(value), "P&L"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#34d399"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#spark-${agent.id})`}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Tag label="Streak" value={`${agent.streak} wins`} />
                      <Tag label="Drawdown" value={`${agent.drawdown.toFixed(1)}%`} />
                      <Tag label="Sentiment" value={`${agent.sentiment.toFixed(0)}%`} />
                      <Tag label="Latency" value={`${agent.reaction.toFixed(1)} ms`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <div className="grid gap-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, amount: 0.4 }}
              className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Arena Trajectory</h2>
                  <p className="text-xs text-slate-400">
                    Aggregate P&L momentum and flow velocity.
                  </p>
                </div>
                <Layers3 className="h-5 w-5 text-slate-500" />
              </div>
              <div className="mt-5 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={arenaHistory}>
                    <defs>
                      <linearGradient id="arena-pnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="arena-volume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.3)" />
                    <XAxis dataKey="time" stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 10 }} />
                    <YAxis stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.9)",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(71,85,105,0.4)",
                        color: "#e2e8f0",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pnl"
                      name="Net Edge"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fill="url(#arena-pnl)"
                    />
                    <Line
                      type="monotone"
                      dataKey="velocity"
                      name="Velocity"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-300">
                <Tag label="Flow Velocity" value={`${arenaHistory.at(-1)?.velocity ?? 0} ms`} />
                <Tag label="Arena Volume" value={`${arenaHistory.at(-1)?.volume ?? 0} M`} />
                <Tag label="Pulse" value={`${arenaHistory.at(-1)?.pnl ?? 0} USD`} />
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              viewport={{ once: true, amount: 0.4 }}
              className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Market Pulse</h2>
                  <p className="text-xs text-slate-400">
                    Cross-asset momentum and volatility radar.
                  </p>
                </div>
                <Zap className="h-5 w-5 text-amber-300" />
              </div>
              <div className="mt-5 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketPulse}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.25)" />
                    <XAxis dataKey="axis" stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.9)",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(71,85,105,0.4)",
                        color: "#e2e8f0",
                      }}
                    />
                    <Bar dataKey="momentum" fill="#22d3ee" name="Momentum" radius={8} />
                    <Bar dataKey="dominance" fill="#f97316" name="Dominance" radius={8} />
                    <Bar dataKey="volatility" fill="#f472b6" name="Volatility" radius={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 backdrop-blur"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Execution Stream</h2>
              <p className="text-xs text-slate-400">
                Latest autonomous trades across supported venues.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Synced {timeAgo(tradeFeed[0]?.timestamp ?? Date.now())} ago
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tradeFeed.map((trade) => (
              <div
                key={trade.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{timeAgo(trade.timestamp)}</span>
                  <span>{trade.exchange}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{trade.agentName}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      {trade.pair} • {trade.side}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-100">
                      {trade.size.toFixed(2)} contracts
                    </div>
                    <div className={`text-xs font-medium ${trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {trade.pnl >= 0 ? "+" : "-"}
                      {Math.abs(trade.pnl).toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Entry ${trade.price.toLocaleString()}</span>
                  <span>{trade.leverage}x leverage</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  gradient: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 transition`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition group-hover:opacity-100`} />
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
          <span>{title}</span>
          <span className="rounded-full bg-slate-950/60 px-2 py-1 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-700/70">
            {change}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-semibold text-white">{value}</div>
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/80 p-2">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-base font-semibold ${accent}`}>{value}</div>
    </div>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-white">{value}</div>
    </div>
  );
}

function createHistoryPoint(value: number) {
  return {
    time: new Intl.DateTimeFormat("en", {
      minute: "2-digit",
      second: "2-digit",
    }).format(Date.now()),
    value: Number(value.toFixed(0)),
  };
}

function buildInitialArenaHistory(roster: Agent[]): ArenaSnapshot[] {
  const steps = Array.from({ length: 32 }, (_, index) => index);
  return steps.map((step) => {
    const pnl = roster.reduce(
      (total, agent, idx) =>
        total +
        agent.pnl * 0.5 +
        Math.sin(idx + step / 3) * 6_000 +
        idx * 4_000 +
        step * 3_200,
      0
    );
    return {
      time: `T-${steps.length - step}`,
      pnl: Number(pnl.toFixed(0)),
      volume: Number((step * 9.4 + 18).toFixed(1)),
      velocity: Number((42 + Math.sin(step / 2) * 7).toFixed(2)),
    };
  });
}

function generateDeterministicSeries(base: number, variance: number) {
  return Array.from({ length: 32 }, (_, index) => ({
    time: `-${32 - index}m`,
    value: Number((base * 0.4 + Math.sin(index * variance * 6) * base * variance + index * 2_400).toFixed(0)),
  }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatCurrency(value: number) {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function timeAgo(timestamp: number) {
  const delta = Date.now() - timestamp;
  if (delta < 60_000) {
    return `${Math.floor(delta / 1_000)}s`;
  }
  if (delta < 3_600_000) {
    return `${Math.floor(delta / 60_000)}m`;
  }
  return `${Math.floor(delta / 3_600_000)}h`;
}

function maybeAddTradeEvent(
  agents: Agent[],
  setTradeFeed: Dispatch<SetStateAction<TradeEvent[]>>
) {
  if (Math.random() > 0.78) {
    return;
  }

  const selected = agents[Math.floor(Math.random() * agents.length)];
  const side = Math.random() > 0.45 ? "LONG" : "SHORT";
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 6)
      : Math.random().toString(16).slice(2, 8);

  const event: TradeEvent = {
    id: `t-${unique}`,
    agentId: selected.id,
    agentName: selected.name,
    pair: tradePairs[Math.floor(Math.random() * tradePairs.length)],
    side,
    size: Number((Math.random() * 6.4 + 0.5).toFixed(2)),
    leverage: Math.floor(Math.random() * 10) + 2,
    price: Number((Math.random() * 60_000 + 1_200).toFixed(2)),
    pnl: Number(((Math.random() - 0.3) * 2.4).toFixed(2)),
    exchange: tradeVenues[Math.floor(Math.random() * tradeVenues.length)],
    timestamp: Date.now(),
  };

  setTradeFeed((prev) => [event, ...prev].slice(0, 9));
}

function resolveGradient(value: string) {
  const stops = value
    .split(" ")
    .filter((token) => token.includes("-"))
    .map((stop) => tailwindColorToken(stop));
  return stops.length ? stops : ["#6366f1", "#a855f7", "#ec4899"];
}

function tailwindColorToken(token: string) {
  const lookup: Record<string, string> = {
    "from-cyan-400": "#22d3ee",
    "via-blue-400": "#60a5fa",
    "to-indigo-500": "#6366f1",
    "from-emerald-400": "#34d399",
    "via-teal-400": "#2dd4bf",
    "to-sky-500": "#0ea5e9",
    "from-fuchsia-400": "#e879f9",
    "via-pink-400": "#f472b6",
    "to-orange-400": "#fb923c",
    "from-amber-400": "#fbbf24",
    "via-orange-400": "#fb923c",
    "to-rose-500": "#f43f5e",
    "from-sky-400": "#38bdf8",
    "to-purple-500": "#a855f7",
  };
  return lookup[token] ?? "#818cf8";
}

function withAlpha(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
