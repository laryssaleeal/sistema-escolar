const express = require('express');
const router = express.Router();

const notaController = require('../controllers/notaController');

router.post('/', notaController.lancarNota);
router.get('/aluno/:alunoId', notaController.buscarNotasAluno);
router.get('/turma/:turmaId/aluno/:alunoId', notaController.buscarNotaTurmaAluno);

module.exports = router;