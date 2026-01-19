const express = require('express');
const router = express.Router();

const matriculaController = require('../controllers/matriculaController');

router.post('/', matriculaController.matricularAluno);
router.get('/turma/:turmaId', matriculaController.listarAlunosPorTurma);
router.delete('/turma/:turmaId/aluno/:alunoId', matriculaController.removerAluno);

module.exports = router;