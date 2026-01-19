document.addEventListener('DOMContentLoaded', () => {
    console.log('login.js carregado');

    // =========================================
    // VERIFICAR SE JÁ ESTÁ LOGADO
    // =========================================
    if (typeof obterToken !== 'function' || typeof obterUsuario !== 'function') {
        console.error('api.js não foi carregado corretamente');
        return;
    }

    const token = obterToken();
    const usuario = obterUsuario();

    if (token && usuario) {
        if (usuario.tipo_usuario === 'aluno') {
            window.location.href = 'dashboard-aluno.html';
            return;
        }
        if (usuario.tipo_usuario === 'professor') {
            window.location.href = 'dashboard-professor.html';
            return;
        }
    }

    // =========================================
    // FORMULÁRIO DE LOGIN
    // =========================================
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.error('Formulário de login não encontrado');
        return;
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;

        if (!email || !senha) {
            mostrarMensagem('Preencha todos os campos!', 'erro');
            return;
        }

        const botao = loginForm.querySelector('button[type="submit"]');
        botao.disabled = true;
        botao.textContent = 'Entrando...';

        try {
            const resultado = await login(email, senha);

            if (resultado && !resultado.error && resultado.token) {
                salvarToken(resultado.token);
                salvarUsuario(resultado.usuario);

                mostrarMensagem('Login realizado com sucesso!', 'sucesso');

                setTimeout(() => {
                    if (resultado.usuario.tipo_usuario === 'aluno') {
                        window.location.href = 'dashboard-aluno.html';
                    } else {
                        window.location.href = 'dashboard-professor.html';
                    }
                }, 800);
            } else {
                mostrarMensagem(
                    resultado.message || 'Email ou senha inválidos',
                    'erro'
                );
            }
        } catch (err) {
            mostrarMensagem(
                err?.message || 'Erro ao realizar login',
                'erro'
            );
        } finally {
            botao.disabled = false;
            botao.textContent = 'Entrar';
        }
    });
});
