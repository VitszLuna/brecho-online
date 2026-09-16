import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../supabaseClient'
import { CATEGORIAS, WHATSAPP_NUMERO, WHATSAPP_FORMATADO } from '../config'
import { PRODUTOS_EXEMPLO } from '../dadosExemplo'
import ProdutoCard from '../components/ProdutoCard.jsx'
import ProdutoModal from '../components/ProdutoModal.jsx'
import fotoSobreMim from './sobremim.jpeg'
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
            <li><a href="#sobre">sobre mim</a></li>
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
            <p>Peças femininas escolhidas a dedo, fotos reais tiradas por mim mesma, sem frescura. Dá uma olhada no que tem na pilha essa semana — capaz de você achar aquela peça favorita.</p>
            <div className="hero-ctas">
              <a className="btn-principal" href="#loja">ver as roupas</a>
              <a className="btn-secundario" href="#sobre">quem eu sou</a>
            </div>
          </div>
          <div className="hero-fotos">
            <div className="polaroid p1"><div className="fita"></div><img src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop" alt="Vestido Floral" /><span>✨ favorita</span></div>
            <div className="polaroid p2"><img src="https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&auto=format&fit=crop" alt="Saia Midi" /><span>tam. M</span></div>
            <div className="polaroid p3"><img src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&auto=format&fit=crop" alt="Blusa Tricô" /><span>chegou hoje</span></div>
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
          <p className="sub-secao">O que tá mais fresquinho na pilha — peças de moda feminina escolhidas a dedo pra você.</p>
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

      <section className="sobre" id="sobre">
        <div className="wrap sobre-grid">
          <div className="sobre-foto">
            <img src={fotoSobreMim} alt="Foto da Vitória" />
          </div>
          <div>
            <h2>sobre mim</h2>
            <p>Oi, eu sou a Vitória! Tenho 18 anos e resolvi abrir esse brechozinho pra dar um novo lar pras roupas que eu amei um dia, mas não uso mais. Cada peça aqui foi escolhida, lavada e fotografada por mim, com bastante carinho.</p>
            <p>Todo real que entra vai direto pro meu potinho de sonhos — tô juntando dinheiro pra construir algo grande pra mim, e cada compra sua me deixa um passinho mais perto disso. Obrigada de coração por passar por aqui. 💛</p>
            <div className="assinatura">com carinho, Vitória</div>
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
