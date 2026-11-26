// src/views/common/AlertMessage.jsx (tu proyecto real)
import { useEffect, useState } from 'react'

const AlertMessage = ({ type, message, onClose, duration = 5000 }) => {
  // ... useState y useEffect (Paso 4 y 5) ...
  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-message">{message}</span>
      {onClose && <button onClick={onClose}>×</button>}
    </div>
  )
}

export default AlertMessage