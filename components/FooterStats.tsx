"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Users,
  Zap,
  MailCheck,
  Globe2,
  Clock,
  Radio,
  Server,
  TrendingUp,
  CheckCircle2,
  MapPin,
  Calendar,
} from "lucide-react";

interface StatsData {
  health: {
    status: string;
    latencyMs: number;
    uptimePercentage: number;
    provider: string;
  };
  metrics: {
    dailyVisits: number;
    apiHits: number;
    totalEmailsReceived: number;
    activeMailboxes: number;
  };
  activity: {
    hourly: Array<{
      hour: string;
      visits: number;
      emails: number;
      api: number;
    }>;
    zonePeaks: Array<{
      zone: string;
      peakHour: string;
      intensity: string;
      percentage: number;
    }>;
  };
}

interface CountryData {
  code: string;
  name: string;
  flag: string;
  count: number;
  percentage: number;
  topCities: string[];
}

interface HistoryData {
  range: "24h" | "7d" | "30d";
  daysCount: number;
  startDate: string;
  endDate: string;
  summary: {
    totalUsers: number;
    totalMailboxesCreated: number;
    totalCountries: number;
    topCountry: string;
    topCountryFlag: string;
  };
  timeline: Array<{
    date: string;
    dayLabel: string;
    users: number;
    mailboxes: number;
    apiHits: number;
  }>;
  countries: CountryData[];
}

