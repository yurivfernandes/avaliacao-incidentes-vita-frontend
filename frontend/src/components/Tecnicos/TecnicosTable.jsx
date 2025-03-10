import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaKey } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { generateStrongPassword } from '../../utils/passwordGenerator';
import PasswordResetModal from './PasswordResetModal';
import '../../styles/TecnicosTable.css';
import Select from 'react-select';

function TecnicosTable({ type, data, loading, onPageChange, totalPages, currentPage, fetchData }) {
  const { user: currentUser } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [resetPassword, setResetPassword] = useState({ show: false, password: '' });
  const [assignmentGroups, setAssignmentGroups] = useState([]);

  // Carregar grupos quando o componente montar
  useEffect(() => {
    const loadAssignmentGroups = async () => {
      try {
        const assignmentGroupsRes = await api.get('/dw_analytics/assignment-group/');
        setAssignmentGroups(assignmentGroupsRes.data.results || assignmentGroupsRes.data);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
      }
    };

    if (type === 'usuarios') {
      loadAssignmentGroups();
    }
  }, [type]);

  const handleEdit = (item) => {
    // Verificar permissões antes de permitir edição
    if (!currentUser.is_staff && type === 'assignment_groups') {
      return;
    }
    
    console.log('Item para editar:', item);
    setEditingId(item.id);
    switch(type) {
      case 'usuarios':
        const groups = item.assignment_groups?.map(g => g.id) || [];
        console.log('Grupos selecionados:', groups);
        setEditData({
          username: item.username,
          full_name: item.full_name,
          assignment_groups: groups,
          is_gestor: item.is_gestor,
          is_tecnico: item.is_tecnico,
          is_staff: item.is_staff,
          is_ativo: item.is_ativo
        });
        break;
      case 'assignment_groups':
        setEditData({
          dv_assignment_group: item.dv_assignment_group,
          status: item.status
        });
        break;
    }
  };

  const tipoOptions = [
    { value: 'tecnico', label: 'Técnico' },
    { value: 'gestor', label: 'Gestor' },
    ...(currentUser.is_staff ? [{ value: 'staff', label: 'Staff' }] : [])
  ];

  const handleSave = async (id) => {
    try {
      switch(type) {
        case 'usuarios':
          console.log('Dados sendo enviados:', {
            full_name: editData.full_name,
            assignment_groups: editData.assignment_groups,
            is_staff: editData.is_staff,
            is_gestor: editData.is_gestor,
            is_tecnico: editData.is_tecnico,
            is_active: editData.is_ativo
          });
          
          await api.patch(`/access/profile/${id}/`, {
            full_name: editData.full_name,
            assignment_groups: editData.assignment_groups,
            is_staff: editData.is_staff,
            is_gestor: editData.is_gestor,
            is_tecnico: editData.is_tecnico,
            is_active: editData.is_ativo // Mudando para is_active
          });
          break;
        case 'assignment_groups':
          await api.patch(`/dw_analytics/assignment-group/${id}/`, editData);
          break;
      }
      setEditingId(null);
      fetchData(currentPage);
    } catch (error) {
      console.error('Erro ao atualizar:', error.response?.data || error);
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
        header: 'Assignment Groups', 
        key: 'assignment_groups',
        render: (row) => {
          if (!row.assignment_groups || row.assignment_groups.length === 0) return '-';
          return row.assignment_groups.map(group => group.dv_assignment_group).join(', ');
        }
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
      { 
        header: 'Ativo', 
        key: 'is_ativo',
        render: (row) => (
          <span className={row.is_ativo ? 'status-active' : 'status-inactive'}>
            {row.is_ativo ? 'Ativo' : 'Inativo'}
          </span>
        )
      },
      { header: 'Ações', key: 'actions' }
    ],
    assignment_groups: [
      { header: 'Nome', key: 'dv_assignment_group' },
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
    if (column.key === 'actions') {
      // Só mostrar ações de edição para staff ou para usuários (se for gestor)
      const canEdit = currentUser.is_staff || 
        (type === 'usuarios' && !row.is_staff && !row.is_gestor);
      
      return (
        <div className="actions-column">
          {canEdit && (
            <button className="edit-button" onClick={() => handleEdit(row)}>
              <FaEdit />
            </button>
          )}
          {type === 'usuarios' && canEdit && (
            <button className="reset-button" onClick={() => handleResetPassword(row.id)}>
              <FaKey />
            </button>
          )}
        </div>
      );
    }
    return row[column.key] ?? '-';
  };

  const handleUserTypeChange = (selectedOption) => {
    console.log('Tipo selecionado:', selectedOption);
    const updatedData = {
      ...editData,
      is_staff: false,
      is_gestor: false,
      is_tecnico: false,
      [selectedOption.value === 'staff' ? 'is_staff' : 
       selectedOption.value === 'gestor' ? 'is_gestor' : 'is_tecnico']: true
    };
    console.log('Dados atualizados:', updatedData);
    setEditData(updatedData);
  };

  const renderEditRow = (item) => {
    switch(type) {
      case 'usuarios':
        return (
          <>
            <td>{editData.username}</td>
            <td><input className="edit-input" value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} /></td>
            <td>
              <Select
                isMulti
                value={assignmentGroups
                  ?.filter(group => editData.assignment_groups?.includes(group.id))
                  .map(group => ({
                    value: group.id,
                    label: group.dv_assignment_group
                  }))}
                onChange={(selectedOptions) => {
                  const selectedGroups = selectedOptions?.map(option => option.value) || [];
                  setEditData({...editData, assignment_groups: selectedGroups});
                }}
                options={assignmentGroups?.map(group => ({
                  value: group.id,
                  label: group.dv_assignment_group
                }))}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </td>
            <td>
              <Select
                value={tipoOptions.find(opt => 
                  (editData.is_staff && opt.value === 'staff') ||
                  (editData.is_gestor && opt.value === 'gestor') ||
                  (editData.is_tecnico && opt.value === 'tecnico')
                )}
                onChange={handleUserTypeChange}
                options={tipoOptions}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </td>
            <td>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={editData.is_ativo} 
                  onChange={e => setEditData({...editData, is_ativo: e.target.checked})} 
                />
                <span className="slider"></span>
              </label>
            </td>
            <td>
              <div className="actions-column">
                <button className="save-button" onClick={() => handleSave(item.id)} title="Salvar">
                  <FaCheck />
                </button>
                <button className="cancel-button" onClick={() => setEditingId(null)} title="Cancelar">
                  <FaTimes />
                </button>
              </div>
            </td>
          </>
        );
      case 'assignment_groups':
        return (
          <>
            <td>
              <input 
                className="edit-input"
                style={{ width: '100%', maxWidth: '300px' }}
                value={editData.dv_assignment_group} 
                onChange={e => setEditData({...editData, dv_assignment_group: e.target.value})} 
              />
            </td>
            <td>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={editData.status} 
                  onChange={e => setEditData({...editData, status: e.target.checked})} 
                />
                <span className="slider"></span>
              </label>
            </td>
            <td>
              <div className="actions-column">
                <button className="save-button" onClick={() => handleSave(item.id)} title="Salvar">
                  <FaCheck />
                </button>
                <button className="cancel-button" onClick={() => setEditingId(null)} title="Cancelar">
                  <FaTimes />
                </button>
              </div>
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
       'Nenhum registro encontrado.'}
    </div>;
  }

  return (
    <>
      <div className="tecnicos-table-container">
        <div className="tecnicos-table-scroll">
          <table className="tecnicos-table">
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
                        {renderCell(row, column)}
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tecnicos-pagination">
          <div className="tecnicos-pagination-info">
            Página {currentPage} de {totalPages}
          </div>
          <div className="tecnicos-pagination-controls">
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
