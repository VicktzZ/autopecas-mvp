# Seed: dados da planilha `BD_Proj_Integrador_5CD.xlsx`

Os arquivos `categorias.csv` e `produtos.csv` foram extraídos e normalizados a partir da aba
`CONSOLIDADO` da planilha (8.802 linhas, todas únicas por `codigo_produto`). Eles servem como
**fonte/registro** dos dados originais — a carga em si já está em SQL versionado em
`supabase/migrations/`, então **não é necessário rodar nada manualmente** para reproduzir o banco.

Transformações aplicadas na extração:
- `codigo_barras`: o valor literal `"SEM GTIN"` (1.360 linhas) e células vazias (55 linhas)
  viraram `NULL`.
- Todos os campos de texto foram `trim()`-ados.
- `quantidade_estoque` convertido para inteiro.
- `ncm` mantido como texto (8 dígitos).

## Migrations (ordem de aplicação)

1. `0001_create_produtos_schema.sql` — schema (`categorias`, `produtos`, constraints, RLS).
2. `0002_seed_produtos_data.sql` — `INSERT` gerado a partir destes dois CSVs (gerado por script
   Python one-off, não versionado — os `INSERT`s já estão no arquivo final).
3. `0003_randomize_placeholder_data.sql` — preenche os campos que **não existem** na planilha
   original (`marca`, `preco_custo`, `preco_venda`, `estoque_minimo`, `localizacao`,
   `categorias.nome`) com valores plausíveis/aleatórios. Idempotente (só atualiza `where ... is
   null`).

Para aplicar tudo num projeto Supabase novo (já linkado via `supabase link`):
```bash
supabase db push
```

## Já foi rodado no banco de produção

O projeto Supabase real (`autopecas-mvp`, ref `wfkkuqilylgtwddqygvf`, região `sa-east-1`) já está
criado e com as 3 migrations aplicadas — as 8.802 linhas de `produtos` e as 13 `categorias` estão
no ar. Se precisar recriar do zero (outro projeto, outro ambiente), basta `supabase link` +
`supabase db push`.

## Se quiser re-randomizar os placeholders

`0003_randomize_placeholder_data.sql` só preenche onde o valor está `NULL`. Para gerar valores
novos em cima do que já existe, rode manualmente um `UPDATE ... SET coluna = NULL` antes, ou copie
o corpo do script substituindo `is null` por `true` — está documentado inline no próprio arquivo.
