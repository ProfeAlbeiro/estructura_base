// src/views/auth/LoginHeader.jsx
const LoginHeader = ({ 
  titulo = 'Sistema de Información Web', 
  subtitulo = 'Inicie sesión para continuar' 
}) => {
  return (
    <div className="login-header">
      <h1>{titulo}</h1>
      <p>{subtitulo}</p>
    </div>
  )
}

export default LoginHeader