/**
 * Tipos gerados manualmente a partir de supabase/migrations/*.sql.
 * Ao rodar `supabase gen types typescript` no projeto real, este arquivo pode ser substituído
 * pela saída oficial do CLI — a forma (Database -> public -> Tables) é a mesma.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          codigo: string;
          nome: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          codigo: string;
          nome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          codigo?: string;
          nome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      produtos: {
        Row: {
          codigo_produto: string;
          codigo_barras: string | null;
          descricao: string;
          quantidade_estoque: number;
          ncm: string | null;
          categoria_codigo: string;
          marca: string | null;
          preco_custo: number | null;
          preco_venda: number | null;
          estoque_minimo: number | null;
          localizacao: string | null;
          fornecedor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          codigo_produto: string;
          codigo_barras?: string | null;
          descricao: string;
          quantidade_estoque?: number;
          ncm?: string | null;
          categoria_codigo: string;
          marca?: string | null;
          preco_custo?: number | null;
          preco_venda?: number | null;
          estoque_minimo?: number | null;
          localizacao?: string | null;
          fornecedor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          codigo_produto?: string;
          codigo_barras?: string | null;
          descricao?: string;
          quantidade_estoque?: number;
          ncm?: string | null;
          categoria_codigo?: string;
          marca?: string | null;
          preco_custo?: number | null;
          preco_venda?: number | null;
          estoque_minimo?: number | null;
          localizacao?: string | null;
          fornecedor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_codigo_fkey";
            columns: ["categoria_codigo"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["codigo"];
          },
          {
            foreignKeyName: "produtos_fornecedor_id_fkey";
            columns: ["fornecedor_id"];
            isOneToOne: false;
            referencedRelation: "fornecedores";
            referencedColumns: ["id"];
          },
        ];
      };
      fornecedores: {
        Row: {
          id: string;
          nome: string;
          contato: string;
          telefone: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          contato: string;
          telefone: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          contato?: string;
          telefone?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clientes: {
        Row: {
          id: string;
          nome: string;
          telefone: string;
          email: string | null;
          documento: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          telefone: string;
          email?: string | null;
          documento?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string;
          email?: string | null;
          documento?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vendas: {
        Row: {
          id: string;
          data: string;
          forma_pagamento: string;
          total: number;
          cliente_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          data?: string;
          forma_pagamento: string;
          total: number;
          cliente_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          data?: string;
          forma_pagamento?: string;
          total?: number;
          cliente_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
        ];
      };
      itens_venda: {
        Row: {
          id: string;
          venda_id: string;
          produto_codigo: string;
          nome_peca: string;
          quantidade: number;
          preco_unitario: number;
        };
        Insert: {
          id?: string;
          venda_id: string;
          produto_codigo: string;
          nome_peca: string;
          quantidade: number;
          preco_unitario: number;
        };
        Update: {
          id?: string;
          venda_id?: string;
          produto_codigo?: string;
          nome_peca?: string;
          quantidade?: number;
          preco_unitario?: number;
        };
        Relationships: [
          {
            foreignKeyName: "itens_venda_venda_id_fkey";
            columns: ["venda_id"];
            isOneToOne: false;
            referencedRelation: "vendas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "itens_venda_produto_codigo_fkey";
            columns: ["produto_codigo"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["codigo_produto"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      registrar_venda: {
        Args: {
          p_itens: Json;
          p_forma_pagamento: string;
          p_cliente_id?: string | null;
        };
        Returns: Database["public"]["Tables"]["vendas"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
export type CategoriaInsert = Database["public"]["Tables"]["categorias"]["Insert"];
export type CategoriaUpdate = Database["public"]["Tables"]["categorias"]["Update"];

export type ProdutoRow = Database["public"]["Tables"]["produtos"]["Row"];
export type ProdutoInsert = Database["public"]["Tables"]["produtos"]["Insert"];
export type ProdutoUpdate = Database["public"]["Tables"]["produtos"]["Update"];

export type FornecedorRow = Database["public"]["Tables"]["fornecedores"]["Row"];
export type FornecedorInsert = Database["public"]["Tables"]["fornecedores"]["Insert"];
export type FornecedorUpdate = Database["public"]["Tables"]["fornecedores"]["Update"];

export type ClienteRow = Database["public"]["Tables"]["clientes"]["Row"];
export type ClienteInsert = Database["public"]["Tables"]["clientes"]["Insert"];
export type ClienteUpdate = Database["public"]["Tables"]["clientes"]["Update"];

export type VendaRow = Database["public"]["Tables"]["vendas"]["Row"];
export type VendaInsert = Database["public"]["Tables"]["vendas"]["Insert"];

export type ItemVendaRow = Database["public"]["Tables"]["itens_venda"]["Row"];
export type ItemVendaInsert = Database["public"]["Tables"]["itens_venda"]["Insert"];
