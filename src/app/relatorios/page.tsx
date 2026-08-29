"use client";

import { useStore } from "@/context/store-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesTrendChart } from "@/components/charts/sales-trend-chart";
import { CategoryValueChart } from "@/components/charts/category-value-chart";
import { PaymentMethodChart } from "@/components/charts/payment-method-chart";
import { TopPartsChart } from "@/components/charts/top-parts-chart";

export default function RelatoriosPage() {
  const { pecas, vendas } = useStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground text-sm">
          Análise visual de vendas e estoque.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendas nos Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTrendChart vendas={vendas} />
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valor em Estoque por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryValueChart pecas={pecas} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas por Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentMethodChart vendas={vendas} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Peças Mais Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPartsChart vendas={vendas} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
