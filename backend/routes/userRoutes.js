const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// CRUD de usuários (rotas protegidas)
router.get('/usuarios', authMiddleware, userController.listar);
router.get('/usuarios/:id', authMiddleware, userController.buscarPorId);
router.post('/usuarios', userController.criar); // cadastro público
router.put('/usuarios/:id', authMiddleware, userController.atualizar);
router.delete('/usuarios/:id', authMiddleware, userController.deletar);

module.exports = router;
