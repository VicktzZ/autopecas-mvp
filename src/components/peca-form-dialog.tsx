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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/context/store-context";
import { Categoria, Peca } from "@/lib/types";

const emptyForm = {
  sku: "",
  nome: "",
  categoria: "" as Categoria,
  marca: "",
  precoCusto: "",
  precoVenda: "",
  quantidade: "",
  estoqueMinimo: "",
  localizacao: "",
  fornecedorId: "nenhum",
};

interface PecaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peca: Peca | null;
  onSubmit: (peca: Omit<Peca, "id">) => void;
}

function formFromPeca(peca: Peca | null) {
  if (!peca) return emptyForm;
  return {
    sku: peca.sku,
    nome: peca.nome,
    categoria: peca.categoria,
    marca: peca.marca,
    precoCusto: String(peca.precoCusto),
    precoVenda: String(peca.precoVenda),
    quantidade: String(peca.quantidade),
    estoqueMinimo: String(peca.estoqueMinimo),
    localizacao: peca.localizacao,
    fornecedorId: peca.fornecedorId ?? "nenhum",
  };
}

export function PecaFormDialog({ open, onOpenChange, peca, onSubmit }: PecaFormDialogProps) {
  const { fornecedores, categorias } = useStore();
  const [form, setForm] = useState(() => {
    const inicial = formFromPeca(peca);
    return inicial.categoria === "" && categorias.length > 0
      ? { ...inicial, categoria: categorias[0].nome ?? categorias[0].codigo }
      : inicial;
  });

  const isValid =
    form.sku.trim() !== "" &&
    form.nome.trim() !== "" &&
    form.categoria.trim() !== "" &&
    form.marca.trim() !== "" &&
    form.precoCusto !== "" &&
    form.precoVenda !== "" &&
    form.quantidade !== "" &&
    form.estoqueMinimo !== "";

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      sku: form.sku.trim(),
      nome: form.nome.trim(),
      categoria: form.categoria,
      marca: form.marca.trim(),
      precoCusto: Number(form.precoCusto),
      precoVenda: Number(form.precoVenda),
      quantidade: Number(form.quantidade),
      estoqueMinimo: Number(form.estoqueMinimo),
      localizacao: form.localizacao.trim(),
      fornecedorId: form.fornecedorId === "nenhum" ? undefined : form.fornecedorId,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{peca ? "Editar Peça" : "Nova Peça"}</DialogTitle>
          <DialogDescription>
            Preencha os dados da peça para {peca ? "atualizar" : "cadastrar"} no estoque.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="FLT-001"
              disabled={!!peca}
            />
            {peca && (
              <span className="text-xs text-muted-foreground">
                O código do produto não pode ser alterado depois de criado.
              </span>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(v) => setForm({ ...form, categoria: v as Categoria })}
            >
              <SelectTrigger id="categoria" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.codigo} value={c.nome ?? c.codigo}>
                    {c.nome ?? c.codigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 grid gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Filtro de Óleo"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              placeholder="Tecfil"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="localizacao">Localização</Label>
            <Input
              id="localizacao"
              value={form.localizacao}
              onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
              placeholder="A1-01"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="precoCusto">Preço de Custo (R$)</Label>
            <Input
              id="precoCusto"
              type="number"
              min="0"
              step="0.01"
              value={form.precoCusto}
              onChange={(e) => setForm({ ...form, precoCusto: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="precoVenda">Preço de Venda (R$)</Label>
            <Input
              id="precoVenda"
              type="number"
              min="0"
              step="0.01"
              value={form.precoVenda}
              onChange={(e) => setForm({ ...form, precoVenda: e.target.value })}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min="0"
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
            <Input
              id="estoqueMinimo"
              type="number"
              min="0"
              value={form.estoqueMinimo}
              onChange={(e) => setForm({ ...form, estoqueMinimo: e.target.value })}
            />
          </div>

          <div className="col-span-2 grid gap-1.5">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Select
              value={form.fornecedorId}
              onValueChange={(v) => setForm({ ...form, fornecedorId: v ?? "nenhum" })}
            >
              <SelectTrigger id="fornecedor" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Nenhum</SelectItem>
                {fornecedores.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {peca ? "Salvar alterações" : "Cadastrar peça"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
