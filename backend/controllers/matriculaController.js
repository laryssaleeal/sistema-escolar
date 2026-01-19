const connection = require('../database/connection');

// =========================================
// MATRICULAR ALUNO
// =========================================
exports.matricularAluno = async (req, res) => {
  try {
    const { turma_id, aluno_id } = req.body;

    // Validações
    if (!turma_id || !aluno_id) {
      return res.status(400).json({ 
        error: true,
        message: 'Turma e aluno são obrigatórios' 
      });
    }

    // Verificar se já está matriculado
    const [matriculas] = await connection.execute(
      'SELECT id FROM matriculas WHERE turma_id = ? AND aluno_id = ?',
      [turma_id, aluno_id]
    );

    if (matriculas.length > 0) {
      return res.status(400).json({ 
        error: true,
        message: 'Aluno já matriculado nesta turma' 
      });
    }

    // Matricular
    const [result] = await connection.execute(
      'INSERT INTO matriculas (turma_id, aluno_id) VALUES (?, ?)',
      [turma_id, aluno_id]
    );

    res.status(201).json({
      success: true,
      message: 'Aluno matriculado com sucesso',
      matricula: {
        id: result.insertId,
        turma_id,
        aluno_id
      }
    });

  } catch (error) {
    console.error('Erro ao matricular aluno:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao matricular aluno' 
    });
  }
};

// =========================================
// LISTAR ALUNOS POR TURMA
// =========================================
exports.listarAlunosPorTurma = async (req, res) => {
  try {
    const { turmaId } = req.params;

    const [alunos] = await connection.execute(`
      SELECT 
        u.id as aluno_id,
        u.nome,
        u.email,
        m.id as matricula_id
      FROM matriculas m
      INNER JOIN usuarios u ON m.aluno_id = u.id
      WHERE m.turma_id = ?
      ORDER BY u.nome
    `, [turmaId]);

    res.json(alunos);

  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao listar alunos' 
    });
  }
};

// =========================================
// REMOVER ALUNO DA TURMA
// =========================================
exports.removerAluno = async (req, res) => {
  try {
    const { turmaId, alunoId } = req.params;

    const [result] = await connection.execute(
      'DELETE FROM matriculas WHERE turma_id = ? AND aluno_id = ?',
      [turmaId, alunoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: true,
        message: 'Matrícula não encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Aluno removido da turma com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover aluno:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao remover aluno' 
    });
  }
};