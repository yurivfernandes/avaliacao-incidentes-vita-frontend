import React, { useState } from 'react';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import '../styles/AvaliacoesTable.css';

function GenericTable({ columns, data, loading, onSave, onEdit, onCancel, onPageChange, totalPages, currentPage }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (item) => {
    setEditingId(item.id);
    const initialData = {};
    columns.forEach(col => {
      if (col.key && col.key !== 'actions') {
        initialData[col.key] = item[col.key];
      }
    });
    setEditData(initialData);
    if (onEdit) onEdit(item);
  };

  const handleSave = () => {
    if (onSave) onSave(editingId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    if (onCancel) onCancel();
  };

  const handleInputChange = (key, value) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  };

  const renderCell = (row, column) => {
    // Se a coluna tem uma função de renderização personalizada, usá-la
    if (column.render) {
      return column.render(row, editingId === row.id ? handleInputChange : null);
    }
    
    // Renderização padrão para coluna de ações
    if (column.key === 'actions') {
      return (
        <div className="actions-column">
          {editingId === row.id ? (
            <>
              <button className="save-button" onClick={handleSave} title="Salvar">
                <FaCheck />
              </button>
              <button className="cancel-button" onClick={handleCancel} title="Cancelar">
                <FaTimes />
              </button>
            </>
          ) : (
            <button className="edit-button" onClick={() => handleEdit(row)}>
              <FaEdit />
            </button>
          )}
        </div>
      );
    }
    
    // Valor padrão quando não há dado
    return row[column.key] ?? '-';
  };

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="generic-table inventory-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key || column.header}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>Carregando...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>Nenhum registro encontrado</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key || column.header}>
                      {editingId === row.id && column.editable ? (
                        column.editComponent ? (
                          column.editComponent(editData, setEditData)
                        ) : (
                          <input
                            className="edit-input"
                            type={column.type || "text"}
                            value={editData[column.key] || ""}
                            onChange={(e) => handleInputChange(column.key, e.target.value)}
                          />
                        )
                      ) : (
                        renderCell(row, column)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <div className="pagination-info">
          {data.length > 0 ? `Página ${currentPage} de ${totalPages}` : 'Sem registros'}
        </div>
        <div className="pagination-controls">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || data.length === 0}>
            Anterior
          </button>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || data.length === 0}>
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenericTable;
