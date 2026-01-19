const connection = require('../database/connection');

// =========================================
// CRIAR USUÁRIO (CADASTRO)
// =========================================
exports.criar = async (req, res) => {
  try {
    const { nome, email, senha, tipo_usuario } = req.body;

    // Validações
    if (!nome || !email || !senha || !tipo_usuario) {
      return res.status(400).json({ 
        success: false,
        message: 'Todos os campos são obrigatórios' 
      });
    }

    // Verificar se email já existe
    const [usuarios] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Email já cadastrado' 
      });
    }

    // Inserir usuário (senha SEM criptografia)
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
      [nome, email, senha, tipo_usuario]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      usuario: {
        id: result.insertId,
        nome,
        email,
        tipo_usuario
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar usuário' 
    });
  }
};

// =========================================
// LISTAR TODOS OS USUÁRIOS
// =========================================
exports.listar = async (req, res) => {
  try {
    const [usuarios] = await connection.execute(
      'SELECT id, nome, email, tipo_usuario, created_at FROM usuarios'
    );

    res.json({
      success: true,
      usuarios
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar usuários' 
    });
  }
};

// =========================================
// BUSCAR USUÁRIO POR ID
// =========================================
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [usuarios] = await connection.execute(
      'SELECT id, nome, email, tipo_usuario, created_at FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
    }

    res.json({
      success: true,
      usuario: usuarios[0]
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar usuário' 
    });
  }
};

// =========================================
// ATUALIZAR USUÁRIO
// =========================================
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email } = req.body;

    const [result] = await connection.execute(
      'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
      [nome, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar usuário' 
    });
  }
};

// =========================================
// DELETAR USUÁRIO
// =========================================
exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await connection.execute(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao deletar usuário' 
    });
  }
};