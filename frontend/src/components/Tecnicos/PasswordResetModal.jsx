import React from 'react';
import { FaCopy, FaTimes, FaCheck } from 'react-icons/fa';

function PasswordResetModal({ password, onClose, title = "Senha Resetada com Sucesso", subtitle }) {
  const handleCopy = () => {
    const textToCopy = subtitle 
      ? `${subtitle}\nSenha: ${password}` 
      : password;
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <>
      <div className="modal-overlay" />
      <div className="password-modal">
        <div className="password-modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="password-modal-content">
          {subtitle && <p>{subtitle}</p>}
          <p>Senha gerada:</p>
          <div className="password-display">
            <span>{password}</span>
            <button className="copy-button" onClick={handleCopy} title="Copiar credenciais">
              <FaCopy />
            </button>
          </div>
          <p className="password-warning">
            Por favor, copie estas informações antes de fechar.
          </p>
          <div className="modal-actions">
            <button className="button-primary" onClick={onClose}>
              <FaCheck /> OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PasswordResetModal;
