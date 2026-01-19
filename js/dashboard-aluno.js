// =========================================
// VERIFICAR AUTENTICAÇÃO
// =========================================

const usuario = verificarAutenticacao();

if (!usuario || usuario.tipo_usuario !== 'aluno') {
    window.location.href = 'index.html';
}

// =========================================
// EXIBIR NOME DO USUÁRIO
// =========================================

document.getElementById('nomeUsuario').textContent = `👨‍🎓 ${usuario.nome}`;

// =========================================
// CARREGAR NOTAS DO ALUNO
// =========================================

async function carregarNotas() {
    const loading = document.getElementById('loading');
    const notasContainer = document.getElementById('notasContainer');
    const semNotas = document.getElementById('semNotas');
    
    try {
        console.log('Buscando notas do aluno ID:', usuario.id);
        
        // Buscar notas na API
        const resultado = await buscarNotasAluno(usuario.id);
        
        console.log('Resultado da API:', resultado);
        
        // Ocultar loading
        loading.style.display = 'none';
        
        if (resultado && resultado.success && resultado.notas && resultado.notas.length > 0) {
            // Exibir notas
            console.log('Exibindo', resultado.notas.length, 'nota(s)');
            exibirNotas(resultado.notas);
            notasContainer.style.display = 'grid';
        } else {
            // Sem notas
            console.log('Nenhuma nota encontrada');
            semNotas.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Erro ao carregar notas:', error);
        loading.innerHTML = '<p style="color: #dc3545;">Erro ao carregar notas</p>';
    }
}

// =========================================
// EXIBIR NOTAS NA TELA
// =========================================

function exibirNotas(notas) {
    const container = document.getElementById('notasContainer');
    
    console.log('Montando HTML para notas:', notas);
    
    container.innerHTML = notas.map(nota => `
        <div class="card">
            <div class="card-header">
                <h3>${nota.disciplina}</h3>
                <span class="badge ${nota.status ? nota.status.toLowerCase() : 'cursando'}">
                    ${nota.status || 'Cursando'}
                </span>
            </div>
            
            <div class="card-body">
                <p><strong>Turma:</strong> ${nota.turma}</p>
                <p><strong>Professor:</strong> ${nota.professor}</p>
                
                <div class="notas-grid">
                    <div class="nota-item">
                        <span class="nota-label">AV1</span>
                        <span class="nota-valor">${nota.av1 !== null ? Number(nota.av1).toFixed(1) : '-'}</span>
                    </div>
                    <div class="nota-item">
                        <span class="nota-label">AV2</span>
                        <span class="nota-valor">${nota.av2 !== null ? Number(nota.av2).toFixed(1) : '-'}</span>
                    </div>
                    <div class="nota-item">
                        <span class="nota-label">AV3</span>
                        <span class="nota-valor">${nota.av3 !== null ? Number(nota.av3).toFixed(1) : '-'}</span>
                    </div>
                    <div class="nota-item media">
                        <span class="nota-label">Média</span>
                        <span class="nota-valor">${nota.media !== null ? Number(nota.media).toFixed(1) : '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// =========================================
// INICIALIZAÇÃO
// =========================================

window.addEventListener('DOMContentLoaded', () => {
    carregarNotas();
});