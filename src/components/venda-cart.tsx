"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/context/store-context";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { FormaPagamento, ItemVenda } from "@/lib/types";
import { Search, Trash2 } from "lucide-react";

const formasPagamento: FormaPagamento[] = ["Dinheiro", "Cartão", "Pix"];

export function VendaCart() {
  const { pecas, registrarVenda } = useStore();
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("Dinheiro");

  const resultados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (termo === "") return [];
    return pecas
      .filter(
        (p) =>
          p.quantidade > 0 &&
          (p.nome.toLowerCase().includes(termo) || p.sku.toLowerCase().includes(termo))
      )
      .slice(0, 6);
  }, [pecas, busca]);

  const total = carrinho.reduce((sum, i) => sum + i.quantidade * i.precoUnitario, 0);

  function handleAdicionar(pecaId: string) {
    const peca = pecas.find((p) => p.id === pecaId);
    if (!peca) return;

    setCarrinho((prev) => {
      const existente = prev.find((i) => i.pecaId === pecaId);
      if (existente) {
        if (existente.quantidade >= peca.quantidade) {
          toast.error(`Estoque máximo atingido para ${peca.nome}.`);
          return prev;
        }
        return prev.map((i) =>
          i.pecaId === pecaId ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [
        ...prev,
        {
          pecaId: peca.id,
          nomePeca: peca.nome,
          quantidade: 1,
          precoUnitario: peca.precoVenda,
        },
      ];
    });
    setBusca("");
  }

  function handleQuantidadeChange(pecaId: string, quantidade: number) {
    const peca = pecas.find((p) => p.id === pecaId);
    if (!peca) return;
    if (quantidade < 1) return;
    if (quantidade > peca.quantidade) {
      toast.error(`Disponível: ${peca.quantidade} unidade(s) de ${peca.nome}.`);
      return;
    }
    setCarrinho((prev) =>
      prev.map((i) => (i.pecaId === pecaId ? { ...i, quantidade } : i))
    );
  }

  function handleRemover(pecaId: string) {
    setCarrinho((prev) => prev.filter((i) => i.pecaId !== pecaId));
  }

  function handleFinalizar() {
    const resultado = registrarVenda(carrinho, formaPagamento);
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return;
    }
    toast.success(`Venda finalizada: ${formatCurrency(total)}`);
    setCarrinho([]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Selecionar Peças</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar peça por nome ou SKU..."
              className="pl-8"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {resultados.length > 0 && (
            <div className="rounded-md border divide-y">
              {resultados.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAdicionar(p.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                >
                  <span>
                    <span className="font-medium">{p.nome}</span>{" "}
                    <span className="text-muted-foreground">({p.sku})</span>
                  </span>
                  <span className="flex items-center gap-3 text-muted-foreground">
                    <span>{p.quantidade} disp.</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(p.precoVenda)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <Separator />

          {carrinho.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhum item adicionado à venda ainda.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Peça</TableHead>
                    <TableHead className="w-28 text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carrinho.map((item) => (
                    <TableRow key={item.pecaId}>
                      <TableCell className="font-medium">{item.nomePeca}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantidade}
                          onChange={(e) =>
                            handleQuantidadeChange(item.pecaId, Number(e.target.value))
                          }
                          className="w-20 ml-auto text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.precoUnitario)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.quantidade * item.precoUnitario)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemover(item.pecaId)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo da Venda</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Forma de Pagamento</span>
            <Select
              value={formaPagamento}
              onValueChange={(v) => setFormaPagamento(v as FormaPagamento)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={carrinho.length === 0}
            onClick={handleFinalizar}
          >
            Finalizar Venda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
