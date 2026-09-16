import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// true só quando as duas variáveis existem e a URL é válida
export const supabaseConfigurado = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
)

// Se faltar configuração, cria o client com valores de mentira só pra não
// quebrar o import em nenhum lugar do app. As páginas checam
// `supabaseConfigurado` antes de tentar usar o `supabase` de verdade.
export const supabase = createClient(
  supabaseConfigurado ? supabaseUrl : 'https://exemplo.supabase.co',
  supabaseConfigurado ? supabaseAnonKey : 'chave-de-mentira'
)

if (!supabaseConfigurado) {
  console.warn(
    'Faltam as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. ' +
    'Copie o arquivo .env.example para .env e preencha com os dados do seu projeto Supabase.'
  )
}
