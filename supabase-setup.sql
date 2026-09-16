-- ==========================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE — BRECHÓ DA VITÓRIA
-- ==========================================================
-- Copie todo o conteúdo deste arquivo e cole no SQL Editor do Supabase
-- (Painel do Supabase > SQL Editor > New query > Run)

-- 1. CRIAR A TABELA DE PRODUTOS
create table if not exists public.produtos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  categoria text not null,
  preco text not null,
  tamanho text,
  observacao text,
  novo boolean default true,
  fotos text[] default array[]::text[],
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. HABILITAR SEGURANÇA POR LINHA (ROW LEVEL SECURITY - RLS)
alter table public.produtos enable row level security;

-- Política 1: Qualquer visitante pode visualizar as roupas da loja
create policy "Leitura pública de produtos"
  on public.produtos
  for select
  using (true);

-- Política 2: Apenas o administrador autenticado pode cadastrar roupas
create policy "Inserção restrita ao admin"
  on public.produtos
  for insert
  with check (auth.role() = 'authenticated');

-- Política 3: Apenas o administrador autenticado pode alterar roupas
create policy "Atualização restrita ao admin"
  on public.produtos
  for update
  using (auth.role() = 'authenticated');

-- Política 4: Apenas o administrador autenticado pode excluir roupas
create policy "Exclusão restrita ao admin"
  on public.produtos
  for delete
  using (auth.role() = 'authenticated');

-- 3. CRIAR BUCKET NO STORAGE PARA FOTOS DAS ROUPAS
insert into storage.buckets (id, name, public)
values ('produtos-fotos', 'produtos-fotos', true)
on conflict (id) do nothing;

-- Política de leitura pública das imagens no Storage
create policy "Fotos públicas para leitura"
  on storage.objects
  for select
  using (bucket_id = 'produtos-fotos');

-- Política de upload de fotos restrita a admin autenticado
create policy "Upload de fotos restrito ao admin"
  on storage.objects
  for insert
  with check (bucket_id = 'produtos-fotos' and auth.role() = 'authenticated');

-- Política de exclusão de fotos restrita a admin autenticado
create policy "Deleção de fotos restrita ao admin"
  on storage.objects
  for delete
  using (bucket_id = 'produtos-fotos' and auth.role() = 'authenticated');

-- ==========================================================
-- TUDO PRONTO! O seu banco no Supabase está 100% configurado.
-- ==========================================================
