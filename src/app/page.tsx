"use client";

import { useMemo } from "react";
import { useStore } from "@/context/store-context";
import { StatCard } from "@/components/stat-card";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoriaColors, formaPagamentoColors } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Boxes,
  CalendarDays,
  DollarSign,
  TrendingUp,
} from "lucide-react";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export default function DashboardPage() {
  const { pecas, vendas } = useStore();

  const stats = useMemo(() => {
    const hoje = new Date();

    const valorTotalEstoque = pecas.reduce(
      (sum, p) => sum + p.precoVenda * p.quantidade,
      0
    );
    const totalItensEstoque = pecas.reduce((sum, p) => sum + p.quantidade, 0);
    const pecasEstoqueBaixo = pecas.filter((p) => p.quantidade <= p.estoqueMinimo);

    const vendasHoje = vendas.filter((v) => isSameDay(new Date(v.data), hoje));
    const vendasMes = vendas.filter((v) => isSameMonth(new Date(v.data), hoje));

    const totalVendasHoje = vendasHoje.reduce((sum, v) => sum + v.total, 0);
    const totalVendasMes = vendasMes.reduce((sum, v) => sum + v.total, 0);

    const ultimasVendas = [...vendas]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);

    return {
      valorTotalEstoque,
      totalItensEstoque,
      pecasEstoqueBaixo,
      totalVendasHoje,
      totalVendasMes,
      ultimasVendas,
    };
  }, [pecas, vendas]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Visão geral do estoque e das vendas da loja.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Valor em Estoque"
          value={formatCurrency(stats.valorTotalEstoque)}
          icon={DollarSign}
          tone="blue"
        />
        <StatCard
          title="Itens em Estoque"
          value={stats.totalItensEstoque.toString()}
          icon={Boxes}
          tone="purple"
        />
        <StatCard
          title="Vendas Hoje"
          value={formatCurrency(stats.totalVendasHoje)}
          icon={CalendarDays}
          tone="green"
        />
        <StatCard
          title="Vendas no Mês"
          value={formatCurrency(stats.totalVendasMes)}
          icon={TrendingUp}
          tone="amber"
        />
        <StatCard
          title="Estoque Baixo"
          value={stats.pecasEstoqueBaixo.length.toString()}
          icon={AlertTriangle}
          tone="red"
          highlight={stats.pecasEstoqueBaixo.length > 0}
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peças com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.pecasEstoqueBaixo.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma peça abaixo do estoque mínimo.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Peça</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead className="text-right">Mínimo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.pecasEstoqueBaixo.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border-transparent", categoriaColors[p.categoria])}>
                            {p.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">{p.quantidade}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {p.estoqueMinimo}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimas Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.ultimasVendas.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(v.data)}
                      </TableCell>
                      <TableCell>
                        {v.itens.length}{" "}
                        {v.itens.length === 1 ? "item" : "itens"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border-transparent", formaPagamentoColors[v.formaPagamento])}>
                          {v.formaPagamento}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(v.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
