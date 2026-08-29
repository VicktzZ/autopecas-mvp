"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";
import { Venda } from "@/lib/types";

interface PaymentMethodChartProps {
  vendas: Venda[];
  height?: number;
}

const colors = ["var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function PaymentMethodChart({ vendas, height = 260 }: PaymentMethodChartProps) {
  const data = useMemo(() => {
    const totals = new Map<string, number>();
    for (const v of vendas) {
      totals.set(v.formaPagamento, (totals.get(v.formaPagamento) ?? 0) + v.total);
    }
    return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
  }, [vendas]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Total"]}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={2}
          label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
