import { useState, useEffect } from 'react'
import { WHATSAPP_NUMERO } from '../config'

export default function ProdutoModal({ produto, aoFechar }) {
  const [fotoAtual, setFotoAtual] = useState(0)

  useEffect(() => {
    setFotoAtual(0)
  }, [produto])

  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  if (!produto) return null

  const fotos = produto.fotos && produto.fotos.length > 0 ? produto.fotos : []
  const mensagem = `Oi! Vi o item "${produto.nome}" (tamanho ${produto.tamanho}) no Brechó Online e queria saber mais 😊`
  const linkComprar = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`

  function anterior() {
    setFotoAtual((f) => (f - 1 + fotos.length) % fotos.length)
  }
  function proxima() {
    setFotoAtual((f) => (f + 1) % fotos.length)
  }

  return (
    <div className="modal-fundo aberto" onClick={(e) => e.target === e.currentTarget && aoFechar()}>
      <div className="modal">
        <button className="modal-fechar" onClick={aoFechar} aria-label="fechar">×</button>
        <div className="modal-conteudo">
          <div>
            <div className="carrossel">
              {fotos.length > 0 ? (
                <img className="carrossel-foto" src={fotos[fotoAtual]} alt={produto.nome} />
              ) : (
                <div className="carrossel-foto sem-foto">sem foto</div>
              )}
              {fotos.length > 1 && (
                <>
                  <button className="carrossel-nav prev" onClick={anterior} aria-label="foto anterior">‹</button>
                  <button className="carrossel-nav next" onClick={proxima} aria-label="próxima foto">›</button>
                </>
              )}
            </div>
            {fotos.length > 1 && (
              <div className="carrossel-dots">
                {fotos.map((_, i) => (
                  <span
                    key={i}
                    className={i === fotoAtual ? 'ativo' : ''}
                    onClick={() => setFotoAtual(i)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="modal-info">
            <h3>{produto.nome}</h3>
            <div className="preco-modal">{produto.preco}</div>
            <div className="linha-info"><b>Tamanho</b><span>{produto.tamanho}</span></div>
            <div className="linha-info"><b>Observação</b><span>{produto.observacao || '—'}</span></div>
            <a className="btn-comprar" href={linkComprar} target="_blank" rel="noreferrer">
              comprar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
