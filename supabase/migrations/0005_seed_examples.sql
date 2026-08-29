-- Exemplos iniciais de fornecedores e clientes (mesmos dados que estavam no
-- mock em src/lib/mock-data.ts), para a UI não nascer com essas telas vazias.
-- Vendas ficam vazias de propósito — refletem o uso real a partir de agora.

insert into public.fornecedores (nome, contato, telefone, email) values
  ('Tecfil Distribuidora', 'Marcos Andrade', '(11) 4002-1234', 'vendas@tecfildist.com.br'),
  ('Bosch Auto Peças', 'Renata Lima', '(11) 4003-5678', 'comercial@boschautopecas.com.br'),
  ('Fras-le Distribuição', 'Carlos Eduardo', '(51) 3333-9090', null);

insert into public.clientes (nome, telefone, email, documento) values
  ('João Silva', '(11) 98888-1234', null, '123.456.789-00'),
  ('Oficina Boa Viagem', '(11) 97777-4321', 'contato@oficinaboaviagem.com.br', '12.345.678/0001-90'),
  ('Maria Santos', '(11) 96666-5566', null, null);
