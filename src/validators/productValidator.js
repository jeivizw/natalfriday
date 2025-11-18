// Validar dados do produto
const validateProduct = (data) => {
  const errors = [];

  // Validar nome
  if (!data.name || data.name.trim() === '') {
    errors.push('Nome do produto é obrigatório');
  } else if (data.name.length > 100) {
    errors.push('Nome não pode ter mais de 100 caracteres');
  }

  // Validar emoji
  if (!data.emoji || data.emoji.trim() === '') {
    errors.push('Emoji do produto é obrigatório');
  }

  // Validar preço antigo
  if (data.old_price === undefined || data.old_price === null) {
    errors.push('Preço antigo é obrigatório');
  } else if (isNaN(data.old_price) || data.old_price < 0) {
    errors.push('Preço antigo deve ser um número positivo');
  }

  // Validar preço novo
  if (data.new_price === undefined || data.new_price === null) {
    errors.push('Preço novo é obrigatório');
  } else if (isNaN(data.new_price) || data.new_price < 0) {
    errors.push('Preço novo deve ser um número positivo');
  }

  // Validar desconto
  if (data.discount === undefined || data.discount === null) {
    errors.push('Desconto é obrigatório');
  } else if (isNaN(data.discount) || data.discount < 0 || data.discount > 100) {
    errors.push('Desconto deve ser um número entre 0 e 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar ID (UUID)
const validateId = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

module.exports = {
  validateProduct,
  validateId
};