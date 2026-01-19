const connection = require('../database/connection');

// =========================================
// LISTAR TODAS AS TURMAS
// =========================================
exports.listarTurmas = async (req, res) => {
  try {
    const [turmas] = await connection.execute(`
      SELECT 
        t.*,
        d.nome as disciplina,
        u.nome as professor,
        COUNT(m.id) as total_alunos
      FROM turmas t
      INNER JOIN disciplinas d ON t.disciplina_id = d.id
      INNER JOIN usuarios u ON t.professor_id = u.id
      LEFT JOIN matriculas m ON t.id = m.turma_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    res.json(turmas);

  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao listar turmas' 
    });
  }
};

// =========================================
// LISTAR TURMAS DO PROFESSOR
// =========================================
exports.listarTurmasProfessor = async (req, res) => {
  try {
    const { professorId } = req.params;

    const [turmas] = await connection.execute(`
      SELECT 
        t.id,
        t.nome,
        t.ano,
        d.nome as disciplina,
        COUNT(m.id) as total_alunos
      FROM turmas t
      INNER JOIN disciplinas d ON t.disciplina_id = d.id
      LEFT JOIN matriculas m ON t.id = m.turma_id
      WHERE t.professor_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [professorId]);

    res.json(turmas);

  } catch (error) {
    console.error('Erro ao listar turmas do professor:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao listar turmas' 
    });
  }
};

// =========================================
// CRIAR TURMA
// =========================================
exports.criarTurma = async (req, res) => {
  try {
    const { nome, disciplina_id, professor_id, ano } = req.body;

    // Validações
    if (!nome || !disciplina_id || !professor_id || !ano) {
      return res.status(400).json({ 
        error: true,
        message: 'Todos os campos são obrigatórios' 
      });
    }

    // Criar turma
    const [result] = await connection.execute(
      'INSERT INTO turmas (nome, disciplina_id, professor_id, ano) VALUES (?, ?, ?, ?)',
      [nome, disciplina_id, professor_id, ano]
    );

    res.status(201).json({
      success: true,
      message: 'Turma criada com sucesso',
      turma: {
        id: result.insertId,
        nome,
        disciplina_id,
        professor_id,
        ano
      }
    });

  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao criar turma' 
    });
  }
};