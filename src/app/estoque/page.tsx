"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/context/store-context";
import { PecaTable } from "@/components/peca-table";
import { PecaFormDialog } from "@/components/peca-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Categoria, Peca } from "@/lib/types";
import { Plus, Search } from "lucide-react";

const categorias: Categoria[] = [
  "Filtros",
  "Freios",
  "Suspensão",
  "Elétrica",
  "Motor",
  "Óleos e Fluidos",
  "Arrefecimento",
  "Transmissão",
];

export default function EstoquePage() {
  const { pecas, addPeca, updatePeca, deletePeca } = useStore();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null);
  const [deletingPeca, setDeletingPeca] = useState<Peca | null>(null);

  const pecasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return pecas.filter((p) => {
      const matchTermo =
        termo === "" ||
        p.nome.toLowerCase().includes(termo) ||
        p.sku.toLowerCase().includes(termo);
      const matchCategoria = categoria === "todas" || p.categoria === categoria;
      return matchTermo && matchCategoria;
    });
  }, [pecas, busca, categoria]);

  function handleNovaPeca() {
    setEditingPeca(null);
    setDialogOpen(true);
  }

  function handleEditar(peca: Peca) {
    setEditingPeca(peca);
    setDialogOpen(true);
  }

  function handleSubmit(dados: Omit<Peca, "id">) {
    if (editingPeca) {
      updatePeca(editingPeca.id, dados);
      toast.success(`Peça "${dados.nome}" atualizada.`);
    } else {
      addPeca(dados);
      toast.success(`Peça "${dados.nome}" cadastrada.`);
    }
  }

  function handleConfirmDelete() {
    if (!deletingPeca) return;
    deletePeca(deletingPeca.id);
    toast.success(`Peça "${deletingPeca.nome}" removida.`);
    setDeletingPeca(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie as peças cadastradas na loja.
          </p>
        </div>
        <Button onClick={handleNovaPeca}>
          <Plus className="size-4" />
          Nova Peça
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou SKU..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={categoria} onValueChange={(v) => setCategoria(v ?? "todas")}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PecaTable pecas={pecasFiltradas} onEdit={handleEditar} onDelete={setDeletingPeca} />

      <PecaFormDialog
        key={dialogOpen ? editingPeca?.id ?? "nova" : "fechado"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        peca={editingPeca}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deletingPeca} onOpenChange={(open) => !open && setDeletingPeca(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir peça?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deletingPeca?.nome}&quot; do estoque?
              Essa ação não pode ser desfeita.
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
