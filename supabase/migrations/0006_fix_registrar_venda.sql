-- Corrige "column reference v_item is ambiguous": o alias da subquery no
-- INSERT ... SELECT tinha o mesmo nome da variável plpgsql v_item usada nos
-- loops. Renomeado para v_row (só nessa cláusula).
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

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    update public.produtos
    set quantidade_estoque = quantidade_estoque - (v_item ->> 'quantidade')::integer
    where codigo_produto = v_item ->> 'produtoCodigo';
  end loop;

  insert into public.vendas (forma_pagamento, total, cliente_id)
  values (p_forma_pagamento, v_total, p_cliente_id)
  returning * into v_venda;

  insert into public.itens_venda (venda_id, produto_codigo, nome_peca, quantidade, preco_unitario)
  select
    v_venda.id,
    v_row ->> 'produtoCodigo',
    v_row ->> 'nomePeca',
    (v_row ->> 'quantidade')::integer,
    (v_row ->> 'precoUnitario')::numeric
  from jsonb_array_elements(p_itens) as v_row;

  return v_venda;
end;
$$;
