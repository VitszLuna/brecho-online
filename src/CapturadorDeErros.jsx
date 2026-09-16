import { Component } from 'react'

export default class CapturadorDeErros extends Component {
  constructor(props) {
    super(props)
    this.state = { erro: null }
  }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('Erro capturado no app:', erro, info)
  }

  render() {
    if (this.state.erro) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', fontFamily: 'sans-serif', background: '#fff6e9', color: '#2b1b33',
        }}>
          <div style={{ maxWidth: '560px', background: '#fffdf8', padding: '28px', boxShadow: '0 10px 30px rgba(43,27,51,0.12)' }}>
            <h1 style={{ fontSize: '1.4rem' }}>algo deu errado ao carregar o site</h1>
            <p>Abre o console do navegador (F12 → aba "Console") pra ver a mensagem de erro abaixo e me manda ela:</p>
            <pre style={{
              whiteSpace: 'pre-wrap', background: '#f1ece2', padding: '12px',
              fontSize: '0.85rem', overflowX: 'auto',
            }}>
              {String(this.state.erro && this.state.erro.message ? this.state.erro.message : this.state.erro)}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
