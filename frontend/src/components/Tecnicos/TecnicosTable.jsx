import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaKey } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { generateStrongPassword } from '../../utils/passwordGenerator';
import PasswordResetModal from './PasswordResetModal';

function TecnicosTable({ type, data, loading, onPageChange, totalPages, currentPage, fetchData }) {
  const { user: currentUser } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [resetPassword, setResetPassword] = useState({ show: false, password: '' });
  const [empresas, setEmpresas] = useState([]);
  const [filas, setFilas] = useState([]);

  // Carregar empresas e filas quando necessário
  useEffect(() => {
    const loadOptions = async () => {
      if (type === 'usuarios' && editingId) {
        try {
          const [empresasRes, filasRes] = await Promise.all([
            api.get('/cadastro/empresa/'),
            api.get('/cadastro/fila-atendimento/')
          ]);
          setEmpresas(empresasRes.data.results || empresasRes.data);
          setFilas(filasRes.data.results || filasRes.data);
        } catch (error) {
          console.error('Erro ao carregar opções:', error);
        }
      }
    };
    loadOptions();
  }, [type, editingId]);

  const handleEdit = (item) => {
    setEditingId(item.id);
    switch(type) {
      case 'usuarios':
        setEditData({
          username: item.username,
          full_name: item.full_name,
          empresa: item.empresa_data?.id,
          fila: item.fila_data?.id,
          is_gestor: item.is_gestor,
          is_tecnico: item.is_tecnico,
          is_staff: item.is_staff
        });
        break;
      case 'empresas':
        setEditData({
          nome: item.nome,
          codigo: item.codigo,
          status: item.status,
        });
        break;
      case 'filas':
        setEditData({
          nome: item.nome,
          codigo: item.codigo,
          empresa: item.empresa,
          status: item.status,
        });
        break;
    }
  };

  const handleSave = async (id) => {
    try {
      switch(type) {
        case 'usuarios':
          await api.patch(`/access/profile/${id}/`, editData);
          break;
        case 'empresas':
          await api.patch(`/cadastro/empresa/${id}/`, editData);
          break;
        case 'filas':
          await api.patch(`/cadastro/fila-atendimento/${id}/`, editData);
          break;
      }
      setEditingId(null);
      fetchData(currentPage);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
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

  const columns = {
    usuarios: [
      { header: 'Username', key: 'username' },
      { header: 'Nome', key: 'full_name' },
      { 
        header: 'Empresa', 
        key: 'empresa_data',
        render: (row) => row.empresa_data ? row.empresa_data.nome : '-'
      },
      { 
        header: 'Fila', 
        key: 'fila_data',
        render: (row) => row.fila_data ? row.fila_data.nome : '-'
      },
      { 
        header: 'Tipo', 
        key: 'type',
        render: (row) => {
          if (row.is_staff) return 'Staff';
          if (row.is_gestor) return 'Gestor';
          if (row.is_tecnico) return 'Técnico';
          return '-';
        }
      },
      { header: 'Ações', key: 'actions' }
    ],
    empresas: [
      { header: 'Nome', key: 'nome' },
      { header: 'Código', key: 'codigo' },
      { 
        header: 'Status', 
        key: 'status',
        render: (row) => (
          <span className={row.status ? 'status-active' : 'status-inactive'}>
            {row.status ? 'Ativo' : 'Inativo'}
          </span>
        )
      },
      { header: 'Ações', key: 'actions' }
    ],
    filas: [
      { header: 'Nome', key: 'nome' },
      { header: 'Código', key: 'codigo' },
      { header: 'Empresa', key: 'empresa' },
      { 
        header: 'Status', 
        key: 'status',
        render: (row) => (
          <span className={row.status ? 'status-active' : 'status-inactive'}>
            {row.status ? 'Ativo' : 'Inativo'}
          </span>
        )
      },
      { header: 'Ações', key: 'actions' }
    ]
  };

  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row);
    }
    return row[column.key] ?? '-';
  };

  const renderEditRow = (item) => {
    switch(type) {
      case 'usuarios':
        return (
          <>
            <td>{editData.username}</td>
            <td><input className="edit-input" value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} /></td>
            <td>
              {currentUser.is_staff ? (
                <select 
                  className="edit-input"
                  value={editData.empresa}
                  onChange={e => setEditData({...editData, empresa: e.target.value})}
                >
                  <option value="">Selecione uma empresa</option>
                  {empresas?.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nome}</option>
                  ))}
                </select>
              ) : (
                item.empresa_data?.nome || '-'
              )}
            </td>
            <td>
              {currentUser.is_staff ? (
                <select 
                  className="edit-input"
                  value={editData.fila}
                  onChange={e => setEditData({...editData, fila: e.target.value})}
                >
                  <option value="">Selecione uma fila</option>
                  {filas?.map(fila => (
                    <option key={fila.id} value={fila.id}>{fila.nome}</option>
                  ))}
                </select>
              ) : (
                item.fila_data?.nome || '-'
              )}
            </td>
            <td>
              {currentUser.is_staff ? (
                <select 
                  className="edit-input"
                  value={editData.is_staff ? 'staff' : editData.is_gestor ? 'gestor' : 'tecnico'}
                  onChange={e => {
                    const value = e.target.value;
                    setEditData({
                      ...editData,
                      is_staff: value === 'staff',
                      is_gestor: value === 'gestor',
                      is_tecnico: value === 'tecnico'
                    });
                  }}
                >
                  <option value="tecnico">Técnico</option>
                  <option value="gestor">Gestor</option>
                  <option value="staff">Staff</option>
                </select>
              ) : (
                <select 
                  className="edit-input"
                  value="tecnico"
                  disabled
                >
                  <option value="tecnico">Técnico</option>
                </select>
              )}
            </td>
            <td className="actions-column">
              <button className="save-button" onClick={() => handleSave(item.id)}><FaCheck /></button>
              <button className="cancel-button" onClick={() => setEditingId(null)}><FaTimes /></button>
            </td>
          </>
        );
      case 'empresas':
        return (
          <>
            <td><input className="edit-input" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} /></td>
            <td><input className="edit-input" value={editData.codigo} onChange={e => setEditData({...editData, codigo: e.target.value})} /></td>
            <td>
              <label className="switch">
                <input type="checkbox" checked={editData.status} onChange={e => setEditData({...editData, status: e.target.checked})} />
                <span className="slider"></span>
              </label>
            </td>
            <td className="actions-column">
              <button className="save-button" onClick={() => handleSave(item.id)}><FaCheck /></button>
              <button className="cancel-button" onClick={() => setEditingId(null)}><FaTimes /></button>
            </td>
          </>
        );
      case 'filas':
        return (
          <>
            <td><input className="edit-input" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} /></td>
            <td><input className="edit-input" value={editData.codigo} onChange={e => setEditData({...editData, codigo: e.target.value})} /></td>
            <td><input className="edit-input" value={editData.empresa} onChange={e => setEditData({...editData, empresa: e.target.value})} /></td>
            <td>
              <label className="switch">
                <input type="checkbox" checked={editData.status} onChange={e => setEditData({...editData, status: e.target.checked})} />
                <span className="slider"></span>
              </label>
            </td>
            <td className="actions-column">
              <button className="save-button" onClick={() => handleSave(item.id)}><FaCheck /></button>
              <button className="cancel-button" onClick={() => setEditingId(null)}><FaTimes /></button>
            </td>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="inventory-table-loading">Carregando...</div>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="inventory-table-empty">
      {type === 'usuarios' ? 'Nenhum usuário encontrado.' :
       type === 'empresas' ? 'Nenhuma empresa encontrada.' :
       'Nenhum registro encontrado.'}
    </div>;
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              {columns[type].map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                {editingId === row.id ? (
                  renderEditRow(row)
                ) : (
                  columns[type].map((column) => (
                    <td key={column.key}>
                      {column.key === 'actions' ? (
                        <div className="actions-column">
                          <button className="edit-button" onClick={() => handleEdit(row)}><FaEdit /></button>
                          {type === 'usuarios' && (
                            <button className="reset-button" onClick={() => handleResetPassword(row.id)}><FaKey /></button>
                          )}
                        </div>
                      ) : (
                        renderCell(row, column)
                      )}
                    </td>
                  ))
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
