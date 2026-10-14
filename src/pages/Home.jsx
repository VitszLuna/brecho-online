import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../supabaseClient'
import { CATEGORIAS, WHATSAPP_NUMERO, WHATSAPP_FORMATADO } from '../config'
import { PRODUTOS_EXEMPLO } from '../dadosExemplo'
import ProdutoCard from '../components/ProdutoCard.jsx'
import ProdutoModal from '../components/ProdutoModal.jsx'
import './Home.css'

export default function Home() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [produtoAberto, setProdutoAberto] = useState(null)

  useEffect(() => {
    if (supabaseConfigurado) {
      buscarProdutos()
    } else {
      // Supabase ainda não foi ativado: mostra roupas de exemplo só pra prévia.
      setProdutos(PRODUTOS_EXEMPLO)
      setCarregando(false)
    }
  }, [])

  async function buscarProdutos() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      setErro('Não consegui carregar as roupas agora. Tenta recarregar a página.')
    } else {
      setProdutos(data)
      setErro(null)
    }
    setCarregando(false)
  }

  const destaques = produtos.filter((p) => p.novo)
  const listaLoja =
    categoriaAtiva === 'todos'
      ? produtos
      : produtos.filter((p) => p.categoria === categoriaAtiva)

  const linkZap = `https://wa.me/${WHATSAPP_NUMERO}`

  return (
    <div>
      <header className="header">
        <nav className="wrap nav">
          <div className="logo"><b>vitória</b> <em>brechó</em></div>
          <ul className="nav-links">
            <li><a href="#categorias">categorias</a></li>
            <li><a href="#destaques">novidades</a></li>
            <li><a href="#loja">a loja</a></li>
            <li><Link to="/entrar" style={{ fontWeight: '600', color: '#d6455d' }}>área adm</Link></li>
          </ul>
          <a className="btn-zap" href={linkZap} target="_blank" rel="noreferrer">chamar no zap</a>
        </nav>
      </header>

      {!supabaseConfigurado && (
        <div className="faixa-demo">
          é assim que o site vai ficar — as roupas abaixo são só de exemplo, ative o Supabase pra colocar as suas
        </div>
      )}

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>Roupas que eu amei um dia, prontas pra ganhar <em>um novo lar</em></h1>
            <p>Peças femininas e masculinas escolhidas a dedo, fotos reais, sem frescura. Dá uma olhada no que tem na pilha essa semana — capaz de você achar aquela peça favorita.</p>
            <div className="hero-ctas">
              <a className="btn-principal" href="#loja">ver as roupas</a>
              <a className="btn-secundario" href="#destaques">ver novidades</a>
            </div>
          </div>
          <div className="hero-fotos">
            <div className="polaroid p1"><div className="fita"></div><img src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop" alt="Jaqueta Jeans Masculina" /><span>✨ favorita</span></div>
            <div className="polaroid p2"><img src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop" alt="Vestido Floral" /><span>tam. M</span></div>
            <div className="polaroid p3"><img src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&auto=format&fit=crop" alt="Camisa Masculina Linho" /><span>chegou hoje</span></div>
          </div>
        </div>
      </section>

      <section className="categorias" id="categorias">
        <div className="wrap">
          <h2 className="titulo-secao">o que você tá procurando?</h2>
          <p className="sub-secao">Clica numa categoria pra filtrar a loja lá embaixo.</p>
          <div className="chips">
            <button
              className={'chip' + (categoriaAtiva === 'todos' ? ' ativo' : '')}
              onClick={() => setCategoriaAtiva('todos')}
            >
              Tudo
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.chave}
                className={'chip' + (categoriaAtiva === cat.chave ? ' ativo' : '')}
                onClick={() => setCategoriaAtiva(cat.chave)}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>
      </section>

      {erro && (
        <div className="wrap">
          <p className="mensagem-erro">{erro}</p>
        </div>
      )}

      <section id="destaques">
        <div className="wrap">
          <h2 className="titulo-secao">chegou agora</h2>
          <p className="sub-secao">O que tá mais fresquinho na pilha — peças femininas e masculinas escolhidas a dedo pra você.</p>
          {!carregando && destaques.length === 0 && (
            <p className="sub-secao">Nada em destaque agora — dá uma olhada na loja completa aqui embaixo.</p>
          )}
          <div className="grid-produtos">
            {destaques.map((p) => (
              <ProdutoCard key={p.id} produto={p} onClick={setProdutoAberto} />
            ))}
          </div>
        </div>
      </section>

      <section id="loja" className="secao-loja">
        <div className="wrap">
          <h2 className="titulo-secao">todo o brechó</h2>
          <p className="sub-secao">Tudo que tá disponível agora. Clica em cima da peça pra ver mais fotos, tamanho e preço.</p>
          {carregando && <p className="sub-secao">Carregando as roupas...</p>}
          {!carregando && listaLoja.length === 0 && (
            <p className="sub-secao">Nenhuma peça por aqui ainda nessa categoria.</p>
          )}
          <div className="grid-produtos">
            {listaLoja.map((p) => (
              <ProdutoCard key={p.id} produto={p} onClick={setProdutoAberto} />
            ))}
          </div>
        </div>
      </section>

      <footer id="contato">
        <div className="wrap">
          <h2>ficou com vontade de alguma peça?</h2>
          <p>Me chama no WhatsApp <strong>{WHATSAPP_FORMATADO}</strong> que a gente combina tudo por lá — pagamento, entrega ou retirada.</p>
          <a className="footer-zap" href={linkZap} target="_blank" rel="noreferrer">
            chamar a Vitória no WhatsApp · {WHATSAPP_FORMATADO}
          </a>
          <p className="footer-nota">
            feito com carinho por Vitória, 2026 · <Link to="/entrar">área admin / entrar</Link>
          </p>
        </div>
      </footer>

      {produtoAberto && (
        <ProdutoModal produto={produtoAberto} aoFechar={() => setProdutoAberto(null)} />
      )}
    </div>
  )
}
