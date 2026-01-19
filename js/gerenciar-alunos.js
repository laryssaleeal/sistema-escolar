// =========================================
// VERIFICAR AUTENTICAÇÃO
// =========================================
const usuario = verificarAutenticacao();

if (!usuario || usuario.tipo_usuario !== 'professor') {
    window.location.href = 'index.html';
}

document.getElementById('nomeUsuario').textContent = `👨‍🏫 ${usuario.nome}`;

// =========================================
// OBTER ID DA TURMA DA URL
// =========================================
const urlParams = new URLSearchParams(window.location.search);
const turmaId = urlParams.get('turmaId');

if (!turmaId) {
    alert('Turma não especificada!');
    window.location.href = 'dashboard-professor.html';
}

// =========================================
// VARIÁVEIS GLOBAIS
// =========================================
let alunosMatriculados = [];
let todosAlunos = [];

// =========================================
// CARREGAR DADOS
// =========================================
async function carregarDados() {
    await Promise.all([
        carregarAlunosTurma(),
        carregarTodosAlunos()
    ]);
}

async function carregarAlunosTurma() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('alunosContainer');
    const semAlunos = document.getElementById('semAlunos');
    
    try {
        const resultado = await api(`/matriculas/turma/${turmaId}`);
        
        loading.style.display = 'none';
        
        if (resultado && Array.isArray(resultado)) {
            alunosMatriculados = resultado;
            
            if (resultado.length > 0) {
                exibirAlunos(resultado);
                container.style.display = 'block';
            } else {
                semAlunos.style.display = 'block';
            }
        } else {
            semAlunos.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        loading.innerHTML = '<p style="color: #dc3545;">Erro ao carregar alunos</p>';
    }
}

async function carregarTodosAlunos() {
    try {
        const resultado = await listarUsuarios();
        
        if (resultado && resultado.success && Array.isArray(resultado.usuarios)) {
            // Filtrar apenas alunos
            todosAlunos = resultado.usuarios.filter(u => u.tipo_usuario === 'aluno');
            atualizarSelectAlunos();
        }
        
    } catch (error) {
        console.error('Erro ao carregar lista de alunos:', error);
    }
}

// =========================================
// EXIBIR ALUNOS
// =========================================
function exibirAlunos(alunos) {
    const grid = document.getElementById('alunosGrid');
    const total = document.getElementById('totalAlunos');
    
    total.textContent = alunos.length;
    
    grid.innerHTML = alunos.map(aluno => `
        <div class="aluno-card">
            <div class="aluno-info">
                <h4>👨‍🎓 ${aluno.nome}</h4>
                <p>${aluno.email}</p>
            </div>
            <button class="btn-remover" onclick="removerAluno(${aluno.aluno_id})">
                🗑️ Remover
            </button>
        </div>
    `).join('');
}

// =========================================
// ATUALIZAR SELECT DE ALUNOS
// =========================================
function atualizarSelectAlunos() {
    const select = document.getElementById('selectAluno');
    
    // Filtrar alunos que já estão matriculados
    const idsMatriculados = alunosMatriculados.map(a => a.aluno_id);
    const alunosDisponiveis = todosAlunos.filter(a => !idsMatriculados.includes(a.id));
    
    if (alunosDisponiveis.length === 0) {
        select.innerHTML = '<option value="">Todos os alunos já estão matriculados</option>';
        select.disabled = true;
        return;
    }
    
    select.disabled = false;
    select.innerHTML = `
        <option value="">Selecione um aluno...</option>
        ${alunosDisponiveis.map(aluno => 
            `<option value="${aluno.id}">${aluno.nome} (${aluno.email})</option>`
        ).join('')}
    `;
}

// =========================================
// ADICIONAR ALUNO
// =========================================
async function adicionarAluno() {
    const select = document.getElementById('selectAluno');
    const alunoId = select.value;
    
    if (!alunoId) {
        alert('Selecione um aluno!');
        return;
    }
    
    try {
        const resultado = await matricularAluno(turmaId, alunoId);
        
        if (resultado && !resultado.error) {
            alert('Aluno matriculado com sucesso!');
            await carregarDados();
        } else {
            alert(resultado.message || 'Erro ao matricular aluno');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao matricular aluno!');
    }
}

// =========================================
// REMOVER ALUNO
// =========================================
async function removerAluno(alunoId) {
    if (!confirm('Tem certeza que deseja remover este aluno da turma?')) {
        return;
    }
    
    try {
        const resultado = await api(`/matriculas/turma/${turmaId}/aluno/${alunoId}`, {
            method: 'DELETE'
        });
        
        if (resultado && !resultado.error) {
            alert('Aluno removido com sucesso!');
            await carregarDados();
        } else {
            alert(resultado.message || 'Erro ao remover aluno');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao remover aluno!');
    }
}

// =========================================
// VOLTAR
// =========================================
function voltarDashboard() {
    window.location.href = 'dashboard-professor.html';
}

// =========================================
// INICIALIZAÇÃO
// =========================================
window.addEventListener('DOMContentLoaded', () => {
    carregarDados();
});