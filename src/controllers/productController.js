const supabase = require('../config/supabase');
const { validateProduct, validateId } = require('../validators/productValidator');

// GET - Listar todos os produtos
exports.getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calcular economia para cada produto
    const productsWithSavings = data.map(product => ({
      ...product,
      savings: product.old_price - product.new_price
    }));

    res.status(200).json({
      success: true,
      count: productsWithSavings.length,
      data: productsWithSavings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos',
      error: error.message
    });
  }
};

// GET - Buscar produto por ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      throw error;
    }

    // Adicionar economia
    const productWithSavings = {
      ...data,
      savings: data.old_price - data.new_price
    };

    res.status(200).json({
      success: true,
      data: productWithSavings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto',
      error: error.message
    });
  }
};

// POST - Criar novo produto
exports.createProduct = async (req, res) => {
  try {
    // Validar dados
    const validation = validateProduct(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validation.errors
      });
    }

    const { name, emoji, old_price, new_price, discount } = req.body;

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: name.trim(),
          emoji: emoji.trim(),
          old_price: parseFloat(old_price),
          new_price: parseFloat(new_price),
          discount: parseInt(discount)
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso!',
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar produto',
      error: error.message
    });
  }
};

// PUT - Atualizar produto
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    // Validar dados (parcial)
    const validation = validateProduct({ ...req.body });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validation.errors
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name.trim();
    if (req.body.emoji) updateData.emoji = req.body.emoji.trim();
    if (req.body.old_price !== undefined) updateData.old_price = parseFloat(req.body.old_price);
    if (req.body.new_price !== undefined) updateData.new_price = parseFloat(req.body.new_price);
    if (req.body.discount !== undefined) updateData.discount = parseInt(req.body.discount);

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar produto',
      error: error.message
    });
  }
};

// DELETE - Deletar produto
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Produto deletado com sucesso!',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar produto',
      error: error.message
    });
  }
};