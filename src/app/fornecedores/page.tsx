"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/context/store-context";
import { FornecedorTable } from "@/components/fornecedor-table";
import { FornecedorFormDialog } from "@/components/fornecedor-form-dialog";
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
import { Fornecedor } from "@/lib/types";
import { Plus, Search } from "lucide-react";

export default function FornecedoresPage() {
  const { fornecedores, addFornecedor, updateFornecedor, deleteFornecedor } = useStore();
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [deletingFornecedor, setDeletingFornecedor] = useState<Fornecedor | null>(null);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (termo === "") return fornecedores;
    return fornecedores.filter(
      (f) =>
        f.nome.toLowerCase().includes(termo) ||
        f.contato.toLowerCase().includes(termo)
    );
  }, [fornecedores, busca]);

  function handleNovoFornecedor() {
    setEditingFornecedor(null);
    setDialogOpen(true);
  }

  function handleEditar(fornecedor: Fornecedor) {
    setEditingFornecedor(fornecedor);
    setDialogOpen(true);
  }

  async function handleSubmit(dados: Omit<Fornecedor, "id">) {
    const resultado = editingFornecedor
      ? await updateFornecedor(editingFornecedor.id, dados)
      : await addFornecedor(dados);
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return;
    }
    toast.success(
      editingFornecedor
        ? `Fornecedor "${dados.nome}" atualizado.`
        : `Fornecedor "${dados.nome}" cadastrado.`
    );
  }

  async function handleConfirmDelete() {
    if (!deletingFornecedor) return;
    const resultado = await deleteFornecedor(deletingFornecedor.id);
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return;
    }
    toast.success(`Fornecedor "${deletingFornecedor.nome}" removido.`);
    setDeletingFornecedor(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Fornecedores
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os fornecedores das peças da loja.
          </p>
        </div>
        <Button onClick={handleNovoFornecedor}>
          <Plus className="size-4" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="relative sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou contato..."
          className="pl-8"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <FornecedorTable
        fornecedores={fornecedoresFiltrados}
        onEdit={handleEditar}
        onDelete={setDeletingFornecedor}
      />

      <FornecedorFormDialog
        key={dialogOpen ? editingFornecedor?.id ?? "novo" : "fechado"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fornecedor={editingFornecedor}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!deletingFornecedor}
        onOpenChange={(open) => !open && setDeletingFornecedor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deletingFornecedor?.nome}&quot; dos
              fornecedores? Essa ação não pode ser desfeita.
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
