"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
  Cliente,
  FormaPagamento,
  Fornecedor,
  ItemVenda,
  Peca,
  Venda,
} from "@/lib/types";
import type {
  ClienteRow,
  FornecedorRow,
  ItemVendaRow,
  ProdutoRow,
  VendaRow,
} from "@/types/database";

type CategoriaOption = { codigo: string; nome: string | null };
type Resultado = { ok: true } | { ok: false; erro: string };

const PAGE_SIZE = 1000;

// A API do Supabase (PostgREST) limita a 1000 linhas por requisição, então os
// 8.802 produtos precisam ser buscados em páginas.
async function fetchAllProdutos(): Promise<ProdutoRow[]> {
  const primeira = await supabase
    .from("produtos")
    .select("*", { count: "exact" })
    .order("codigo_produto")
    .range(0, PAGE_SIZE - 1);

  if (primeira.error) throw primeira.error;

  const linhas = [...(primeira.data ?? [])];
  const total = primeira.count ?? linhas.length;

  if (total > PAGE_SIZE) {
    const ranges: [number, number][] = [];
    for (let inicio = PAGE_SIZE; inicio < total; inicio += PAGE_SIZE) {
      ranges.push([inicio, Math.min(inicio + PAGE_SIZE, total) - 1]);
    }
    const paginas = await Promise.all(
      ranges.map(([de, ate]) =>
        supabase.from("produtos").select("*").order("codigo_produto").range(de, ate)
      )
    );
    for (const pagina of paginas) {
      if (pagina.error) throw pagina.error;
      linhas.push(...(pagina.data ?? []));
    }
  }

  return linhas;
}

function produtoRowToPeca(row: ProdutoRow, nomeByCodigo: Map<string, string>): Peca {
  return {
    id: row.codigo_produto,
    sku: row.codigo_produto,
    nome: row.descricao,
    categoria: nomeByCodigo.get(row.categoria_codigo) ?? row.categoria_codigo,
    marca: row.marca ?? "",
    precoCusto: row.preco_custo ?? 0,
    precoVenda: row.preco_venda ?? 0,
    quantidade: row.quantidade_estoque,
    estoqueMinimo: row.estoque_minimo ?? 0,
    localizacao: row.localizacao ?? "",
    fornecedorId: row.fornecedor_id ?? undefined,
  };
}

function fornecedorRowToFornecedor(row: FornecedorRow): Fornecedor {
  return {
    id: row.id,
    nome: row.nome,
    contato: row.contato,
    telefone: row.telefone,
    email: row.email ?? undefined,
  };
}

function clienteRowToCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    email: row.email ?? undefined,
    documento: row.documento ?? undefined,
  };
}

function vendaRowToVenda(row: VendaRow & { itens_venda: ItemVendaRow[] }): Venda {
  return {
    id: row.id,
    data: row.data,
    itens: row.itens_venda.map((i) => ({
      pecaId: i.produto_codigo,
      nomePeca: i.nome_peca,
      quantidade: i.quantidade,
      precoUnitario: i.preco_unitario,
    })),
    total: row.total,
    formaPagamento: row.forma_pagamento as FormaPagamento,
    clienteId: row.cliente_id ?? undefined,
  };
}

interface StoreContextValue {
  pecas: Peca[];
  vendas: Venda[];
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  categorias: CategoriaOption[];
  carregando: boolean;
  addPeca: (peca: Omit<Peca, "id">) => Promise<Resultado>;
  updatePeca: (id: string, peca: Omit<Peca, "id">) => Promise<Resultado>;
  deletePeca: (id: string) => Promise<Resultado>;
  addCliente: (cliente: Omit<Cliente, "id">) => Promise<Resultado>;
  updateCliente: (id: string, cliente: Omit<Cliente, "id">) => Promise<Resultado>;
  deleteCliente: (id: string) => Promise<Resultado>;
  addFornecedor: (fornecedor: Omit<Fornecedor, "id">) => Promise<Resultado>;
  updateFornecedor: (id: string, fornecedor: Omit<Fornecedor, "id">) => Promise<Resultado>;
  deleteFornecedor: (id: string) => Promise<Resultado>;
  registrarVenda: (
    itens: ItemVenda[],
    formaPagamento: FormaPagamento,
    clienteId?: string
  ) => Promise<{ ok: true; venda: Venda } | { ok: false; erro: string }>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [carregando, setCarregando] = useState(true);

