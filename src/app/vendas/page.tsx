"use client";

import { useStore } from "@/context/store-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendaCart } from "@/components/venda-cart";
import { VendasHistoryTable } from "@/components/vendas-history-table";

export default function VendasPage() {
  const { vendas } = useStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Vendas</h1>
        <p className="text-muted-foreground text-sm">
          Registre uma nova venda ou consulte o histórico.
        </p>
      </div>

      <Tabs defaultValue="nova">
        <TabsList>
          <TabsTrigger value="nova">Nova Venda</TabsTrigger>
          <TabsTrigger value="historico">Histórico ({vendas.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="nova" className="pt-4">
          <VendaCart />
        </TabsContent>
        <TabsContent value="historico" className="pt-4">
          <VendasHistoryTable vendas={vendas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
