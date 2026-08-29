// Categorias agora são carregadas dinamicamente da tabela `categorias` no
// Supabase (13 categorias reais, inferidas dos dados importados), em vez de
// um enum fixo. Ver useStore().categorias.
export type Categoria = string;

export interface Fornecedor {
  id: string;
  nome: string;
  contato: string;
  telefone: string;
  email?: string;
}

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
  fornecedorId?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  documento?: string;
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
  clienteId?: string;
}
