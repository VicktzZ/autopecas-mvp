"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Peca } from "@/lib/types";
import { categoriaColors } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

interface PecaTableProps {
  pecas: Peca[];
  onEdit: (peca: Peca) => void;
  onDelete: (peca: Peca) => void;
}

export function PecaTable({ pecas, onEdit, onDelete }: PecaTableProps) {
  if (pecas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Nenhuma peça encontrada.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-right">Qtd.</TableHead>
            <TableHead>Local</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pecas.map((p) => {
            const baixo = p.quantidade <= p.estoqueMinimo;
            return (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {p.sku}
                </TableCell>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("border-transparent", categoriaColors[p.categoria])}>
                    {p.categoria}
                  </Badge>
                </TableCell>
                <TableCell>{p.marca}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(p.precoVenda)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={baixo ? "destructive" : "secondary"}>
                    {p.quantidade}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.localizacao}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onEdit(p)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(p)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
