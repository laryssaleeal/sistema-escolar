const connection = require('../database/connection');

// =========================================
// LANÇAR/ATUALIZAR NOTA
// =========================================
exports.lancarNota = async (req, res) => {
  try {
    const { turma_id, aluno_id, av1, av2, av3 } = req.body;

    // Validações
    if (!turma_id || !aluno_id) {
      return res.status(400).json({ 
        error: true,
        message: 'Turma e aluno são obrigatórios' 
      });
    }

    // Primeiro, buscar a matrícula do aluno na turma
    const [matriculas] = await connection.execute(
      'SELECT id FROM matriculas WHERE turma_id = ? AND aluno_id = ?',
      [turma_id, aluno_id]
    );

    if (matriculas.length === 0) {
      return res.status(400).json({ 
        error: true,
        message: 'Aluno não está matriculado nesta turma' 
      });
    }

    const matricula_id = matriculas[0].id;

    // Verificar se já existe nota
    const [notasExistentes] = await connection.execute(
      'SELECT id FROM notas WHERE matricula_id = ?',
      [matricula_id]
    );

    if (notasExistentes.length > 0) {
      // Atualizar nota existente
      await connection.execute(
        'UPDATE notas SET av1 = ?, av2 = ?, av3 = ? WHERE id = ?',
        [av1, av2, av3, notasExistentes[0].id]
      );

      res.json({
        success: true,
        message: 'Nota atualizada com sucesso'
      });

    } else {
      // Criar nova nota
      const [result] = await connection.execute(
        'INSERT INTO notas (matricula_id, av1, av2, av3) VALUES (?, ?, ?, ?)',
        [matricula_id, av1, av2, av3]
      );

      res.status(201).json({
        success: true,
        message: 'Nota lançada com sucesso',
        nota: {
          id: result.insertId,
          matricula_id,
          av1,
          av2,
          av3
        }
      });
    }

  } catch (error) {
    console.error('Erro ao lançar nota:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao lançar nota' 
    });
  }
};

// =========================================
// BUSCAR NOTAS DO ALUNO
// =========================================
exports.buscarNotasAluno = async (req, res) => {
  try {
    const { alunoId } = req.params;

    const [notas] = await connection.execute(`
      SELECT 
        n.id,
        n.av1,
        n.av2,
        n.av3,
        n.media,
        n.status,
        t.nome as turma,
        d.nome as disciplina,
        u.nome as professor
      FROM notas n
      INNER JOIN matriculas m ON n.matricula_id = m.id
      INNER JOIN turmas t ON m.turma_id = t.id
      INNER JOIN disciplinas d ON t.disciplina_id = d.id
      INNER JOIN usuarios u ON t.professor_id = u.id
      WHERE m.aluno_id = ?
      ORDER BY d.nome
    `, [alunoId]);

    res.json({
      success: true,
      notas
    });

  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao buscar notas' 
    });
  }
};

// =========================================
// BUSCAR NOTA DE UM ALUNO EM UMA TURMA
// =========================================
exports.buscarNotaTurmaAluno = async (req, res) => {
  try {
    const { turmaId, alunoId } = req.params;

    // Buscar matrícula
    const [matriculas] = await connection.execute(
      'SELECT id FROM matriculas WHERE turma_id = ? AND aluno_id = ?',
      [turmaId, alunoId]
    );

    if (matriculas.length === 0) {
      return res.json({ av1: null, av2: null, av3: null });
    }

    const matricula_id = matriculas[0].id;

    // Buscar notas
    const [notas] = await connection.execute(
      'SELECT av1, av2, av3 FROM notas WHERE matricula_id = ?',
      [matricula_id]
    );

    if (notas.length === 0) {
      return res.json({ av1: null, av2: null, av3: null });
    }

    res.json(notas[0]);

  } catch (error) {
    console.error('Erro ao buscar nota:', error);
    res.status(500).json({ 
      error: true,
      message: 'Erro ao buscar nota' 
    });
  }
};