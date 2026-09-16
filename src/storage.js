import { supabase } from './supabaseClient'
import { BUCKET_FOTOS } from './config'

// Envia uma lista de arquivos (File[]) para o Supabase Storage
// e devolve a lista de URLs públicas prontas para salvar no produto.
export async function enviarFotos(arquivos) {
  const urls = []
  for (const arquivo of arquivos) {
    const nomeArquivo = `${Date.now()}-${Math.random().toString(36).slice(2)}-${arquivo.name}`
    const { error } = await supabase.storage
      .from(BUCKET_FOTOS)
      .upload(nomeArquivo, arquivo)

    if (error) {
      throw new Error(`Erro ao enviar a foto "${arquivo.name}": ${error.message}`)
    }

    const { data } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(nomeArquivo)
    urls.push(data.publicUrl)
  }
  return urls
}

// Apaga fotos do Storage a partir das URLs públicas salvas no produto.
export async function apagarFotos(urls) {
  if (!urls || urls.length === 0) return
  const caminhos = urls
    .map((url) => {
      const marcador = `/${BUCKET_FOTOS}/`
      const posicao = url.indexOf(marcador)
      if (posicao === -1) return null
      return url.slice(posicao + marcador.length)
    })
    .filter(Boolean)

  if (caminhos.length === 0) return
  await supabase.storage.from(BUCKET_FOTOS).remove(caminhos)
}
