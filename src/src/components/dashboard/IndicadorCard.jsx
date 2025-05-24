import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import PropTypes from 'prop-types';
import './IndicadorCard.css';

export const getTendenciaIcon = (tendencia, size = 14) => {
  if (tendencia === 'up') return <FaArrowUp style={{ color: '#28a745', fontSize: size }} />;
  if (tendencia === 'down') return <FaArrowDown style={{ color: '#dc3545', fontSize: size }} />;
  return <FaMinus style={{ color: '#6c757d', fontSize: size }} />;
};

function IndicadorCard({ icon: Icon, title, value, tendencia, subtitle, className = '' }) {
  return (
    <div className={`indicador-card ${className}`}>
      <div className="indicador-value-container">
        <div className="indicador-value">
          {value}
          {subtitle === '%' && <span>%</span>}
          {tendencia && (
            <div className="indicador-tendencia">
              {getTendenciaIcon(tendencia, 20)}
            </div>
          )}
        </div>
      </div>
      {subtitle && subtitle !== '%' && <p className="indicador-subtitle">{subtitle}</p>}
      <h3 className="indicador-title">
        <Icon className="indicador-icon" />
        {title}
      </h3>
    </div>
  );
}

IndicadorCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  tendencia: PropTypes.oneOf(['up', 'down', 'same']),
  subtitle: PropTypes.string,
  className: PropTypes.string,
};

export default IndicadorCard;