  const nomeByCodigo = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categorias) map.set(c.codigo, c.nome ?? c.codigo);
    return map;
  }, [categorias]);

  const codigoByNome = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categorias) map.set(c.nome ?? c.codigo, c.codigo);
    return map;
  }, [categorias]);

  // Ref para os handlers de realtime sempre lerem o mapa mais recente sem
  // precisar recriar a subscription (que só roda uma vez).
  const nomeByCodigoRef = useRef(nomeByCodigo);
  useEffect(() => {
    nomeByCodigoRef.current = nomeByCodigo;
  }, [nomeByCodigo]);

  useEffect(() => {
    let cancelado = false;

    async function carregarTudo() {
      try {
        const [categoriasRes, fornecedoresRes, clientesRes, vendasRes, produtosRows] =
          await Promise.all([
            supabase.from("categorias").select("*").order("codigo"),
            supabase.from("fornecedores").select("*").order("nome"),
            supabase.from("clientes").select("*").order("nome"),
            supabase
              .from("vendas")
              .select("*, itens_venda(*)")
              .order("data", { ascending: false }),
            fetchAllProdutos(),
          ]);

        if (cancelado) return;

        if (categoriasRes.error) throw categoriasRes.error;
        if (fornecedoresRes.error) throw fornecedoresRes.error;
        if (clientesRes.error) throw clientesRes.error;
        if (vendasRes.error) throw vendasRes.error;

        const categoriasCarregadas: CategoriaOption[] = (categoriasRes.data ?? []).map((c) => ({
          codigo: c.codigo,
          nome: c.nome,
        }));
        const nomeMap = new Map<string, string>();
        for (const c of categoriasCarregadas) nomeMap.set(c.codigo, c.nome ?? c.codigo);

        setCategorias(categoriasCarregadas);
        setFornecedores((fornecedoresRes.data ?? []).map(fornecedorRowToFornecedor));
        setClientes((clientesRes.data ?? []).map(clienteRowToCliente));
        setVendas(
          ((vendasRes.data ?? []) as (VendaRow & { itens_venda: ItemVendaRow[] })[]).map(
            vendaRowToVenda
          )
        );
        setPecas(produtosRows.map((p) => produtoRowToPeca(p, nomeMap)));
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
        toast.error("Não foi possível carregar os dados do banco.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregarTudo();
    return () => {
      cancelado = true;
    };
  }, []);

  // Assinatura Supabase Realtime: mantém o estado sincronizado com qualquer
  // mudança no banco (feita por esta aba, outra aba, ou outro usuário).
  useEffect(() => {
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "produtos" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const antiga = payload.old as { codigo_produto?: string };
            if (!antiga.codigo_produto) return;
            setPecas((prev) => prev.filter((p) => p.id !== antiga.codigo_produto));
            return;
          }
          const peca = produtoRowToPeca(payload.new as ProdutoRow, nomeByCodigoRef.current);
          setPecas((prev) => {
            const idx = prev.findIndex((p) => p.id === peca.id);
            if (idx === -1) return [...prev, peca];
            const next = [...prev];
            next[idx] = peca;
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categorias" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const antiga = payload.old as { codigo?: string };
            setCategorias((prev) => prev.filter((c) => c.codigo !== antiga.codigo));
            return;
          }
          const row = payload.new as { codigo: string; nome: string | null };
          setCategorias((prev) => {
            const idx = prev.findIndex((c) => c.codigo === row.codigo);
            if (idx === -1) return [...prev, { codigo: row.codigo, nome: row.nome }];
            const next = [...prev];
            next[idx] = { codigo: row.codigo, nome: row.nome };
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fornecedores" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const antiga = payload.old as { id?: string };
            setFornecedores((prev) => prev.filter((f) => f.id !== antiga.id));
            return;
          }
          const fornecedor = fornecedorRowToFornecedor(payload.new as FornecedorRow);
          setFornecedores((prev) => {
            const idx = prev.findIndex((f) => f.id === fornecedor.id);
            if (idx === -1) return [...prev, fornecedor];
            const next = [...prev];
            next[idx] = fornecedor;
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clientes" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const antiga = payload.old as { id?: string };
            setClientes((prev) => prev.filter((c) => c.id !== antiga.id));
            return;
          }
          const cliente = clienteRowToCliente(payload.new as ClienteRow);
          setClientes((prev) => {
            const idx = prev.findIndex((c) => c.id === cliente.id);
            if (idx === -1) return [...prev, cliente];
            const next = [...prev];
            next[idx] = cliente;
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vendas" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            const antiga = payload.old as { id?: string };
            setVendas((prev) => prev.filter((v) => v.id !== antiga.id));
            return;
          }
          const row = payload.new as VendaRow;
          const { data: itens, error } = await supabase
            .from("itens_venda")
            .select("*")
            .eq("venda_id", row.id);
          if (error) return;
          const venda = vendaRowToVenda({ ...row, itens_venda: itens ?? [] });
          setVendas((prev) => {
            const idx = prev.findIndex((v) => v.id === venda.id);
            if (idx === -1) return [venda, ...prev];
            const next = [...prev];
            next[idx] = venda;
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addPeca = useCallback(
    async (peca: Omit<Peca, "id">): Promise<Resultado> => {
      const categoria_codigo = codigoByNome.get(peca.categoria) ?? peca.categoria;
      const { error } = await supabase.from("produtos").insert({
        codigo_produto: peca.sku.trim(),
        descricao: peca.nome,
        categoria_codigo,
        marca: peca.marca || null,
        preco_custo: peca.precoCusto,
        preco_venda: peca.precoVenda,
        quantidade_estoque: peca.quantidade,
        estoque_minimo: peca.estoqueMinimo,
        localizacao: peca.localizacao || null,
        fornecedor_id: peca.fornecedorId || null,
      });
      if (error) {
        if (error.code === "23505") {
          return { ok: false, erro: `Já existe uma peça com o código "${peca.sku}".` };
        }
        return { ok: false, erro: error.message };
      }
      return { ok: true };
    },
    [codigoByNome]
  );

  const updatePeca = useCallback(
    async (id: string, peca: Omit<Peca, "id">): Promise<Resultado> => {
      const categoria_codigo = codigoByNome.get(peca.categoria) ?? peca.categoria;
      const { error } = await supabase
        .from("produtos")
        .update({
          descricao: peca.nome,
          categoria_codigo,
          marca: peca.marca || null,
          preco_custo: peca.precoCusto,
          preco_venda: peca.precoVenda,
          quantidade_estoque: peca.quantidade,
          estoque_minimo: peca.estoqueMinimo,
          localizacao: peca.localizacao || null,
          fornecedor_id: peca.fornecedorId || null,
        })
        .eq("codigo_produto", id);
      if (error) return { ok: false, erro: error.message };
      return { ok: true };
    },
    [codigoByNome]
  );

  const deletePeca = useCallback(async (id: string): Promise<Resultado> => {
    const { error } = await supabase.from("produtos").delete().eq("codigo_produto", id);
    if (error) {
      if (error.code === "23503") {
        return {
          ok: false,
          erro: "Essa peça já foi usada em vendas e não pode ser excluída.",
        };
      }
      return { ok: false, erro: error.message };
    }
    return { ok: true };
  }, []);

  const addCliente = useCallback(async (cliente: Omit<Cliente, "id">): Promise<Resultado> => {
    const { error } = await supabase.from("clientes").insert({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email || null,
      documento: cliente.documento || null,
    });
    if (error) return { ok: false, erro: error.message };
    return { ok: true };
  }, []);

  const updateCliente = useCallback(
    async (id: string, cliente: Omit<Cliente, "id">): Promise<Resultado> => {
      const { error } = await supabase
        .from("clientes")
        .update({
          nome: cliente.nome,
          telefone: cliente.telefone,
          email: cliente.email || null,
          documento: cliente.documento || null,
        })
        .eq("id", id);
      if (error) return { ok: false, erro: error.message };
      return { ok: true };
    },
    []
  );

  const deleteCliente = useCallback(async (id: string): Promise<Resultado> => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) return { ok: false, erro: error.message };
    return { ok: true };
  }, []);

  const addFornecedor = useCallback(
    async (fornecedor: Omit<Fornecedor, "id">): Promise<Resultado> => {
      const { error } = await supabase.from("fornecedores").insert({
        nome: fornecedor.nome,
        contato: fornecedor.contato,
        telefone: fornecedor.telefone,
        email: fornecedor.email || null,
      });
      if (error) return { ok: false, erro: error.message };
      return { ok: true };
    },
    []
  );

  const updateFornecedor = useCallback(
    async (id: string, fornecedor: Omit<Fornecedor, "id">): Promise<Resultado> => {
      const { error } = await supabase
        .from("fornecedores")
        .update({
          nome: fornecedor.nome,
          contato: fornecedor.contato,
          telefone: fornecedor.telefone,
          email: fornecedor.email || null,
        })
        .eq("id", id);
      if (error) return { ok: false, erro: error.message };
      return { ok: true };
    },
    []
  );

  const deleteFornecedor = useCallback(async (id: string): Promise<Resultado> => {
    const { error } = await supabase.from("fornecedores").delete().eq("id", id);
    if (error) return { ok: false, erro: error.message };
    return { ok: true };
  }, []);

  const registrarVenda = useCallback(
    async (itens: ItemVenda[], formaPagamento: FormaPagamento, clienteId?: string) => {
      if (itens.length === 0) {
        return { ok: false as const, erro: "Adicione ao menos um item à venda." };
      }

      const { data, error } = await supabase.rpc("registrar_venda", {
        p_itens: itens.map((i) => ({
          produtoCodigo: i.pecaId,
          nomePeca: i.nomePeca,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
        })),
        p_forma_pagamento: formaPagamento,
        p_cliente_id: clienteId ?? null,
      });

      if (error) {
        return { ok: false as const, erro: error.message };
      }

      const vendaRow = data as VendaRow;
      const venda: Venda = {
        id: vendaRow.id,
        data: vendaRow.data,
        itens,
        total: vendaRow.total,
        formaPagamento,
        clienteId: vendaRow.cliente_id ?? undefined,
      };

      return { ok: true as const, venda };
    },
    []
  );

  const value = useMemo(
    () => ({
      pecas,
      vendas,
      clientes,
      fornecedores,
      categorias,
      carregando,
      addPeca,
      updatePeca,
      deletePeca,
      addCliente,
      updateCliente,
      deleteCliente,
      addFornecedor,
      updateFornecedor,
      deleteFornecedor,
      registrarVenda,
    }),
    [
      pecas,
      vendas,
      clientes,
      fornecedores,
      categorias,
      carregando,
      addPeca,
      updatePeca,
      deletePeca,
      addCliente,
      updateCliente,
      deleteCliente,
      addFornecedor,
      updateFornecedor,
      deleteFornecedor,
      registrarVenda,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
