const express = require('express');
const router = express.Router();

const disciplinaController = require('../controllers/disciplinaController');

router.get('/', disciplinaController.listarDisciplinas);
router.post('/', disciplinaController.criarDisciplina);

module.exports = router;
