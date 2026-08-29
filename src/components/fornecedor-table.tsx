"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Fornecedor } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";

interface FornecedorTableProps {
  fornecedores: Fornecedor[];
  onEdit: (fornecedor: Fornecedor) => void;
  onDelete: (fornecedor: Fornecedor) => void;
}

export function FornecedorTable({
  fornecedores,
  onEdit,
  onDelete,
}: FornecedorTableProps) {
  if (fornecedores.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Nenhum fornecedor encontrado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fornecedores.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-medium">{f.nome}</TableCell>
              <TableCell>{f.contato}</TableCell>
              <TableCell>{f.telefone}</TableCell>
              <TableCell className="text-muted-foreground">
                {f.email || "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onEdit(f)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(f)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
