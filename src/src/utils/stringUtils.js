export function formatUsername(firstName, lastName) {
  // Concatena primeiro e último nome
  const fullName = `${firstName} ${lastName}`.toLowerCase();
  
  // Remove acentos
  const withoutAccents = fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Substitui espaços por underscore e remove caracteres especiais
  return withoutAccents.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
}
