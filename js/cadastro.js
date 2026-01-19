// =========================================
// LÓGICA DO FORMULÁRIO DE CADASTRO
// =========================================

const cadastroForm = document.getElementById('cadastroForm');

cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede reload da página
    
    // Obter valores dos campos
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    
    // Validações
    if (!nome || !email || !senha || !confirmarSenha || !tipoUsuario) {
        mostrarMensagem('Preencha todos os campos!', 'erro');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarMensagem('Email inválido!', 'erro');
        return;
    }
    
    // Validar tamanho do nome
    if (nome.length < 3) {
        mostrarMensagem('Nome deve ter no mínimo 3 caracteres!', 'erro');
        return;
    }
    
    // Validar senha
    if (senha.length < 6) {
        mostrarMensagem('Senha deve ter no mínimo 6 caracteres!', 'erro');
        return;
    }
    
    // Verificar se as senhas coincidem
    if (senha !== confirmarSenha) {
        mostrarMensagem('As senhas não coincidem!', 'erro');
        return;
    }
    
    // Desabilitar botão durante o cadastro
    const botao = cadastroForm.querySelector('button[type="submit"]');
    const textoOriginal = botao.textContent;
    botao.textContent = 'Cadastrando...';
    botao.disabled = true;
    
    try {
        // Preparar dados
        const dados = {
            nome,
            email,
            senha,
            tipo_usuario: tipoUsuario
        };
        
        // Chamar API de cadastro
        const resultado = await cadastrarUsuario(dados);
        
        if (resultado && resultado.message === 'Usuário cadastrado com sucesso') {
            mostrarMensagem('Cadastro realizado com sucesso!', 'sucesso');

            // ✅ LIMPAR FORMULÁRIO
            cadastroForm.reset();

            // Redirecionar para login após 5 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 5000);

            
        } else {
            // Cadastro falhou
            mostrarMensagem(resultado.message || 'Erro ao cadastrar usuário!', 'erro');
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        mostrarMensagem('Erro ao realizar cadastro. Tente novamente.', 'erro');
        botao.textContent = textoOriginal;
        botao.disabled = false;
    }
});