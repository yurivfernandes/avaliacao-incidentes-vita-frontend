export const formatCPFCNPJ = (value) => {
  // Remove tudo que não é número
  const numbersOnly = value.replace(/\D/g, '');
  
  if (numbersOnly.length <= 11) {
    // CPF
    return numbersOnly
      .replace(/(\d{3})(?=\d)/g, '$1.')
      .replace(/(\d{3})(?=\d)/g, '$1.')
      .replace(/(\d{3})(?=\d)/g, '$1-');
  } else {
    // CNPJ
    return numbersOnly
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
};

export const formatCEP = (value) => {
  const numbersOnly = value.replace(/\D/g, '').slice(0, 8);
  return numbersOnly.replace(/^(\d{5})(\d{3})?$/, "$1-$2");
};

export const formatTelefone = (value) => {
  const numbersOnly = value.replace(/\D/g, '');
  if (numbersOnly.length <= 10) {
    // Telefone fixo
    return numbersOnly.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    // Celular
    return numbersOnly.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

export const formatMoney = (value) => {
  // Remove tudo que não é número
  const cleanValue = value.replace(/\D/g, '');
  
  // Converte para número e divide por 100 para considerar os centavos
  const floatValue = parseFloat(cleanValue) / 100;
  
  // Formata o número para o padrão brasileiro
  return floatValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
