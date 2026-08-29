export type Categoria =
  | "Filtros"
  | "Freios"
  | "Suspensão"
  | "Elétrica"
  | "Motor"
  | "Óleos e Fluidos"
  | "Arrefecimento"
  | "Transmissão";

export interface Peca {
  id: string;
  sku: string;
  nome: string;
  categoria: Categoria;
  marca: string;
  precoCusto: number;
  precoVenda: number;
  quantidade: number;
  estoqueMinimo: number;
  localizacao: string;
}

export interface ItemVenda {
  pecaId: string;
  nomePeca: string;
  quantidade: number;
  precoUnitario: number;
}

export type FormaPagamento = "Dinheiro" | "Cartão" | "Pix";

export interface Venda {
  id: string;
  data: string;
  itens: ItemVenda[];
  total: number;
  formaPagamento: FormaPagamento;
}
