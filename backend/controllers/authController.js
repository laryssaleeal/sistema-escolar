const connection = require('../database/connection');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Busca usuário pelo email
    const [rows] = await connection.execute(
      'SELECT id, nome, email, senha, tipo_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const usuario = rows[0];

    // Comparação simples (senha NÃO criptografada)
    if (senha !== usuario.senha) {
      return res.status(401).json({ message: 'Senha inválida' });
    }

    // Gerar token
    const token = jwt.sign(
      {
        id: usuario.id,
        tipo: usuario.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario
      }
    });

  } catch (error) {
    console.error('ERRO LOGIN:', error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};
