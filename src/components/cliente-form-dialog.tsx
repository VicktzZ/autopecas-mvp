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
import { Cliente } from "@/lib/types";

const emptyForm = {
  nome: "",
  telefone: "",
  email: "",
  documento: "",
};

interface ClienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onSubmit: (cliente: Omit<Cliente, "id">) => void;
}

function formFromCliente(cliente: Cliente | null) {
  if (!cliente) return emptyForm;
  return {
    nome: cliente.nome,
    telefone: cliente.telefone,
    email: cliente.email ?? "",
    documento: cliente.documento ?? "",
  };
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  cliente,
  onSubmit,
}: ClienteFormDialogProps) {
  const [form, setForm] = useState(() => formFromCliente(cliente));

  const isValid = form.nome.trim() !== "" && form.telefone.trim() !== "";

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      nome: form.nome.trim(),
      telefone: form.telefone.trim(),
      email: form.email.trim() || undefined,
      documento: form.documento.trim() || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente para {cliente ? "atualizar" : "cadastrar"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="João Silva"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="(11) 98888-1234"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="cliente@email.com"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="documento">Documento (CPF/CNPJ)</Label>
            <Input
              id="documento"
              value={form.documento}
              onChange={(e) => setForm({ ...form, documento: e.target.value })}
              placeholder="123.456.789-00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {cliente ? "Salvar alterações" : "Cadastrar cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
