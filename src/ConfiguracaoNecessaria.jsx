export default function ConfiguracaoNecessaria() {
  return (
    <div style={estilos.pagina}>
      <div style={estilos.cartao}>
        <h1 style={estilos.titulo}>falta configurar o Supabase</h1>
        <p style={estilos.paragrafo}>
          O site está rodando certinho, mas ele ainda não sabe onde guardar
          suas roupas porque falta o arquivo <code>.env</code> com os dados
          do seu projeto Supabase.
        </p>
        <ol style={estilos.lista}>
          <li>Na pasta do projeto, copie o arquivo <code>.env.example</code> e renomeie a cópia pra <code>.env</code>.</li>
          <li>Abra o <code>.env</code> e preencha as duas linhas com a URL e a chave do seu projeto (Supabase → Project Settings → API).</li>
          <li>Pare o servidor (Ctrl+C no terminal) e rode <code>npm run dev</code> de novo.</li>
        </ol>
        <p style={estilos.paragrafo}>
          O passo a passo completo de como criar o projeto no Supabase está
          no arquivo <code>README.md</code> lá na raiz da pasta.
        </p>
      </div>
    </div>
  )
}

const estilos = {
  pagina: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: '#fff6e9',
    fontFamily: "'Work Sans', sans-serif",
    color: '#2b1b33',
  },
  cartao: {
    maxWidth: '520px',
    background: '#fffdf8',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(43,27,51,0.12)',
  },
  titulo: {
    fontFamily: "'Fraunces', serif",
    fontSize: '1.6rem',
    marginTop: 0,
  },
  paragrafo: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  lista: {
    fontSize: '0.95rem',
    lineHeight: 1.8,
    paddingLeft: '20px',
  },
}
