// src/views/auth/LoginFooter.jsx
const LoginFooter = ({ 
  emailDemo = 'oliver@stone.com', 
  passwordDemo = '[la que usaste para hashear]' 
}) => {
  return (
    <div className="login-footer">
      <p>Prueba con los usuarios de tu base de datos:</p>
      <p className="demo-credentials">
        <strong>Email:</strong> {emailDemo}
        <br />
        <strong>Contraseña:</strong> {passwordDemo}
      </p>
    </div>
  )
}

export default LoginFooter