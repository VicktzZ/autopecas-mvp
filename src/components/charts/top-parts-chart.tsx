"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Venda } from "@/lib/types";

interface TopPartsChartProps {
  vendas: Venda[];
  limit?: number;
  height?: number;
}

export function TopPartsChart({ vendas, limit = 5, height = 260 }: TopPartsChartProps) {
  const data = useMemo(() => {
    const totals = new Map<string, number>();
    for (const v of vendas) {
      for (const item of v.itens) {
        totals.set(item.nomePeca, (totals.get(item.nomePeca) ?? 0) + item.quantidade);
      }
    }
    return Array.from(totals.entries())
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, limit);
  }, [vendas, limit]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="nome"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <Tooltip
          formatter={(value) => [Number(value), "Unidades vendidas"]}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Bar dataKey="quantidade" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
