"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { Venda } from "@/lib/types";

interface SalesTrendChartProps {
  vendas: Venda[];
  days?: number;
  height?: number;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function SalesTrendChart({ vendas, days = 30, height = 260 }: SalesTrendChartProps) {
  const data = useMemo(() => {
    const totals = new Map<string, number>();
    for (const v of vendas) {
      const key = dayKey(new Date(v.data));
      totals.set(key, (totals.get(key) ?? 0) + v.total);
    }

    const hoje = new Date();
    const pontos = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      pontos.push({
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        total: totals.get(dayKey(d)) ?? 0,
      });
    }
    return pontos;
  }, [vendas, days]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => `R$${Math.round(v / 1)}`}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Vendas"]}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#salesTrendFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
