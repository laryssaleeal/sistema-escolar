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
let alunosNotas = [];

// =========================================
// CARREGAR ALUNOS E NOTAS
// =========================================
async function carregarAlunosNotas() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('notasContainer');
    const semAlunos = document.getElementById('semAlunos');
    
    try {
        // Buscar alunos da turma
        const resultado = await api(`/matriculas/turma/${turmaId}`);
        
        loading.style.display = 'none';
        
        if (resultado && Array.isArray(resultado) && resultado.length > 0) {
            // Para cada aluno, buscar suas notas
            const promessas = resultado.map(async (aluno) => {
                const notasResult = await api(`/notas/turma/${turmaId}/aluno/${aluno.aluno_id}`);
                return {
                    ...aluno,
                    notas: notasResult || { av1: null, av2: null, av3: null }
                };
            });
            
            alunosNotas = await Promise.all(promessas);
            exibirTabela();
            container.style.display = 'block';
            
        } else {
            semAlunos.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        loading.innerHTML = '<p style="color: #dc3545;">Erro ao carregar dados</p>';
    }
}

// =========================================
// EXIBIR TABELA DE NOTAS
// =========================================
function exibirTabela() {
    const tbody = document.getElementById('notasBody');
    
    tbody.innerHTML = alunosNotas.map((aluno, index) => {
        const av1 = aluno.notas.av1 !== null ? aluno.notas.av1 : '';
        const av2 = aluno.notas.av2 !== null ? aluno.notas.av2 : '';
        const av3 = aluno.notas.av3 !== null ? aluno.notas.av3 : '';
        
        const media = calcularMedia(av1, av2, av3);
        const status = determinarStatus(media);
        
        return `
            <tr>
                <td>
                    <strong>${aluno.nome}</strong><br>
                    <small style="color: #666;">${aluno.email}</small>
                </td>
                <td style="text-align: center;">
                    <input 
                        type="number" 
                        min="0" 
                        max="10" 
                        step="0.1"
                        value="${av1}"
                        data-index="${index}"
                        data-campo="av1"
                        onchange="atualizarNota(this)"
                    >
                </td>
                <td style="text-align: center;">
                    <input 
                        type="number" 
                        min="0" 
                        max="10" 
                        step="0.1"
                        value="${av2}"
                        data-index="${index}"
                        data-campo="av2"
                        onchange="atualizarNota(this)"
                    >
                </td>
                <td style="text-align: center;">
                    <input 
                        type="number" 
                        min="0" 
                        max="10" 
                        step="0.1"
                        value="${av3}"
                        data-index="${index}"
                        data-campo="av3"
                        onchange="atualizarNota(this)"
                    >
                </td>
                <td class="media-cell" style="text-align: center;" id="media-${index}">
                    ${media !== null ? media.toFixed(1) : '-'}
                </td>
                <td style="text-align: center;">
                    <span class="status-${status.toLowerCase()}" id="status-${index}">
                        ${status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// =========================================
// ATUALIZAR NOTA (quando usuário digita)
// =========================================
function atualizarNota(input) {
    const index = parseInt(input.dataset.index);
    const campo = input.dataset.campo;
    const valor = input.value === '' ? null : parseFloat(input.value);
    
    // Validar valor
    if (valor !== null && (valor < 0 || valor > 10)) {
        alert('Nota deve estar entre 0 e 10!');
        input.value = '';
        return;
    }
    
    // Atualizar no array local
    alunosNotas[index].notas[campo] = valor;
    
    // Recalcular média e status
    const av1 = alunosNotas[index].notas.av1;
    const av2 = alunosNotas[index].notas.av2;
    const av3 = alunosNotas[index].notas.av3;
    
    const media = calcularMedia(av1, av2, av3);
    const status = determinarStatus(media);
    
    // Atualizar na tela
    document.getElementById(`media-${index}`).textContent = 
        media !== null ? media.toFixed(1) : '-';
    
    const statusEl = document.getElementById(`status-${index}`);
    statusEl.textContent = status;
    statusEl.className = `status-${status.toLowerCase()}`;
}

// =========================================
// CALCULAR MÉDIA
// =========================================
function calcularMedia(av1, av2, av3) {
    const notas = [av1, av2, av3].filter(n => n !== null && n !== '');
    
    if (notas.length === 0) return null;
    
    const soma = notas.reduce((acc, nota) => acc + parseFloat(nota), 0);
    return soma / notas.length;
}

// =========================================
// DETERMINAR STATUS
// =========================================
function determinarStatus(media) {
    if (media === null) return 'Cursando';
    if (media >= 7) return 'Aprovado';
    return 'Reprovado';
}

// =========================================
// SALVAR TODAS AS NOTAS
// =========================================
async function salvarTodasNotas() {
    const botao = event.target;
    botao.disabled = true;
    botao.textContent = 'Salvando...';
    
    try {
        let erros = 0;
        let sucessos = 0;
        
        for (const aluno of alunosNotas) {
            const dados = {
                turma_id: parseInt(turmaId),
                aluno_id: aluno.aluno_id,
                av1: aluno.notas.av1,
                av2: aluno.notas.av2,
                av3: aluno.notas.av3
            };
            
            const resultado = await lancarNotas(dados);
            
            if (resultado && !resultado.error) {
                sucessos++;
            } else {
                erros++;
                console.error(`Erro ao salvar notas de ${aluno.nome}:`, resultado);
            }
        }
        
        if (erros === 0) {
            alert(`✅ Todas as notas foram salvas com sucesso!`);
        } else {
            alert(`⚠️ ${sucessos} notas salvas, ${erros} com erro. Verifique o console.`);
        }
        
    } catch (error) {
        console.error('Erro ao salvar notas:', error);
        alert('❌ Erro ao salvar notas!');
    } finally {
        botao.disabled = false;
        botao.textContent = '💾 Salvar Todas as Notas';
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
    carregarAlunosNotas();
});