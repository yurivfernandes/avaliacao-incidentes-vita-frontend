export const validateCPF = (cpf) => {
  const strCPF = cpf.replace(/[^\d]/g, '');
  if (strCPF.length !== 11) return false;
  
  let sum = 0;
  let rest;
  
  if (strCPF === "00000000000") return false;
  
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  }
  
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(strCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(strCPF.substring(i-1, i)) * (12 - i);
  }
  
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(strCPF.substring(10, 11))) return false;
  
  return true;
};

export const validateCNPJ = (cnpj) => {
  const strCNPJ = cnpj.replace(/[^\d]/g, '');
  if (strCNPJ.length !== 14) return false;
  
  if (strCNPJ === "00000000000000") return false;
  
  // Validação do primeiro dígito
  let size = strCNPJ.length - 2;
  let numbers = strCNPJ.substring(0, size);
  let digits = strCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Validação do segundo dígito
  size = size + 1;
  numbers = strCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};
