"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fornecedor } from "@/lib/types";

const emptyForm = {
  nome: "",
  contato: "",
  telefone: "",
  email: "",
};

interface FornecedorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor: Fornecedor | null;
  onSubmit: (fornecedor: Omit<Fornecedor, "id">) => void;
}

function formFromFornecedor(fornecedor: Fornecedor | null) {
  if (!fornecedor) return emptyForm;
  return {
    nome: fornecedor.nome,
    contato: fornecedor.contato,
    telefone: fornecedor.telefone,
    email: fornecedor.email ?? "",
  };
}

export function FornecedorFormDialog({
  open,
  onOpenChange,
  fornecedor,
  onSubmit,
}: FornecedorFormDialogProps) {
  const [form, setForm] = useState(() => formFromFornecedor(fornecedor));

  const isValid =
    form.nome.trim() !== "" && form.contato.trim() !== "" && form.telefone.trim() !== "";

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      nome: form.nome.trim(),
      contato: form.contato.trim(),
      telefone: form.telefone.trim(),
      email: form.email.trim() || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do fornecedor para {fornecedor ? "atualizar" : "cadastrar"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Tecfil Distribuidora"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contato">Contato</Label>
            <Input
              id="contato"
              value={form.contato}
              onChange={(e) => setForm({ ...form, contato: e.target.value })}
              placeholder="Marcos Andrade"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="(11) 4002-1234"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vendas@fornecedor.com.br"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {fornecedor ? "Salvar alterações" : "Cadastrar fornecedor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
