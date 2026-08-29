"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { initialPecas, initialVendas } from "@/lib/mock-data";
import { FormaPagamento, ItemVenda, Peca, Venda } from "@/lib/types";

interface StoreContextValue {
  pecas: Peca[];
  vendas: Venda[];
  addPeca: (peca: Omit<Peca, "id">) => void;
  updatePeca: (id: string, peca: Omit<Peca, "id">) => void;
  deletePeca: (id: string) => void;
  registrarVenda: (
    itens: ItemVenda[],
    formaPagamento: FormaPagamento
  ) => { ok: true } | { ok: false; erro: string };
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [pecas, setPecas] = useState<Peca[]>(initialPecas);
  const [vendas, setVendas] = useState<Venda[]>(initialVendas);

  const addPeca = useCallback((peca: Omit<Peca, "id">) => {
    setPecas((prev) => [...prev, { ...peca, id: crypto.randomUUID() }]);
  }, []);

  const updatePeca = useCallback((id: string, peca: Omit<Peca, "id">) => {
    setPecas((prev) => prev.map((p) => (p.id === id ? { ...peca, id } : p)));
  }, []);

  const deletePeca = useCallback((id: string) => {
    setPecas((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const registrarVenda = useCallback(
    (itens: ItemVenda[], formaPagamento: FormaPagamento) => {
      if (itens.length === 0) {
        return { ok: false as const, erro: "Adicione ao menos um item à venda." };
      }

      for (const item of itens) {
        const peca = pecas.find((p) => p.id === item.pecaId);
        if (!peca) {
          return { ok: false as const, erro: `Peça não encontrada: ${item.nomePeca}` };
        }
        if (item.quantidade > peca.quantidade) {
          return {
            ok: false as const,
            erro: `Estoque insuficiente para ${peca.nome} (disponível: ${peca.quantidade}).`,
          };
        }
      }

      setPecas((prev) =>
        prev.map((p) => {
          const item = itens.find((i) => i.pecaId === p.id);
          return item ? { ...p, quantidade: p.quantidade - item.quantidade } : p;
        })
      );

      const total = itens.reduce((sum, i) => sum + i.quantidade * i.precoUnitario, 0);
      const venda: Venda = {
        id: crypto.randomUUID(),
        data: new Date().toISOString(),
        itens,
        total,
        formaPagamento,
      };
      setVendas((prev) => [venda, ...prev]);

      return { ok: true as const };
    },
    [pecas]
  );

  const value = useMemo(
    () => ({ pecas, vendas, addPeca, updatePeca, deletePeca, registrarVenda }),
    [pecas, vendas, addPeca, updatePeca, deletePeca, registrarVenda]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
