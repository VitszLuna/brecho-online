import { nomeCategoria } from '../config'

export default function ProdutoCard({ produto, onClick }) {
  const primeiraFoto = produto.fotos && produto.fotos.length > 0 ? produto.fotos[0] : null

  return (
    <div className="produto" onClick={() => onClick(produto)}>
      <div className="foto-wrap">
        {produto.novo && <div className="tag-novo">novo!</div>}
        {primeiraFoto ? (
          <img src={primeiraFoto} alt={produto.nome} />
        ) : (
          <div className="sem-foto">sem foto</div>
        )}
      </div>
      <h3>{produto.nome}</h3>
      <div className="preco">{produto.preco}</div>
      <div className="cat-label">
        {nomeCategoria(produto.categoria)} · tam. {produto.tamanho}
      </div>
    </div>
  )
}
