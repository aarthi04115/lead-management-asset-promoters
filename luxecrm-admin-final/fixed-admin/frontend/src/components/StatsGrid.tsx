import React, { useEffect, useState } from "react";
import { StatCard } from "../types";
import { api, StatsData } from "../api";

const accentClasses: Record<StatCard["accentColor"], { border: string; icon: string }> = {
  primary: { border: "border-primary", icon: "text-black" },
  secondary: { border: "border-secondary", icon: "text-secondary" },
  error: { border: "border-error", icon: "text-error" },
  "surface-tint": { border: "border-surface-tint", icon: "text-surface-tint" },
};

const StatsGrid: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {/* silently fall back to null */});
  }, []);

  const cards: StatCard[] = [
    {
      label: "Total Properties",
      value: stats ? String(stats.total) : "—",
      icon: "inventory_2",
      accentColor: "primary",
    },
    {
      label: "Available",
      value: stats ? String(stats.available) : "—",
      icon: "check_circle",
      accentColor: "secondary",
    },
    {
      label: "Booked",
      value: stats ? String(stats.booked) : "—",
      icon: "lock",
      accentColor: "error",
    },
    {
      label: "Negotiation",
      value: stats ? String(stats.negotiation) : "—",
      icon: "handshake",
      accentColor: "surface-tint",
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {cards.map((stat) => {
        const accent = accentClasses[stat.accentColor];
        return (
          <div
            key={stat.label}
            className={`bg-surface-container-lowest p-4 sm:p-6 rounded-xl custom-shadow-l1 flex flex-col justify-between border-l-4 ${accent.border}`}
          >
            <div>
              <span className={`material-symbols-outlined mb-2 ${accent.icon}`}>
                {stat.icon}
              </span>
              <p className="text-xs text-outline uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-black mt-2">
              {stat.value}
              {stat.suffix && (
                <span className="text-sm font-normal text-outline"> {stat.suffix}</span>
              )}
            </h3>
          </div>
        );
      })}
    </section>
  );
};

export default StatsGrid;
