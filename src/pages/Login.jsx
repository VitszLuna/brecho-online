import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../supabaseClient'
import './Admin.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  useEffect(() => {
    if (supabaseConfigurado) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) navegar('/admin')
      })
    } else {
      if (localStorage.getItem('vitoria_demo_session') === 'true') {
        navegar('/admin')
      }
    }
  }, [navegar])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)

    if (supabaseConfigurado) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      setEnviando(false)
      if (error) {
        setErro('E-mail ou senha errados. Confira os dados e tente novamente.')
        return
      }
      navegar('/admin')
    } else {
      // Modo Demonstração Local (antes de conectar o Supabase)
      setEnviando(false)
      const emailLimpo = email.trim().toLowerCase()
      if (
        (emailLimpo === 'admin@brecho.online' || emailLimpo === 'admin@vitoriabrecho.com') &&
        (senha === 'brecho2026' || senha === 'vitoria2026')
      ) {
        localStorage.setItem('vitoria_demo_session', 'true')
        navegar('/admin')
      } else {
        setErro('E-mail ou senha incorretos para o modo demonstração. Use admin@brecho.online e senha brecho2026.')
      }
    }
  }

  return (
    <div className="pagina-login">
      <form className="cartao-login" onSubmit={handleSubmit}>
        <h1>entrar na área adm</h1>
        <p className="sub-secao">Área de administração do Brechó Online.</p>

        {!supabaseConfigurado && (
          <div className="dica-login" style={{ background: '#fff3cd', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', color: '#856404' }}>
            💡 <b>Modo Demonstração:</b><br />
            E-mail: <code>admin@brecho.online</code><br />
            Senha: <code>brecho2026</code>
          </div>
        )}

        <label>
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {erro && <p className="mensagem-erro">{erro}</p>}

        <button className="btn-principal" type="submit" disabled={enviando}>
          {enviando ? 'entrando...' : 'entrar'}
        </button>

        <Link className="link-voltar" to="/">voltar pro site</Link>
      </form>
    </div>
  )
}
