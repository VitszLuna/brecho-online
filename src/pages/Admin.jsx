import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import jsPDF from 'jspdf'
import { supabase, supabaseConfigurado } from '../supabaseClient'
import { CATEGORIAS, nomeCategoria, WHATSAPP_FORMATADO } from '../config'
import { PRODUTOS_EXEMPLO } from '../dadosExemplo'
import { enviarFotos, apagarFotos } from '../storage'
import './Admin.css'

const FORM_VAZIO = {
  nome: '',
  categoria: CATEGORIAS[0].chave,
  preco: '',
  tamanho: '',
  observacao: '',
  novo: true,
}

// Converte URL de imagem para DataURL (Base64) para inclusão no PDF
async function carregarImagemBase64(url) {
  if (!url) return null
  if (url.startsWith('data:image')) return url

  try {
    const resp = await fetch(url, { mode: 'cors' })
    const blob = await resp.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width || 300
          canvas.height = img.height || 300
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = url
    })
  }
}

export default function Admin() {
  const [sessao, setSessao] = useState(undefined)
  const [produtos, setProdutos] = useState([])
  const [carregandoLista, setCarregandoLista] = useState(true)

  const [form, setForm] = useState(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [fotosAtuais, setFotosAtuais] = useState([])
  const [fotosRemovidas, setFotosRemovidas] = useState([])
  const [novosArquivos, setNovosArquivos] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [exportandoPDF, setExportandoPDF] = useState(false)
  const [erro, setErro] = useState(null)

  const navegar = useNavigate()

  useEffect(() => {
    if (supabaseConfigurado) {
      supabase.auth.getSession().then(({ data }) => {
        setSessao(data.session)
        if (!data.session) navegar('/entrar')
      })
      const { data: listener } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
        setSessao(novaSessao)
        if (!novaSessao) navegar('/entrar')
      })
      return () => listener.subscription.unsubscribe()
    } else {
      const demoLogado = localStorage.getItem('vitoria_demo_session') === 'true'
      if (demoLogado) {
        setSessao({ user: { email: 'admin@vitoriabrecho.com' } })
      } else {
        navegar('/entrar')
      }
    }
  }, [navegar])

  useEffect(() => {
    if (sessao) carregarProdutos()
  }, [sessao])

  async function carregarProdutos() {
    setCarregandoLista(true)
    if (supabaseConfigurado) {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('criado_em', { ascending: false })
      if (!error) setProdutos(data)
    } else {
      const salvos = localStorage.getItem('vitoria_produtos_demo')
      if (salvos) {
        try {
          setProdutos(JSON.parse(salvos))
        } catch {
          setProdutos(PRODUTOS_EXEMPLO)
        }
      } else {
        setProdutos(PRODUTOS_EXEMPLO)
      }
    }
    setCarregandoLista(false)
  }

  function salvarLocalmente(novosProdutos) {
    setProdutos(novosProdutos)
    if (!supabaseConfigurado) {
      localStorage.setItem('vitoria_produtos_demo', JSON.stringify(novosProdutos))
    }
  }

  function iniciarEdicao(produto) {
    setEditandoId(produto.id)
    setForm({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      tamanho: produto.tamanho || '',
      observacao: produto.observacao || '',
      novo: produto.novo,
    })
    setFotosAtuais(produto.fotos || [])
    setFotosRemovidas([])
    setNovosArquivos([])
    setErro(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setForm(FORM_VAZIO)
    setFotosAtuais([])
    setFotosRemovidas([])
    setNovosArquivos([])
    setErro(null)
  }

  function removerFotoAtual(url) {
    setFotosAtuais((atuais) => atuais.filter((f) => f !== url))
    setFotosRemovidas((removidas) => [...removidas, url])
  }

  function removerArquivoNovo(index) {
    setNovosArquivos((arquivos) => arquivos.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)

    if (!form.nome.trim() || !form.preco.trim()) {
      setErro('Preencha pelo menos o nome e o preço da peça.')
      return
    }

    setSalvando(true)
    try {
      let urlsNovas = []
      if (novosArquivos.length > 0) {
        if (supabaseConfigurado) {
          urlsNovas = await enviarFotos(novosArquivos)
        } else {
          urlsNovas = await Promise.all(
            novosArquivos.map(
              (f) =>
                new Promise((resolve) => {
                  const reader = new FileReader()
                  reader.onloadend = () => resolve(reader.result)
                  reader.readAsDataURL(f)
                })
            )
          )
        }
      }

      const fotosFinal = [...fotosAtuais, ...urlsNovas]

      if (supabaseConfigurado) {
        const dadosProduto = {
          nome: form.nome.trim(),
          categoria: form.categoria,
          preco: form.preco.trim(),
          tamanho: form.tamanho.trim(),
          observacao: form.observacao.trim(),
          novo: form.novo,
          fotos: fotosFinal,
        }

        if (editandoId) {
          const { error } = await supabase.from('produtos').update(dadosProduto).eq('id', editandoId)
          if (error) throw error
          if (fotosRemovidas.length > 0) await apagarFotos(fotosRemovidas)
        } else {
          const { error } = await supabase.from('produtos').insert(dadosProduto)
          if (error) throw error
        }
        await carregarProdutos()
      } else {
        const idItem = editandoId || 'demo-' + Date.now()
        const itemAtualizado = {
          id: idItem,
          nome: form.nome.trim(),
          categoria: form.categoria,
          preco: form.preco.trim(),
          tamanho: form.tamanho.trim(),
          observacao: form.observacao.trim(),
          novo: form.novo,
          fotos: fotosFinal.length > 0 ? fotosFinal : ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop'],
        }

        let listaNova = []
        if (editandoId) {
          listaNova = produtos.map((p) => (p.id === editandoId ? itemAtualizado : p))
        } else {
          listaNova = [itemAtualizado, ...produtos]
        }
        salvarLocalmente(listaNova)
      }

      cancelarEdicao()
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar agora. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir(produto) {
    const confirmar = window.confirm(`Excluir a peça "${produto.nome}" de vez?`)
    if (!confirmar) return
    try {
      if (supabaseConfigurado) {
        await supabase.from('produtos').delete().eq('id', produto.id)
        if (produto.fotos && produto.fotos.length > 0) await apagarFotos(produto.fotos)
        await carregarProdutos()
      } else {
        const listaNova = produtos.filter((p) => p.id !== produto.id)
        salvarLocalmente(listaNova)
      }
      if (editandoId === produto.id) cancelarEdicao()
    } catch (err) {
      alert('Não foi possível excluir agora: ' + err.message)
    }
  }

  async function exportarPDF() {
    setExportandoPDF(true)
    try {
      const doc = new jsPDF()

      // Cabeçalho do Catálogo
      doc.setFillColor(248, 235, 222)
      doc.rect(0, 0, 210, 38, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(214, 69, 93)
      doc.text('BRECHÓ ONLINE', 14, 18)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text('Catálogo de Roupas & Peças Selecionadas', 14, 26)

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Contato / Pedidos no WhatsApp: ${WHATSAPP_FORMATADO}`, 14, 33)

      let yPos = 46
      let contador = 1

      for (const p of produtos) {
        if (yPos > 245) {
          doc.addPage()
          yPos = 20
        }

        const temFoto = p.fotos && p.fotos.length > 0 && p.fotos[0]
        let imgBase64 = null
        if (temFoto) {
          imgBase64 = await carregarImagemBase64(p.fotos[0])
        }

        // Fundo do Card
        doc.setDrawColor(230, 230, 230)
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(14, yPos, 182, 38, 3, 3, 'FD')

        // Foto da Peça no Card (lado esquerdo)
        if (imgBase64) {
          try {
            // Suporta formatos PNG / JPEG
            const formato = imgBase64.includes('image/png') ? 'PNG' : 'JPEG'
            doc.addImage(imgBase64, formato, 17, yPos + 3, 32, 32)
          } catch {
            doc.setFillColor(242, 242, 242)
            doc.rect(17, yPos + 3, 32, 32, 'F')
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text('Peça', 27, yPos + 20)
          }
        } else {
          doc.setFillColor(242, 242, 242)
          doc.rect(17, yPos + 3, 32, 32, 'F')
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          doc.text('Peça', 27, yPos + 20)
        }

        // Informações da Peça (lado direito da foto)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(30, 30, 30)
        doc.text(`${contador}. ${p.nome}`, 54, yPos + 10)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.setTextColor(214, 69, 93)
        doc.text(`${p.preco}`, 190, yPos + 10, { align: 'right' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(80, 80, 80)
        const detalhe = `Categoria: ${nomeCategoria(p.categoria)}  |  Tamanho: ${p.tamanho || 'Único'}${p.novo ? '  |  [Chegou Agora]' : ''}`
        doc.text(detalhe, 54, yPos + 18)

        if (p.observacao) {
          doc.setFontSize(9)
          doc.setTextColor(120, 120, 120)
          const obsCurta = p.observacao.length > 68 ? p.observacao.substring(0, 68) + '...' : p.observacao
          doc.text(`Obs: ${obsCurta}`, 54, yPos + 26)
        }

        yPos += 43
        contador++
      }

      // Rodapé com data e paginação
      const totalPaginas = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Brechó Online · Catálogo gerado em ${new Date().toLocaleDateString('pt-BR')} · Pág. ${i} de ${totalPaginas}`, 14, 290)
      }

      doc.save(`catalogo-brecho-online-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      alert('Erro ao gerar catálogo em PDF: ' + err.message)
    } finally {
      setExportandoPDF(false)
    }
  }

  async function handleSair() {
    if (supabaseConfigurado) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('vitoria_demo_session')
    navegar('/entrar')
  }

  if (sessao === undefined) {
    return <div className="pagina-admin"><p>Carregando painel...</p></div>
  }

  return (
    <div className="pagina-admin">
      <header className="admin-header">
        <div className="logo"><b>brechó</b> <em>online</em> · painel administrativo</div>
        <div className="admin-header-acoes">
          <button className="btn-principal" onClick={exportarPDF} disabled={exportandoPDF} style={{ background: '#25D366' }}>
            {exportandoPDF ? 'gerando PDF com fotos...' : '📄 exportar catálogo (PDF)'}
          </button>
          <Link to="/" target="_blank">ver site</Link>
          <button className="btn-secundario" onClick={handleSair}>sair</button>
        </div>
      </header>

      {!supabaseConfigurado && (
        <div className="faixa-demo" style={{ background: '#fff3cd', color: '#856404', padding: '10px', textAlign: 'center' }}>
          ⚠️ <b>Modo de Prévia Local:</b> O Supabase ainda não está conectado no <code>.env</code>. As peças abaixo podem ser editadas, adicionadas e exportadas em PDF normalmente para teste.
        </div>
      )}

      <div className="admin-conteudo">
        <form className="cartao-form" onSubmit={handleSubmit}>
          <h2>{editandoId ? 'editar peça' : 'adicionar peça nova'}</h2>

          <label>
            Nome da peça
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Vestido floral midi"
              required
            />
          </label>

          <div className="linha-dupla">
            <label>
              Categoria
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.chave} value={c.chave}>{c.nome}</option>
                ))}
              </select>
            </label>

            <label>
              Preço
              <input
                type="text"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                placeholder="Ex: R$ 45"
                required
              />
            </label>
          </div>

          <div className="linha-dupla">
            <label>
              Tamanho
              <input
                type="text"
                value={form.tamanho}
                onChange={(e) => setForm({ ...form, tamanho: e.target.value })}
                placeholder="Ex: M, 38, Único..."
              />
            </label>

            <label className="checkbox-linha">
              <input
                type="checkbox"
                checked={form.novo}
                onChange={(e) => setForm({ ...form, novo: e.target.checked })}
              />
              Mostrar em "chegou agora"
            </label>
          </div>

          <label>
            Observação / Estado da peça
            <textarea
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              placeholder="Ex: usado poucas vezes, sem manchas, tecido leve..."
              rows={3}
            />
          </label>

          <label>
            Fotos da peça (selecione várias imagens juntas ou adicione mais aos poucos)
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const selecionados = Array.from(e.target.files)
                if (selecionados.length > 0) {
                  setNovosArquivos((atuais) => [...atuais, ...selecionados])
                  e.target.value = ''
                }
              }}
            />
          </label>

          {(fotosAtuais.length > 0 || novosArquivos.length > 0) && (
            <div style={{ margin: '6px 0 10px', fontSize: '0.85rem', color: '#444' }}>
              📸 <b>{fotosAtuais.length + novosArquivos.length} foto(s) selecionada(s)</b> — a primeira foto da lista será a capa no site.
            </div>
          )}

          {fotosAtuais.length > 0 && (
            <div className="miniaturas">
              {fotosAtuais.map((url) => (
                <div className="miniatura" key={url}>
                  <img src={url} alt="" />
                  <button type="button" onClick={() => removerFotoAtual(url)}>×</button>
                </div>
              ))}
            </div>
          )}

          {novosArquivos.length > 0 && (
            <div className="miniaturas">
              {novosArquivos.map((arquivo, i) => (
                <div className="miniatura" key={arquivo.name + i}>
                  <img src={URL.createObjectURL(arquivo)} alt="" />
                  <button type="button" onClick={() => removerArquivoNovo(i)}>×</button>
                </div>
              ))}
            </div>
          )}

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="form-acoes">
            <button className="btn-principal" type="submit" disabled={salvando}>
              {salvando ? 'salvando...' : editandoId ? 'salvar alterações' : 'adicionar peça'}
            </button>
            {editandoId && (
              <button className="btn-secundario" type="button" onClick={cancelarEdicao}>
                cancelar
              </button>
            )}
          </div>
        </form>

        <div className="lista-admin">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>suas peças ({produtos.length})</h2>
            <button className="btn-secundario" onClick={exportarPDF} disabled={exportandoPDF}>
              📄 Baixar Catálogo em PDF
            </button>
          </div>

          {carregandoLista && <p>Carregando peças...</p>}
          {!carregandoLista && produtos.length === 0 && <p>Nenhuma peça cadastrada ainda.</p>}

          <div className="tabela-produtos">
            {produtos.map((p) => (
              <div className="linha-produto" key={p.id}>
                <img
                  className="linha-foto"
                  src={p.fotos && p.fotos[0] ? p.fotos[0] : ''}
                  alt=""
                  style={{ visibility: p.fotos && p.fotos[0] ? 'visible' : 'hidden' }}
                />
                <div className="linha-info-produto">
                  <strong>{p.nome}</strong>
                  <span>{nomeCategoria(p.categoria)} · tam. {p.tamanho || 'Único'} · {p.preco}{p.novo ? ' · novo' : ''}</span>
                </div>
                <div className="linha-acoes">
                  <button className="btn-secundario" onClick={() => iniciarEdicao(p)}>editar</button>
                  <button className="btn-excluir" onClick={() => handleExcluir(p)}>excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
