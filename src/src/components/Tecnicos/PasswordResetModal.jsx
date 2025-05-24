import React from 'react';
import { FaCopy, FaTimes } from 'react-icons/fa';

function PasswordResetModal({ title = "Senha Resetada", subtitle, password, onClose }) {
  const handleCopyPassword = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(password);
      alert('Senha copiada com sucesso!');
    } catch (err) {
      console.error('Erro ao copiar senha:', err);
      alert('Erro ao copiar senha');
    }
  };

  const handleClose = (e) => {
    if (e) e.preventDefault();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="password-modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="password-modal-content">
          {subtitle && <p>{subtitle}</p>}
          <div className="password-display">
            <span>{password}</span>
            <button 
              type="button"
              className="copy-button" 
              onClick={handleCopyPassword}
            >
              <FaCopy />
            </button>
          </div>
          <p className="password-warning">
            Certifique-se de copiar esta senha antes de fechar.
          </p>
          <div className="modal-actions">
            <button 
              type="button"
              className="button-primary" 
              onClick={handleClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordResetModal;
