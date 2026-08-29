-- ============================================================================
-- Schema: estoque de peças (autopeças)
-- Origem dos dados: BD_Proj_Integrador_5CD.xlsx, aba "CONSOLIDADO" (8.802 linhas)
--
-- Mapeamento planilha -> banco:
--   Col A (codigo produto)   -> produtos.codigo_produto  (PK, alfanumérico, case-sensitive)
--   Col B (GTIN/cod. barras) -> produtos.codigo_barras   ("SEM GTIN" normalizado para NULL)
--   Col C (descrição)        -> produtos.descricao
--   Col D (quantidade)       -> produtos.quantidade_estoque
--   Col E (NCM)               -> produtos.ncm             (sempre 8 dígitos)
--   Col F (letra A-N, sem M) -> produtos.categoria_codigo (FK -> categorias.codigo)
--
-- Observações importantes:
--   * A planilha NÃO possui preço de custo/venda, marca, estoque mínimo ou
--     localização física — campos presentes no mock atual do app (src/lib/types.ts).
--     Ficam como colunas nullable para serem preenchidas depois (ver seção final).
--   * codigo_barras NÃO é único na origem (existem variantes com sufixo, ex.:
--     "47076-M"/"47076-K", e códigos genuinamente repetidos) — por isso não tem
--     UNIQUE constraint.
--   * categorias.nome fica NULL: a planilha só traz o código de uma letra,
--     sem o nome do departamento/categoria. Preencher manualmente depois
--     (ver supabase/seed/categorias.csv).
-- ============================================================================

create extension if not exists pg_trgm;

-- ----------------------------------------------------------------------------
-- Função utilitária para manter updated_at em dia (padrão Supabase)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Tabela: categorias
-- Lookup do código de uma letra (col F) encontrado na planilha.
-- ----------------------------------------------------------------------------
create table public.categorias (
  codigo      char(1)      primary key,
  nome        text,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now(),

  constraint categorias_codigo_maiuscula check (codigo = upper(codigo))
);

comment on table public.categorias is
  'Departamentos/categorias de produto identificados pela letra da coluna F da planilha original. Nome ainda não mapeado na origem.';

create trigger categorias_set_updated_at
  before update on public.categorias
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Tabela: produtos
-- ----------------------------------------------------------------------------
create table public.produtos (
  codigo_produto      text          primary key,
  codigo_barras       text,
  descricao           text          not null,
  quantidade_estoque  integer       not null default 0,
  ncm                 char(8)       not null,
  categoria_codigo    char(1)       not null references public.categorias (codigo),

  -- Campos que NÃO existem na planilha de origem — mantidos nullable para
  -- preenchimento manual/futuro (preço, marca, localização, estoque mínimo):
  marca               text,
  preco_custo         numeric(12, 2),
  preco_venda         numeric(12, 2),
  estoque_minimo      integer,
  localizacao         text,

  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),

  constraint produtos_codigo_produto_nao_vazio check (length(trim(codigo_produto)) > 0),
  constraint produtos_quantidade_nao_negativa check (quantidade_estoque >= 0),
  constraint produtos_estoque_minimo_nao_negativo check (estoque_minimo is null or estoque_minimo >= 0),
  constraint produtos_ncm_formato check (ncm ~ '^[0-9]{8}$'),
  constraint produtos_preco_custo_nao_negativo check (preco_custo is null or preco_custo >= 0),
  constraint produtos_preco_venda_nao_negativo check (preco_venda is null or preco_venda >= 0)
);

comment on table public.produtos is
  'Peças/produtos do estoque da autopeças, importados de BD_Proj_Integrador_5CD.xlsx (aba CONSOLIDADO).';
comment on column public.produtos.codigo_produto is 'Código interno do produto (coluna A da planilha). Alfanumérico, case-sensitive, único.';
comment on column public.produtos.codigo_barras is 'GTIN/código de barras informado (coluna B). Não é único na origem; "SEM GTIN" foi normalizado para NULL.';
comment on column public.produtos.ncm is 'Nomenclatura Comum do Mercosul (classificação fiscal), sempre 8 dígitos.';
comment on column public.produtos.categoria_codigo is 'Letra do departamento/categoria (coluna F da planilha).';

create index produtos_categoria_codigo_idx on public.produtos (categoria_codigo);
create index produtos_codigo_barras_idx on public.produtos (codigo_barras);
create index produtos_ncm_idx on public.produtos (ncm);
-- Índice trigram para busca por nome (mesmo padrão de busca já usado na tela de Vendas/Estoque do app)
create index produtos_descricao_trgm_idx on public.produtos using gin (descricao gin_trgm_ops);

create trigger produtos_set_updated_at
  before update on public.produtos
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security (padrão Supabase: RLS habilitado por padrão)
-- Ajuste as policies de escrita conforme o modelo de autenticação do app.
-- ----------------------------------------------------------------------------
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;

create policy "categorias: leitura pública"
  on public.categorias for select
  to anon, authenticated
  using (true);

create policy "categorias: escrita autenticada"
  on public.categorias for all
  to authenticated
  using (true)
  with check (true);

create policy "produtos: leitura pública"
  on public.produtos for select
  to anon, authenticated
  using (true);

create policy "produtos: escrita autenticada"
  on public.produtos for all
  to authenticated
  using (true)
  with check (true);
