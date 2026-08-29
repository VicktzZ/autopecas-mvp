-- ============================================================================
-- Preenchimento de dados que NÃO existem na planilha de origem
-- (BD_Proj_Integrador_5CD.xlsx só tem código, código de barras, descrição,
-- quantidade, NCM e a letra da categoria — nada de marca, preço, estoque
-- mínimo, localização ou nome de categoria).
--
-- Este script gera valores plausíveis para essas colunas nuláveis, para que a
-- UI (telas de Estoque/Vendas) tenha algo para exibir/editar em vez de vazio.
-- Roda de forma idempotente: só atualiza onde o campo ainda está NULL.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- categorias.nome
-- Nomes atribuídos com base na amostragem de descrições de cada letra
-- (ex.: letra A concentra produtos de limpeza automotiva Vonixx, letra H tem
-- hidratante de couro e emblemas, etc.) — não é aleatório, é a melhor
-- inferência possível a partir do conteúdo real da planilha.
-- ----------------------------------------------------------------------------
update public.categorias set nome = case codigo
  when 'A' then 'Estética e Limpeza Automotiva'
  when 'B' then 'Vedações e Anéis'
  when 'C' then 'Aditivos, Graxas e Fluidos'
  when 'D' then 'Sistema de Limpador de Para-brisa'
  when 'E' then 'Adesivos, Vedantes e Fluido de Freio'
  when 'F' then 'Sistema de Freios'
  when 'G' then 'Correias e Vedantes Industriais'
  when 'H' then 'Estética Interna e Acessórios'
  when 'I' then 'Aromatizantes e Lubrificantes'
  when 'J' then 'Filtros e Conexões Pneumáticas'
  when 'K' then 'Mangueiras e Componentes de Para-brisa'
  when 'L' then 'Mangueiras de Combustível/Gás'
  when 'N' then 'Peças de Reposição Diversas'
  else nome
end
where nome is null;

-- ----------------------------------------------------------------------------
-- produtos: marca / preços / estoque mínimo / localização
-- ----------------------------------------------------------------------------

-- marca: sorteada de uma lista de marcas reais do setor de autopeças/estética
-- automotiva (compatíveis com as categorias encontradas na planilha).
update public.produtos
set marca = (array[
    'Bosch', 'Fras-le', 'Cofap', 'Nakata', 'NGK', 'Monroe', 'Valeo', 'Wahler',
    'Moura', 'Sabó', 'Mobil', 'Castrol', 'Gates', 'Fremax', 'Mann Filter',
    'Tecfil', 'Vonixx', 'Loctite', 'Continental', 'TRW', 'Varga', 'Dirko',
    'ACDelco', 'Bardahl'
  ]::text[])[1 + floor(random() * 24)::int]
where marca is null;

-- preco_custo: entre R$ 5,00 e R$ 500,00
update public.produtos
set preco_custo = round((5 + random() * 495)::numeric, 2)
where preco_custo is null;

-- preco_venda: markup de 30% a 100% sobre o custo (sempre >= custo)
update public.produtos
set preco_venda = round((preco_custo * (1.3 + random() * 0.7))::numeric, 2)
where preco_venda is null
  and preco_custo is not null;

-- estoque_minimo: 5% a 20% da quantidade atual, no mínimo 1 unidade
update public.produtos
set estoque_minimo = greatest(1, floor(quantidade_estoque * (0.05 + random() * 0.15))::int)
where estoque_minimo is null;

-- localizacao: código de prateleira no padrão "A1-01" (corredor+nível-posição),
-- mesmo formato usado no mock atual do app (src/lib/mock-data.ts).
update public.produtos
set localizacao =
  chr(65 + floor(random() * 7)::int)      -- corredor A-G
  || (1 + floor(random() * 4))::text      -- nível 1-4
  || '-'
  || lpad((1 + floor(random() * 20))::text, 2, '0')  -- posição 01-20
where localizacao is null;
