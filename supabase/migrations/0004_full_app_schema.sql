-- ============================================================================
-- Extensão do schema para cobrir toda a aplicação (Estoque, Vendas, Clientes,
-- Fornecedores) e habilitar Realtime.
--
-- Decisão importante: o app NÃO tem autenticação (sem login). Para o MVP
-- funcionar de ponta a ponta com a chave anônima, as policies de escrita
-- foram abertas para o papel `anon` também (além de `authenticated`). Antes
-- de expor isso para usuários não confiáveis, implemente Supabase Auth e
-- restrinja essas policies.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- produtos: ncm passa a ser opcional (produtos cadastrados pela UI não
-- coletam NCM) e ganha vínculo com fornecedor.
-- ----------------------------------------------------------------------------
alter table public.produtos
  alter column ncm drop not null;

alter table public.produtos
  drop constraint produtos_ncm_formato;

alter table public.produtos
  add constraint produtos_ncm_formato check (ncm is null or ncm ~ '^[0-9]{8}$');

alter table public.produtos
  add column fornecedor_id uuid;

-- ----------------------------------------------------------------------------
-- fornecedores
-- ----------------------------------------------------------------------------
create table public.fornecedores (
  id          uuid          primary key default gen_random_uuid(),
  nome        text          not null,
  contato     text          not null,
  telefone    text          not null,
  email       text,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

create trigger fornecedores_set_updated_at
  before update on public.fornecedores
  for each row
  execute function public.set_updated_at();

alter table public.produtos
  add constraint produtos_fornecedor_id_fkey
  foreign key (fornecedor_id) references public.fornecedores (id) on delete set null;

create index produtos_fornecedor_id_idx on public.produtos (fornecedor_id);

-- ----------------------------------------------------------------------------
-- clientes
-- ----------------------------------------------------------------------------
create table public.clientes (
  id          uuid          primary key default gen_random_uuid(),
  nome        text          not null,
  telefone    text          not null,
  email       text,
  documento   text,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

create trigger clientes_set_updated_at
  before update on public.clientes
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- vendas / itens_venda
-- ----------------------------------------------------------------------------
create table public.vendas (
  id                uuid          primary key default gen_random_uuid(),
  data              timestamptz   not null default now(),
  forma_pagamento   text          not null check (forma_pagamento in ('Dinheiro', 'Cartão', 'Pix')),
  total             numeric(12, 2) not null check (total >= 0),
  cliente_id        uuid          references public.clientes (id) on delete set null,
  created_at        timestamptz   not null default now()
);

create index vendas_data_idx on public.vendas (data desc);
create index vendas_cliente_id_idx on public.vendas (cliente_id);

create table public.itens_venda (
  id                uuid          primary key default gen_random_uuid(),
  venda_id          uuid          not null references public.vendas (id) on delete cascade,
  produto_codigo    text          not null references public.produtos (codigo_produto),
  nome_peca         text          not null,
  quantidade        integer       not null check (quantidade > 0),
  preco_unitario    numeric(12, 2) not null check (preco_unitario >= 0)
);

create index itens_venda_venda_id_idx on public.itens_venda (venda_id);
create index itens_venda_produto_codigo_idx on public.itens_venda (produto_codigo);

-- ----------------------------------------------------------------------------
-- RLS: habilitar + abrir leitura e escrita para anon (sem auth no app ainda)
-- ----------------------------------------------------------------------------
alter table public.fornecedores enable row level security;
alter table public.clientes enable row level security;
alter table public.vendas enable row level security;
alter table public.itens_venda enable row level security;

create policy "fornecedores: leitura e escrita (sem auth)"
  on public.fornecedores for all
  to anon, authenticated
  using (true) with check (true);

create policy "clientes: leitura e escrita (sem auth)"
  on public.clientes for all
  to anon, authenticated
  using (true) with check (true);

create policy "vendas: leitura e escrita (sem auth)"
  on public.vendas for all
  to anon, authenticated
  using (true) with check (true);

create policy "itens_venda: leitura e escrita (sem auth)"
  on public.itens_venda for all
  to anon, authenticated
  using (true) with check (true);

-- Amplia as policies de produtos/categorias (criadas na migration 0001,
-- restritas a `authenticated`) para também aceitar `anon`.
drop policy "categorias: escrita autenticada" on public.categorias;
create policy "categorias: leitura e escrita (sem auth)"
  on public.categorias for all
  to anon, authenticated
  using (true) with check (true);

drop policy "categorias: leitura pública" on public.categorias;

drop policy "produtos: escrita autenticada" on public.produtos;
create policy "produtos: leitura e escrita (sem auth)"
  on public.produtos for all
  to anon, authenticated
  using (true) with check (true);

drop policy "produtos: leitura pública" on public.produtos;

-- ----------------------------------------------------------------------------
-- Realtime: publica as tabelas para o canal padrão do Supabase Realtime
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.produtos;
alter publication supabase_realtime add table public.categorias;
alter publication supabase_realtime add table public.fornecedores;
alter publication supabase_realtime add table public.clientes;
alter publication supabase_realtime add table public.vendas;
alter publication supabase_realtime add table public.itens_venda;

-- REPLICA IDENTITY FULL garante que eventos de UPDATE/DELETE tragam a linha
-- inteira (necessário para o client conseguir remover/atualizar pelo id/pk
-- antigo com segurança).
alter table public.produtos replica identity full;
alter table public.fornecedores replica identity full;
alter table public.clientes replica identity full;
alter table public.vendas replica identity full;
alter table public.itens_venda replica identity full;

-- ----------------------------------------------------------------------------
-- registrar_venda: operação atômica de finalizar venda (valida estoque,
-- decrementa produtos, grava venda + itens, tudo na mesma transação).
-- ----------------------------------------------------------------------------
create or replace function public.registrar_venda(
  p_itens jsonb,
  p_forma_pagamento text,
  p_cliente_id uuid default null
)
returns public.vendas
language plpgsql
as $$
declare
  v_venda public.vendas;
  v_total numeric(12, 2) := 0;
  v_item jsonb;
  v_estoque_atual integer;
  v_nome_peca text;
begin
  if p_itens is null or jsonb_array_length(p_itens) = 0 then
    raise exception 'Adicione ao menos um item à venda.';
  end if;

  -- 1) valida estoque de todos os itens antes de alterar qualquer um
  --    (FOR UPDATE trava as linhas até o fim da transação)
  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    select quantidade_estoque, descricao into v_estoque_atual, v_nome_peca
    from public.produtos
    where codigo_produto = v_item ->> 'produtoCodigo'
    for update;

    if not found then
      raise exception 'Peça não encontrada: %', v_item ->> 'nomePeca';
    end if;

    if v_estoque_atual < (v_item ->> 'quantidade')::integer then
      raise exception 'Estoque insuficiente para % (disponível: %).', v_nome_peca, v_estoque_atual;
    end if;

    v_total := v_total + (v_item ->> 'quantidade')::integer * (v_item ->> 'precoUnitario')::numeric;
  end loop;

  -- 2) decrementa o estoque de cada item
  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    update public.produtos
    set quantidade_estoque = quantidade_estoque - (v_item ->> 'quantidade')::integer
    where codigo_produto = v_item ->> 'produtoCodigo';
  end loop;

  -- 3) grava a venda
  insert into public.vendas (forma_pagamento, total, cliente_id)
  values (p_forma_pagamento, v_total, p_cliente_id)
  returning * into v_venda;

  -- 4) grava os itens da venda
  insert into public.itens_venda (venda_id, produto_codigo, nome_peca, quantidade, preco_unitario)
  select
    v_venda.id,
    v_item ->> 'produtoCodigo',
    v_item ->> 'nomePeca',
    (v_item ->> 'quantidade')::integer,
    (v_item ->> 'precoUnitario')::numeric
  from jsonb_array_elements(p_itens) as v_item;

  return v_venda;
end;
$$;

grant execute on function public.registrar_venda(jsonb, text, uuid) to anon, authenticated;

comment on function public.registrar_venda is
  'Finaliza uma venda de forma atômica: valida estoque, decrementa produtos, grava vendas + itens_venda. p_itens é um array JSON de {produtoCodigo, nomePeca, quantidade, precoUnitario}.';
