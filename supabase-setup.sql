-- ==========================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE — BRECHÓ ONLINE
-- ==========================================================
-- Copie TODO o conteúdo deste arquivo e cole no SQL Editor do Supabase:
-- (Painel do Supabase > SQL Editor > New query > Run)
-- Este script é 100% seguro para rodar mesmo se já rodou antes!

-- 1. CRIAR A TABELA DE PRODUTOS (COM SUPORTE A MÚLTIPLAS FOTOS)
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

-- Garante que a coluna 'fotos' (array para múltiplas imagens) exista mesmo se a tabela já foi criada antes
alter table public.produtos add column if not exists fotos text[] default array[]::text[];
alter table public.produtos add column if not exists novo boolean default true;

-- 2. HABILITAR SEGURANÇA POR LINHA (ROW LEVEL SECURITY - RLS)
alter table public.produtos enable row level security;

-- Limpar políticas antigas se existirem (para evitar erros ao colar de novo)
drop policy if exists "Leitura pública de produtos" on public.produtos;
drop policy if exists "Inserção restrita ao admin" on public.produtos;
drop policy if exists "Atualização restrita ao admin" on public.produtos;
drop policy if exists "Exclusão restrita ao admin" on public.produtos;

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

-- 3. CRIAR BUCKET NO STORAGE PARA AS FOTOS DAS PEÇAS
insert into storage.buckets (id, name, public)
values ('produtos-fotos', 'produtos-fotos', true)
on conflict (id) do update set public = true;

-- Limpar políticas antigas do storage se existirem
drop policy if exists "Fotos públicas para leitura" on storage.objects;
drop policy if exists "Upload de fotos restrito ao admin" on storage.objects;
drop policy if exists "Atualização de fotos restrita ao admin" on storage.objects;
drop policy if exists "Deleção de fotos restrita ao admin" on storage.objects;

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

-- Política de atualização de fotos restrita a admin autenticado
create policy "Atualização de fotos restrita ao admin"
  on storage.objects
  for update
  using (bucket_id = 'produtos-fotos' and auth.role() = 'authenticated');

-- Política de exclusão de fotos restrita a admin autenticado
create policy "Deleção de fotos restrita ao admin"
  on storage.objects
  for delete
  using (bucket_id = 'produtos-fotos' and auth.role() = 'authenticated');

-- ==========================================================
-- PRONTO! O seu banco no Supabase está 100% pronto para
-- aceitar múltiplas fotos por peça e funcionar com total segurança.
-- ==========================================================
