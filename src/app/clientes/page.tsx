"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/context/store-context";
import { ClienteTable } from "@/components/cliente-table";
import { ClienteFormDialog } from "@/components/cliente-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Cliente } from "@/lib/types";
import { Plus, Search } from "lucide-react";

export default function ClientesPage() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useStore();
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (termo === "") return clientes;
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) || c.telefone.toLowerCase().includes(termo)
    );
  }, [clientes, busca]);

  function handleNovoCliente() {
    setEditingCliente(null);
    setDialogOpen(true);
  }

  function handleEditar(cliente: Cliente) {
    setEditingCliente(cliente);
    setDialogOpen(true);
  }

  async function handleSubmit(dados: Omit<Cliente, "id">) {
    const resultado = editingCliente
      ? await updateCliente(editingCliente.id, dados)
      : await addCliente(dados);
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return;
    }
    toast.success(
      editingCliente ? `Cliente "${dados.nome}" atualizado.` : `Cliente "${dados.nome}" cadastrado.`
    );
  }

  async function handleConfirmDelete() {
    if (!deletingCliente) return;
    const resultado = await deleteCliente(deletingCliente.id);
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return;
    }
    toast.success(`Cliente "${deletingCliente.nome}" removido.`);
    setDeletingCliente(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os clientes cadastrados na loja.
          </p>
        </div>
        <Button onClick={handleNovoCliente}>
          <Plus className="size-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          className="pl-8"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <ClienteTable
        clientes={clientesFiltrados}
        onEdit={handleEditar}
        onDelete={setDeletingCliente}
      />

      <ClienteFormDialog
        key={dialogOpen ? editingCliente?.id ?? "novo" : "fechado"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cliente={editingCliente}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!deletingCliente}
        onOpenChange={(open) => !open && setDeletingCliente(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deletingCliente?.nome}&quot; dos
              clientes? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
