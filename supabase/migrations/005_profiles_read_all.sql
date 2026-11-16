-- Permite que qualquer usuário autenticado veja o nome de todos os sócios
-- (usado no seletor de "Responsável" do CRM). Não altera quem pode editar
-- perfil — isso continua restrito ao próprio usuário.
create policy "Authenticated users can read all profiles" on public.profiles
  for select using (auth.role() = 'authenticated');
