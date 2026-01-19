const express = require('express');
const router = express.Router();

const turmaController = require('../controllers/turmaController');

// LISTAR TODAS (opcional / debug)
router.get('/', turmaController.listarTurmas);

// LISTAR TURMAS DO PROFESSOR
router.get('/professor/:professorId', turmaController.listarTurmasProfessor);

// CRIAR TURMA
router.post('/', turmaController.criarTurma);

module.exports = router;
