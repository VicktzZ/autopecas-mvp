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
import { Peca } from "@/lib/types";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

const ITENS_POR_PAGINA = 50;

export default function EstoquePage() {
  const { pecas, categorias, addPeca, updatePeca, deletePeca } = useStore();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [pagina, setPagina] = useState(1);
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

  const totalPaginas = Math.max(1, Math.ceil(pecasFiltradas.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const pecasPagina = pecasFiltradas.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  function handleBuscaChange(valor: string) {
    setBusca(valor);
    setPagina(1);
  }

  function handleCategoriaChange(valor: string) {
    setCategoria(valor);
    setPagina(1);
  }

  function handleNovaPeca() {
    setEditingPeca(null);
    setDialogOpen(true);
  }

  function handleEditar(peca: Peca) {
    setEditingPeca(peca);
    setDialogOpen(true);
  }

  async function handleSubmit(dados: Omit<Peca, "id">) {
    const resultado = editingPeca
      ? await updatePeca(editingPeca.id, dados)
      : await addPeca(dados);
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return;
    }
    toast.success(editingPeca ? `Peça "${dados.nome}" atualizada.` : `Peça "${dados.nome}" cadastrada.`);
  }

  async function handleConfirmDelete() {
    if (!deletingPeca) return;
    const resultado = await deletePeca(deletingPeca.id);
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return;
    }
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
            onChange={(e) => handleBuscaChange(e.target.value)}
          />
        </div>
        <Select value={categoria} onValueChange={(v) => handleCategoriaChange(v ?? "todas")}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.codigo} value={c.nome ?? c.codigo}>
                {c.nome ?? c.codigo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PecaTable pecas={pecasPagina} onEdit={handleEditar} onDelete={setDeletingPeca} />

      {pecasFiltradas.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {(paginaAtual - 1) * ITENS_POR_PAGINA + 1}–
            {Math.min(paginaAtual * ITENS_POR_PAGINA, pecasFiltradas.length)} de{" "}
            {pecasFiltradas.length} peças
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              Próxima
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

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
