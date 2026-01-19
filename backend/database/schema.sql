-- ============================================
-- SISTEMA ESCOLAR - BANCO DE DADOS
-- ============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS sistema_escolar;
USE sistema_escolar;

-- ============================================
-- TABELA: usuarios
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('aluno', 'professor') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: disciplinas
-- ============================================

CREATE TABLE IF NOT EXISTS disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

-- ============================================
-- TABELA: turmas
-- ============================================

CREATE TABLE IF NOT EXISTS turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    disciplina_id INT NOT NULL,
    professor_id INT NOT NULL,
    ano INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: matriculas
-- ============================================

CREATE TABLE IF NOT EXISTS matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    turma_id INT NOT NULL,
    data_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_matricula (aluno_id, turma_id)
);

-- ============================================
-- TABELA: notas (COM CÁLCULOS AUTOMÁTICOS)
-- ============================================

CREATE TABLE IF NOT EXISTS notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricula_id INT NOT NULL,
    av1 DECIMAL(4,2) DEFAULT NULL,
    av2 DECIMAL(4,2) DEFAULT NULL,
    av3 DECIMAL(4,2) DEFAULT NULL,
    
    -- Média calculada automaticamente
    media DECIMAL(4,2) AS (
        CASE 
            WHEN av1 IS NOT NULL AND av2 IS NOT NULL AND av3 IS NOT NULL 
            THEN (av1 + av2 + av3) / 3
            ELSE NULL
        END
    ) STORED,
    
    -- Status calculado automaticamente
    status VARCHAR(20) AS (
        CASE 
            WHEN (av1 + av2 + av3) / 3 >= 7 THEN 'Aprovado'
            WHEN (av1 + av2 + av3) / 3 < 7 THEN 'Reprovado'
            ELSE 'Pendente'
        END
    ) STORED,
    
    data_lancamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_nota (matricula_id)
);

-- ============================================
-- DADOS DE EXEMPLO (SEEDS)
-- ============================================

-- Inserir disciplinas
INSERT INTO disciplinas (nome) VALUES
('Matemática'),
('Português'),
('História'),
('Geografia'),
('Ciências');

-- Inserir usuários de teste
-- NOTA: Em produção, use senhas criptografadas!
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES
('Professor João Silva', 'joao@escola.com', '123456', 'professor'),
('Professora Maria Santos', 'maria@escola.com', '123456', 'professor'),
('Aluno Pedro Oliveira', 'pedro@escola.com', '123456', 'aluno'),
('Aluna Ana Costa', 'ana@escola.com', '123456', 'aluno'),
('Aluno Carlos Lima', 'carlos@escola.com', '123456', 'aluno');

-- Criar turmas
INSERT INTO turmas (nome, disciplina_id, professor_id, ano) VALUES
('Turma A', 1, 1, 2025), -- Matemática - Prof. João
('Turma B', 2, 2, 2025), -- Português - Profa. Maria
('Turma A', 3, 1, 2025); -- História - Prof. João

-- Matricular alunos
INSERT INTO matriculas (aluno_id, turma_id) VALUES
(3, 1), -- Pedro em Matemática
(3, 2), -- Pedro em Português
(4, 1), -- Ana em Matemática
(4, 3), -- Ana em História
(5, 2); -- Carlos em Português

-- Lançar algumas notas
INSERT INTO notas (matricula_id, av1, av2, av3) VALUES
(1, 8.0, 7.5, 9.0),  -- Pedro em Matemática: Média 8.17 - Aprovado
(2, 6.0, 5.5, 6.5),  -- Pedro em Português: Média 6.0 - Reprovado
(3, 9.0, 8.5, 9.5),  -- Ana em Matemática: Média 9.0 - Aprovado
(4, 7.0, 7.5, 7.0);  -- Ana em História: Média 7.17 - Aprovado

-- ============================================
-- CONSULTAS ÚTEIS PARA TESTES
-- ============================================

-- Ver todas as notas com cálculo automático
SELECT 
    u.nome AS aluno,
    d.nome AS disciplina,
    n.av1,
    n.av2,
    n.av3,
    n.media,
    n.status
FROM notas n
INNER JOIN matriculas m ON n.matricula_id = m.id
INNER JOIN usuarios u ON m.aluno_id = u.id
INNER JOIN turmas t ON m.turma_id = t.id
INNER JOIN disciplinas d ON t.disciplina_id = d.id;

-- Ver turmas de um professor
SELECT 
    t.id,
    t.nome AS turma,
    d.nome AS disciplina,
    COUNT(m.id) AS total_alunos
FROM turmas t
INNER JOIN disciplinas d ON t.disciplina_id = d.id
LEFT JOIN matriculas m ON t.id = m.turma_id
WHERE t.professor_id = 1
GROUP BY t.id;

-- Ver notas de um aluno
SELECT 
    d.nome AS disciplina,
    t.nome AS turma,
    u.nome AS professor,
    n.av1,
    n.av2,
    n.av3,
    n.media,
    n.status
FROM matriculas m
INNER JOIN turmas t ON m.turma_id = t.id
INNER JOIN disciplinas d ON t.disciplina_id = d.id
INNER JOIN usuarios u ON t.professor_id = u.id
LEFT JOIN notas n ON m.id = n.matricula_id
WHERE m.aluno_id = 3;