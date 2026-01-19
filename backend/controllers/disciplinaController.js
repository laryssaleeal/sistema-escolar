const connection = require('../database/connection');

// =========================================
// LISTAR DISCIPLINAS
// =========================================
exports.listarDisciplinas = async (req, res) => {
  try {
    const [disciplinas] = await connection.execute(
      'SELECT * FROM disciplinas ORDER BY nome'
    );

    res.json(disciplinas);

  } catch (error) {
    console.error('Erro ao listar disciplinas:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao listar disciplinas' 
    });
  }
};

// =========================================
// CRIAR DISCIPLINA
// =========================================
exports.criarDisciplina = async (req, res) => {
  try {
    const { nome, codigo } = req.body;

    // Validações
    if (!nome) {
      return res.status(400).json({ 
        error: true,
        message: 'Nome da disciplina é obrigatório' 
      });
    }

    // Criar disciplina
    const [result] = await connection.execute(
      'INSERT INTO disciplinas (nome, codigo) VALUES (?, ?)',
      [nome, codigo || null]
    );

    res.status(201).json({
      success: true,
      message: 'Disciplina criada com sucesso',
      disciplina: {
        id: result.insertId,
        nome,
        codigo
      }
    });

  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao criar disciplina' 
    });
  }
};