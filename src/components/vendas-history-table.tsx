"use client";

import { Fragment, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Venda } from "@/lib/types";
import { formaPagamentoColors } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface VendasHistoryTableProps {
  vendas: Venda[];
}

export function VendasHistoryTable({ vendas }: VendasHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ordenadas = [...vendas].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  if (ordenadas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Nenhuma venda registrada ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Data</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenadas.map((venda) => {
            const expandida = expandedId === venda.id;
            return (
              <Fragment key={venda.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpandedId(expandida ? null : venda.id)}
                >
                  <TableCell>
                    {expandida ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(venda.data)}
                  </TableCell>
                  <TableCell>
                    {venda.itens.length} {venda.itens.length === 1 ? "item" : "itens"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("border-transparent", formaPagamentoColors[venda.formaPagamento])}
                    >
                      {venda.formaPagamento}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(venda.total)}
                  </TableCell>
                </TableRow>
                {expandida && (
                  <TableRow className="bg-muted/40">
                    <TableCell colSpan={5} className="p-0">
                      <div className="px-4 py-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Peça</TableHead>
                              <TableHead className="text-right">Qtd.</TableHead>
                              <TableHead className="text-right">Unit.</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {venda.itens.map((item, idx) => (
                              <TableRow key={`${venda.id}-${idx}`}>
                                <TableCell>{item.nomePeca}</TableCell>
                                <TableCell className="text-right">
                                  {item.quantidade}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.precoUnitario)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.quantidade * item.precoUnitario)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
