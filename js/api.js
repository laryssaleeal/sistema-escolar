// =========================================
// CONFIGURAÇÃO DA API
// =========================================

const API_URL = 'http://localhost:3001/api';

// =========================================
// GERENCIAMENTO DE TOKEN
// =========================================

function salvarToken(token) {
    localStorage.setItem('token', token);
}

function obterToken() {
    return localStorage.getItem('token');
}

function removerToken() {
    localStorage.removeItem('token');
}

function salvarUsuario(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

function obterUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

function removerUsuario() {
    localStorage.removeItem('usuario');
}

// =========================================
// FUNÇÃO DE REQUISIÇÃO GENÉRICA
// =========================================

async function api(endpoint, options = {}) {
    const token = obterToken();

    const config = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (options.body) {
        config.body = options.body;
    }

    // Token JWT (quando existir)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

async function api(endpoint, options = {}) {
    const token = obterToken();

    const config = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (options.body) {
        config.body = options.body;
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        const data = response.status !== 204 ? await response.json() : null;

        if (!response.ok) {
            return {
                error: true,
                status: response.status,
                message: data?.message || 'Erro na requisição'
            };
        }

        return data;

    } catch (error) {
        console.error('Erro de conexão:', error);
        return {
            error: true,
            message: 'Erro de conexão com o servidor'
        };
    }
}


        // Se não tiver conteúdo
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            return {
                error: true,
                status: response.status,
                message: data.message || 'Erro na requisição'
            };
        }

        return data;

    } catch (error) {
        console.error('Erro de conexão:', error);
        return {
            error: true,
            message: 'Erro de conexão com o servidor'
        };
    }
}

// =========================================
// FUNÇÕES DE MENSAGEM
// =========================================

function mostrarMensagem(mensagem, tipo = 'info') {
    const div = document.getElementById('mensagem');
    if (!div) return;

    div.textContent = mensagem;
    div.className = `mensagem ${tipo}`;
    div.style.display = 'block';

    setTimeout(() => {
        div.style.display = 'none';
    }, 4000);
}

// =========================================
// API - AUTENTICAÇÃO
// =========================================

async function login(email, senha) {
    return api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    });
}

function logout() {
    removerToken();
    removerUsuario();
    window.location.href = 'index.html';
}

// =========================================
// API - USUÁRIOS
// =========================================

async function cadastrarUsuario(dados) {
    return api('/usuarios', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function buscarUsuario(id) {
    return api(`/usuarios/${id}`);
}

async function listarUsuarios() {
    return api('/usuarios');
}

async function atualizarUsuario(id, dados) {
    return api(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

async function deletarUsuario(id) {
    return api(`/usuarios/${id}`, {
        method: 'DELETE'
    });
}

// =========================================
// API - TURMAS
// =========================================

async function listarTurmas() {
    return api('/turmas');
}

async function listarTurmasProfessor(professorId) {
    return api(`/turmas/professor/${professorId}`);
}

async function criarTurma(dados) {
    return api('/turmas', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function buscarAlunosTurma(turmaId) {
    return api(`/turmas/${turmaId}/alunos`);
}

async function matricularAluno(turmaId, alunoId) {
    return api('/matriculas', {
        method: 'POST',
        body: JSON.stringify({
            turma_id: turmaId,
            aluno_id: alunoId
        })
    });
}

// =========================================
// API - DISCIPLINAS
// =========================================

async function listarDisciplinas() {
    return api('/disciplinas');
}

// =========================================
// API - NOTAS
// =========================================

async function buscarNotasAluno(alunoId) {
    return api(`/notas/aluno/${alunoId}`);
}

async function lancarNotas(dados) {
    return api('/notas', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function atualizarNotas(notaId, dados) {
    return api(`/notas/${notaId}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

// =========================================
// VERIFICAR AUTENTICAÇÃO
// =========================================

function verificarAutenticacao() {
    const token = obterToken();
    const usuario = obterUsuario();

    if (!token || !usuario) {
        window.location.href = 'index.html';
        return null;
    }

    return usuario;
}
