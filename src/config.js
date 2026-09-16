// Coloque aqui o seu número de WhatsApp: código do país (55) + DDD + número, só números.
export const WHATSAPP_NUMERO = '5511947653045'
export const WHATSAPP_FORMATADO = '(11) 94765-3045'

// Nome do bucket de fotos criado no Supabase Storage.
export const BUCKET_FOTOS = 'produtos-fotos'

// Categorias disponíveis. Pode editar os nomes, mas mantenha as "chave" iguais
// às usadas no banco de dados.
export const CATEGORIAS = [
  { chave: 'vestido', nome: 'Vestidos' },
  { chave: 'camisa', nome: 'Camisas' },
  { chave: 'short', nome: 'Shorts' },
  { chave: 'saia', nome: 'Saias' },
  { chave: 'calca', nome: 'Calças' },
  { chave: 'outros', nome: 'Outras coisas' },
]

export function nomeCategoria(chave) {
  const cat = CATEGORIAS.find((c) => c.chave === chave)
  return cat ? cat.nome : chave
}
