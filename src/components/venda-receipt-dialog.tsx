"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/context/store-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { Venda } from "@/lib/types";
import { Printer } from "lucide-react";

interface VendaReceiptDialogProps {
  venda: Venda | null;
  onOpenChange: (open: boolean) => void;
}

export function VendaReceiptDialog({ venda, onOpenChange }: VendaReceiptDialogProps) {
  const { clientes } = useStore();
  const cliente = venda?.clienteId
    ? clientes.find((c) => c.id === venda.clienteId)
    : undefined;

  return (
    <Dialog open={!!venda} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comprovante de Venda</DialogTitle>
          <DialogDescription>
            Venda finalizada com sucesso.
          </DialogDescription>
        </DialogHeader>

        {venda && (
          <div id="venda-receipt-print" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">{formatDate(venda.data)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium">{cliente?.nome ?? "Não informado"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Forma de Pagamento</span>
                <span className="font-medium">{venda.formaPagamento}</span>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2 text-sm">
              {venda.itens.map((item, idx) => (
                <div key={`${item.pecaId}-${idx}`} className="flex items-center justify-between">
                  <span>
                    {item.quantidade}x {item.nomePeca}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.quantidade * item.precoUnitario)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(venda.total)}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