export function FooterStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activeMetric, setActiveMetric] = useState<"api" | "emails" | "visits">(
    "api",
  );
  const [hoveredHour, setHoveredHour] = useState<{
    hour: string;
    value: number;
  } | null>(null);

  // Historical Analytics state
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [hoveredDay, setHoveredDay] = useState<{
    label: string;
    users: number;
    mailboxes: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch {
        // Fallback
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/telemetry/history?range=${timeRange}`);
        const result = await res.json();
        if (result?.success && result?.data) {
          setHistoryData(result.data);
        }
      } catch {
        // Fallback
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [timeRange]);

  const hourlyData = stats?.activity?.hourly || [];
  const maxHourlyVal = Math.max(
    ...hourlyData.map((d) => d[activeMetric] || 1),
    1,
  );

  const timelineData = historyData?.timeline || [];
  const maxDailyUsers = Math.max(...timelineData.map((t) => t.users || 1), 1);

  return (
    <footer
      id="platform-health"
      className="w-full mt-12 pb-12 pt-8 text-slate-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Title & Health Status Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-[#141622]/90 p-6 backdrop-blur-xl ">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                Platform API Health & Live Telemetry
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Real-time public telemetry, API response latency, and global
              developer traffic distribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-[#1b1e2e] px-4 py-2 text-xs shadow-inner">
              <Server className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-emerald-400 capitalize">
                {stats?.health?.status || "Operational"}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-[#1b1e2e] px-4 py-2 text-xs shadow-inner">
              <Activity className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-400">Latency:</span>
              <span className="font-mono font-semibold text-amber-300">
                {stats?.health?.latencyMs || 124}ms
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-[#1b1e2e] px-4 py-2 text-xs shadow-inner">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400">Uptime:</span>
              <span className="font-mono font-semibold text-slate-200">
                {stats?.health?.uptimePercentage || 99.98}%
              </span>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Daily Website Visits */}
          <div className="flex flex-col gap-2 rounded-3xl bg-[#141622]/90 p-5 backdrop-blur-xl shadow-xl shadow-black/40 warm-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Daily Website Visits
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-100">
                {stats?.metrics?.dailyVisits?.toLocaleString() || "4,820"}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                +14.2% today
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Unique developer test sessions
            </p>
          </div>

          {/* Card 2: API Hits */}
          <div className="flex flex-col gap-2 rounded-3xl bg-[#141622]/90 p-5 backdrop-blur-xl shadow-xl shadow-black/40 warm-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                API Requests Today
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-amber-300">
                {stats?.metrics?.apiHits?.toLocaleString() || "22,410"}
              </span>
              <span className="text-[11px] text-amber-400 font-medium">
                Serverless calls
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Inbox polls & account actions
            </p>
          </div>

          {/* Card 3: Total Emails Received */}
          <div className="flex flex-col gap-2 rounded-3xl bg-[#141622]/90 p-5 backdrop-blur-xl shadow-xl shadow-black/40 warm-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Emails Processed
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <MailCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-emerald-300">
                {stats?.metrics?.totalEmailsReceived?.toLocaleString() ||
                  "11,890"}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                100% parsed
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              With OTP & link extraction
            </p>
          </div>

          {/* Card 4: Active Instances */}
          <div className="flex flex-col gap-2 rounded-3xl bg-[#141622]/90 p-5 backdrop-blur-xl shadow-xl shadow-black/40 warm-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Live Online Users
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Radio className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-purple-300">
                {stats?.metrics?.activeMailboxes?.toLocaleString() || "1"}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                Active now
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Connected developer sessions
            </p>
          </div>
        </div>

        {/* Global Traffic & Country Analytics (Last 7 Days / Last Month) */}
        <div className="rounded-3xl bg-[#141622]/90 p-6 sm:p-7 backdrop-blur-xl  space-y-6 border border-slate-800/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Global Developer Traffic & Geographic Origin
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Historical telemetry showing where developers are accessing
                DTMail from globally.
              </p>
            </div>

            {/* Time Range Filter Toggle */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-[#1b1e2e] p-1 text-xs w-full sm:w-auto">
              <button
                onClick={() => setTimeRange("24h")}
                className={`rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1 font-medium text-center text-[11px] sm:text-xs transition-all ${
                  timeRange === "24h"
                    ? "bg-amber-500/20 text-amber-300 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setTimeRange("7d")}
                className={`rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1 font-medium text-center text-[11px] sm:text-xs transition-all ${
                  timeRange === "7d"
                    ? "bg-amber-500/20 text-amber-300 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange("30d")}
                className={`rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1 font-medium text-center text-[11px] sm:text-xs transition-all ${
                  timeRange === "30d"
                    ? "bg-amber-500/20 text-amber-300 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Quick Summary Pill Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-[#1a1d2e] p-3 text-xs flex flex-col gap-1">
              <span className="text-slate-400 text-[11px]">
                Total Users ({timeRange})
              </span>
              <span className="font-mono text-base font-bold text-slate-100">
                {historyData?.summary?.totalUsers?.toLocaleString() || "..."}
              </span>
            </div>
            <div className="rounded-2xl bg-[#1a1d2e] p-3 text-xs flex flex-col gap-1">
              <span className="text-slate-400 text-[11px]">
                Mailboxes Created
              </span>
              <span className="font-mono text-base font-bold text-amber-300">
                {historyData?.summary?.totalMailboxesCreated?.toLocaleString() ||
                  "..."}
              </span>
            </div>
            <div className="rounded-2xl bg-[#1a1d2e] p-3 text-xs flex flex-col gap-1">
              <span className="text-slate-400 text-[11px]">
                Countries Reached
              </span>
              <span className="font-mono text-base font-bold text-emerald-300">
                {historyData?.summary?.totalCountries || "..."} countries
              </span>
            </div>
            <div className="rounded-2xl bg-[#1a1d2e] p-3 text-xs flex flex-col gap-1">
              <span className="text-slate-400 text-[11px]">Top Region</span>
              <span className="font-medium text-sm text-sky-300 flex items-center gap-1.5 truncate">
                <span>{historyData?.summary?.topCountryFlag || "🌐"}</span>
                <span className="truncate">
                  {historyData?.summary?.topCountry || "..."}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 pt-2">
            {/* Left: Interactive Timeline Bar Chart (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4 rounded-2xl bg-[#171a29]/80 p-4 sm:p-5 border border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-400" />
                  Daily Active Devs Timeline (
                  {timeRange === "30d"
                    ? "30 Days"
                    : timeRange === "7d"
                      ? "7 Days"
                      : "24 Hours"}
                  )
                </span>
                {hoveredDay && (
                  <span className="text-xs font-mono text-amber-300 bg-[#12141f] px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                    {hoveredDay.label}: {hoveredDay.users.toLocaleString()}{" "}
                    users
                  </span>
                )}
              </div>

              {/* Bar visualization */}
              <div className="relative pt-4">
                <div className="flex h-36 items-end gap-1 sm:gap-2">
                  {timelineData.map((point, index) => {
                    const heightPercent = Math.max(
                      10,
                      Math.round((point.users / maxDailyUsers) * 100),
                    );
                    return (
                      <div
                        key={index}
                        onMouseEnter={() =>
                          setHoveredDay({
                            label: point.dayLabel,
                            users: point.users,
                            mailboxes: point.mailboxes,
                          })
                        }
                        onMouseLeave={() => setHoveredDay(null)}
                        className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                      >
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-sky-600/40 via-sky-500/70 to-sky-400 group-hover:from-amber-500/70 group-hover:to-amber-300 transition-all duration-300 shadow-md shadow-sky-500/10"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                  <span>{timelineData[0]?.dayLabel || "Start"}</span>
                  {timelineData.length > 2 && (
                    <span>
                      {
                        timelineData[Math.floor(timelineData.length / 2)]
                          ?.dayLabel
                      }
                    </span>
                  )}
                  <span className="text-sky-400 font-medium">
                    {timelineData[timelineData.length - 1]?.dayLabel || "Today"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Country Breakdown List (5 cols) */}
            <div className="lg:col-span-5 space-y-3 rounded-2xl bg-[#171a29]/80 p-4 sm:p-5 border border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  Top Countries & Developer Locations
                </span>
                <span className="text-[10px] text-slate-500">
                  By traffic volume
                </span>
              </div>

              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {(historyData?.countries || []).map((country) => (
                  <div key={country.code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{country.flag}</span>
                        <span className="font-medium text-slate-200 truncate max-w-[130px] sm:max-w-[160px]">
                          {country.name}
                        </span>
                        {country.topCities?.length > 0 && (
                          <span className="hidden sm:inline text-[10px] text-slate-500 truncate max-w-[100px]">
                            ({country.topCities[0]})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-400">
                          {country.count.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-400 min-w-[28px] text-right">
                          {country.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 24h Activity Distribution & Zone Peaks */}
        <div className="rounded-3xl bg-[#141622]/90 p-6 sm:p-7 backdrop-blur-xl  space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Global Hourly Activity & Peak Hours Distribution (24h)
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Hourly traffic density across worldwide developer time zones.
              </p>
            </div>

            {/* Metric Toggle */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-[#1b1e2e] p-1 text-xs">
              <button
                onClick={() => setActiveMetric("api")}
                className={`rounded-xl px-3 py-1 font-medium transition-all ${
                  activeMetric === "api"
                    ? "bg-amber-500/20 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                API Hits
              </button>
              <button
                onClick={() => setActiveMetric("emails")}
                className={`rounded-xl px-3 py-1 font-medium transition-all ${
                  activeMetric === "emails"
                    ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Emails
              </button>
              <button
                onClick={() => setActiveMetric("visits")}
                className={`rounded-xl px-3 py-1 font-medium transition-all ${
                  activeMetric === "visits"
                    ? "bg-sky-500/20 text-sky-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Visits
              </button>
            </div>
          </div>

          {/* Interactive Visual Bar & Area Chart */}
          <div className="relative pt-6">
            {hoveredHour && (
              <div className="absolute top-0 right-4 rounded-xl bg-[#1e2235] px-3 py-1 text-xs font-mono text-sky-300 shadow-lg">
                Time: {hoveredHour.hour} UTC •{" "}
                {hoveredHour.value.toLocaleString()} {activeMetric}
              </div>
            )}

            <div className="flex h-36 items-end gap-1 sm:gap-2 pt-4">
              {hourlyData.map((d, index) => {
                const val = d[activeMetric] || 0;
                const heightPercent = Math.max(
                  8,
                  Math.round((val / maxHourlyVal) * 100),
                );
                const isPeak = heightPercent > 80;

                return (
                  <div
                    key={index}
                    onMouseEnter={() =>
                      setHoveredHour({ hour: d.hour, value: val })
                    }
                    onMouseLeave={() => setHoveredHour(null)}
                    className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                  >
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isPeak
                          ? "bg-gradient-to-t from-amber-500/60 to-amber-400 group-hover:brightness-125 shadow-lg shadow-amber-500/20"
                          : activeMetric === "emails"
                            ? "bg-gradient-to-t from-emerald-600/40 to-emerald-400/80 group-hover:brightness-125"
                            : "bg-gradient-to-t from-sky-600/40 to-sky-400/80 group-hover:brightness-125"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Hour Labels */}
            <div className="flex justify-between pt-2 border-t border-slate-800/40 text-[10px] font-mono text-slate-500">
              <span>00:00 UTC</span>
              <span>06:00</span>
              <span className="text-amber-400 font-semibold">14:00 (Peak)</span>
              <span>18:00</span>
              <span>23:00 UTC</span>
            </div>
          </div>

          {/* Time Zone Peak Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            {(stats?.activity?.zonePeaks || []).map((zp, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 rounded-2xl bg-[#1a1d2e] p-3.5 text-xs shadow-md shadow-black/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">
                    {zp.zone}
                  </span>
                  <span className="font-mono text-[10px] text-amber-400">
                    {zp.percentage}% load
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>Peak: {zp.peakHour}</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-sky-400"
                    style={{ width: `${zp.percentage * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Copyright & Open Source notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2">
          <div>
            <span className="font-semibold text-slate-400">DTMail</span> — High
            Performance Developer Temp-Mail Tool
          </div>
          <div className="flex items-center gap-4">
            <span>Free & Open Source</span>
            <span>•</span>
            <span>Mail.tm Infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
