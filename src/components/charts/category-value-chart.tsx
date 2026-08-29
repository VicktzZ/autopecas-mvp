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
import { formatCurrency } from "@/lib/format";
import { Peca } from "@/lib/types";

interface CategoryValueChartProps {
  pecas: Peca[];
  height?: number;
}

export function CategoryValueChart({ pecas, height = 280 }: CategoryValueChartProps) {
  const data = useMemo(() => {
    const totals = new Map<string, number>();
    for (const p of pecas) {
      totals.set(p.categoria, (totals.get(p.categoria) ?? 0) + p.precoVenda * p.quantidade);
    }
    return Array.from(totals.entries())
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [pecas]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `R$${Math.round(v)}`}
        />
        <YAxis
          type="category"
          dataKey="categoria"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={110}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Valor em estoque"]}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Bar dataKey="valor" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
