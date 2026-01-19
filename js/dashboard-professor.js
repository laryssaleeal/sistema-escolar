// =========================================
// VERIFICAR AUTENTICAÇÃO
// =========================================

const usuario = verificarAutenticacao();

if (!usuario || usuario.tipo_usuario !== 'professor') {
    window.location.href = 'index.html';
}

// =========================================
// EXIBIR NOME DO USUÁRIO
// =========================================

document.getElementById('nomeUsuario').textContent = `👨‍🏫 ${usuario.nome}`;

// =========================================
// CARREGAR TURMAS DO PROFESSOR
// =========================================

async function carregarDisciplinas() {
    const select = document.getElementById('disciplina');

    try {
        const disciplinas = await api('/disciplinas');

        select.innerHTML = `
            <option value="">Selecione a disciplina</option>
            ${disciplinas.map(d =>
                `<option value="${d.id}">${d.nome}</option>`
            ).join('')}
        `;
    } catch (e) {
        console.error('Erro ao carregar disciplinas', e);
    }
}

async function carregarTurmas() {
    const loading = document.getElementById('loading');
    const turmasContainer = document.getElementById('turmasContainer');
    const semTurmas = document.getElementById('semTurmas');
    
    try {
        // Buscar turmas na API
        const resultado = await listarTurmasProfessor(usuario.id);
        
        // Ocultar loading
        loading.style.display = 'none';
        
        if (Array.isArray(resultado) && resultado.length > 0) {
            exibirTurmas(resultado);
            turmasContainer.style.display = 'grid';
        } else {
            semTurmas.style.display = 'block';
        }

        
    } catch (error) {
        console.error('Erro ao carregar turmas:', error);
        loading.innerHTML = '<p style="color: #dc3545;">Erro ao carregar turmas</p>';
    }
}

// =========================================
// EXIBIR TURMAS NA TELA
// =========================================

function exibirTurmas(turmas) {
    const container = document.getElementById('turmasContainer');
    
    container.innerHTML = turmas.map(turma => `
        <div class="card">
            <div class="card-header">
                <h3>${turma.disciplina}</h3>
                <span class="badge info">${turma.total_alunos} alunos</span>
            </div>
            
            <div class="card-body">
                <p><strong>Turma:</strong> ${turma.nome}</p>
                <p><strong>Ano:</strong> ${turma.ano}</p>
                
                <div class="card-actions">
                    <button class="btn-secondary" onclick="gerenciarAlunos(${turma.id})">
                        👥 Gerenciar Alunos
                    </button>
                    <button class="btn-primary" onclick="lancarNotasTurma(${turma.id})">
                        📝 Lançar Notas
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// =========================================
// MOSTRAR/ESCONDER FORMULÁRIO CRIAR TURMA
// =========================================

function mostrarFormCriarTurma() {
    document.getElementById('formCriarTurma').style.display = 'block';
}

function fecharFormTurma() {
    document.getElementById('formCriarTurma').style.display = 'none';
    document.getElementById('criarTurmaForm').reset();
}

// =========================================
// CRIAR NOVA TURMA
// =========================================

document.getElementById('criarTurmaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const dados = {
        nome: document.getElementById('nomeTurma').value,
        disciplina_id: parseInt(document.getElementById('disciplina').value),
        professor_id: usuario.id,
        ano: parseInt(document.getElementById('ano').value)
    };
    
    const botao = e.target.querySelector('button[type="submit"]');
    botao.textContent = 'Criando...';
    botao.disabled = true;
    
    try {
        const resultado = await criarTurma(dados);
        
        if (resultado && !resultado.error) {
            alert('Turma criada com sucesso!');
            fecharFormTurma();
            carregarTurmas();
        } else {
            alert(resultado.message || 'Erro ao criar turma');
        }

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar turma!');
    } finally {
        botao.textContent = 'Criar';
        botao.disabled = false;
    }
});

// =========================================
// GERENCIAR ALUNOS
// =========================================

function gerenciarAlunos(turmaId) {
    window.location.href = `gerenciar-alunos.html?turmaId=${turmaId}`;
}

// =========================================
// LANÇAR NOTAS
// =========================================

function lancarNotasTurma(turmaId) {
    window.location.href = `lancar-notas.html?turmaId=${turmaId}`;
}

// =========================================
// INICIALIZAÇÃO
// =========================================

window.addEventListener('DOMContentLoaded', () => {
    carregarTurmas();
    carregarDisciplinas();
});