import React, { useState } from 'react';
import { FaEdit, FaCheck, FaTimes, FaKey } from 'react-icons/fa';
import api from '../../services/api';
import { generateStrongPassword } from '../../utils/passwordGenerator';
import PasswordResetModal from './PasswordResetModal';

function TecnicosTable({ data, loading, onPageChange, totalPages, currentPage, fetchData }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [resetPassword, setResetPassword] = useState({ show: false, password: '' });

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      company_name: user.company_name,
      fila_atendimento: user.fila_atendimento,
      is_gestor: user.is_gestor,
      is_tecnico: user.is_tecnico,
    });
  };

  const handleSave = async (id) => {
    try {
      await api.patch(`/access/profile/${id}/`, editData);
      setEditingId(null);
      fetchData(currentPage);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const newPassword = generateStrongPassword();
      await api.patch(`/access/profile/${userId}/`, {
        password: newPassword
      });
      
      setResetPassword({ show: true, password: newPassword });
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      alert('Erro ao resetar senha');
    }
  };

  if (loading) {
    return <div className="inventory-table-loading">Carregando...</div>;
  }

  if (!data.length) {
    return <div className="inventory-table-empty">Nenhum usuário encontrado.</div>;
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Primeiro Nome</th>
              <th>Último Nome</th>
              <th>Nome Completo</th>
              <th>Empresa</th>
              <th>Fila</th>
              <th>Gestor</th>
              <th>Técnico</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map(user => (
              <tr key={user.id}>
                {editingId === user.id ? (
                  <>
                    <td><input className="edit-input" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} /></td>
                    <td><input className="edit-input" value={editData.first_name} onChange={e => setEditData({...editData, first_name: e.target.value})} /></td>
                    <td><input className="edit-input" value={editData.last_name} onChange={e => setEditData({...editData, last_name: e.target.value})} /></td>
                    <td><input className="edit-input" value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} /></td>
                    <td><input className="edit-input" value={editData.company_name} onChange={e => setEditData({...editData, company_name: e.target.value})} /></td>
                    <td><input className="edit-input" value={editData.fila_atendimento} onChange={e => setEditData({...editData, fila_atendimento: e.target.value})} /></td>
                    <td>
                      <label className="switch">
                        <input type="checkbox" checked={editData.is_gestor} onChange={e => setEditData({...editData, is_gestor: e.target.checked})} />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>
                      <label className="switch">
                        <input type="checkbox" checked={editData.is_tecnico} onChange={e => setEditData({...editData, is_tecnico: e.target.checked})} />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td className="actions-column">
                      <button className="save-button" onClick={() => handleSave(user.id)}><FaCheck /></button>
                      <button className="cancel-button" onClick={() => setEditingId(null)}><FaTimes /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{user.username}</td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.full_name}</td>
                    <td>{user.company_name}</td>
                    <td>{user.fila_atendimento}</td>
                    <td>
                      <span className={user.is_gestor ? 'status-active' : 'status-inactive'}>
                        {user.is_gestor ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td>
                      <span className={user.is_tecnico ? 'status-active' : 'status-inactive'}>
                        {user.is_tecnico ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="actions-column">
                      <button className="edit-button" onClick={() => handleEdit(user)}><FaEdit /></button>
                      <button 
                        className="reset-button"
                        onClick={() => handleResetPassword(user.id)}
                        title="Resetar senha"
                      >
                        <FaKey />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <div className="pagination-info">
            Página {currentPage} de {totalPages}
          </div>
          <div className="pagination-controls">
            <button 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <button 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {resetPassword.show && (
        <PasswordResetModal
          password={resetPassword.password}
          onClose={() => setResetPassword({ show: false, password: '' })}
        />
      )}
    </>
  );
}

export default TecnicosTable;
