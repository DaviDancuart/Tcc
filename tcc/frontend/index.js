// script.js

// Estado da aplicação
let currentUser = null;
let exames = [];

// Dados simulados
const mockExames = [
    {
        id: 1,
        paciente: "João Silva",
        tipo: "Raio-X Tórax",
        data: "15/03/2026",
        status: "pronto",
        imagem: "RX-Torax",
        diagnostico: "Módulo de 2cm detectado no lobo superior direito. Padrão radiológico sugestivo de processo inflamatório/infeccioso.",
        medico: "Dr. Roberto Almeida",
        recomendacao: "1. Antibioticoterapia por 14 dias (Amoxicilina 500mg 8/8h)\n2. Repouso relativo por 7 dias\n3. Retorno em 30 dias"
    },
    {
        id: 2,
        paciente: "Maria Santos",
        tipo: "Ultrassom Abdômen",
        data: "10/03/2026",
        status: "pendente",
        imagem: "US-Abdomen"
    },
    {
        id: 3,
        paciente: "Pedro Oliveira",
        tipo: "Ressonância Magnética",
        data: "05/03/2026",
        status: "pronto",
        imagem: "RM-Cerebro",
        diagnostico: "Sem alterações significativas. Exame dentro dos padrões de normalidade.",
        medico: "Dra. Carla Souza",
        recomendacao: "Manter acompanhamento regular. Novo exame em 12 meses."
    }
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarDadosIniciais();
    configurarEventListeners();
});

function carregarDadosIniciais() {
    exames = [...mockExames]; //Faz uma cópia do array para evitar mutações diretas
}

// Configuração de event listeners
function configurarEventListeners() {
    // Select de cadastro
    const selectTipo = document.getElementById('cadastro-tipo');
    if (selectTipo) {
        selectTipo.addEventListener('change', function() {
            const campoCRM = document.getElementById('campo-crm');
            if (this.value === 'medico') {
                campoCRM.style.display = 'block';
            } else {
                campoCRM.style.display = 'none';
            }
        });
    }

    // Upload area drag and drop
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        uploadArea.addEventListener('drop', handleDrop, false);
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) uploadArea.classList.add('dragover');
}

function unhighlight() {
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        handleFiles(files);
    }
}

function handleFiles(files) {
    console.log('Arquivos selecionados:', files);
    mostrarNotificacao(`${files.length} arquivo(s) selecionado(s) para upload`, 'success');
    
    // Simular upload
    setTimeout(() => {
        mostrarNotificacao('Upload concluído! Iniciando análise...', 'success');
    }, 2000);
}

// Funções de navegação
function showScreen(screenId) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar a tela selecionada
    const targetScreen = document.getElementById('screen-' + screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Atualizar header baseado no usuário
    atualizarHeader();
}

function atualizarHeader() {
    const navButtons = document.querySelector('.nav-buttons');
    if (!navButtons) return;
    
    if (currentUser) {
        let badgeClass = 'user-badge';
        let icon = '';
        
        switch(currentUser.tipo) {
            case 'medico':
                badgeClass += ' medico';
                icon = '👨‍⚕️';
                break;
            case 'paciente':
                badgeClass += ' paciente';
                icon = '👤';
                break;
            case 'admin':
                badgeClass += ' admin';
                icon = '👑';
                break;
        }
        
        navButtons.innerHTML = `
            <span class="${badgeClass}">
                ${icon} ${currentUser.nome || currentUser.tipo}
            </span>
            <button class="btn btn-outline" onclick="logout()">Sair</button>
        `;
    } else {
        navButtons.innerHTML = `
            <button class="btn btn-primary" onclick="showScreen('teste')">Teste</button>
            <button class="btn btn-outline" onclick="showScreen('login')">Login</button>
            <button class="btn btn-primary" onclick="showScreen('cadastro')">Cadastro</button>
        `;
    }
}

// Função de login
function fazerLogin() {
    const tipo = document.getElementById('login-type').value;
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-password').value;
    
    if (!email || !senha) {
        mostrarNotificacao('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    // Simular validação de login
    mostrarLoading(true);
    
    setTimeout(() => {
        mostrarLoading(false);
        
        // Criar usuário simulado
        currentUser = {
            id: 1,
            nome: tipo === 'medico' ? 'Dr. Roberto Almeida' : 
                  tipo === 'paciente' ? 'João Silva' : 'Admin Master',
            email: email,
            tipo: tipo,
            crm: tipo === 'medico' ? '12345' : null
        };
        
        // Redirecionar baseado no tipo
        if (tipo === 'medico') {
            showScreen('medico-upload');
            carregarDiagnosticosPendentes();
        } else if (tipo === 'paciente') {
            showScreen('paciente');
            carregarExamesPaciente();
        } else if (tipo === 'admin') {
            showScreen('admin-dashboard');
            carregarDadosAdmin();
        }
        
        mostrarNotificacao(`Bem-vindo, ${currentUser.nome}!`, 'success');
    }, 1500);
}

function logout() {
    currentUser = null;
    showScreen('home');
    mostrarNotificacao('Logout realizado com sucesso!', 'info');
}

// Funções para médico
function showMedicoScreen(screen) {
    const contentDiv = document.getElementById('medico-upload-content');
    if (!contentDiv) return;
    
    switch(screen) {
        case 'upload':
            contentDiv.innerHTML = gerarTelaUpload();
            break;
        case 'diagnosticos':
            contentDiv.innerHTML = gerarTelaDiagnosticos();
            break;
        case 'pacientes':
            contentDiv.innerHTML = gerarTelaPacientes();
            break;
    }
    
    // Atualizar menu ativo
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.classList.remove('active');
    });
    event.target.classList.add('active');
}

function gerarTelaUpload() {
    return `
        <h2 style="margin-bottom: 20px;">Novo Exame - Upload de Imagem</h2>
        <div class="form-group">
            <label>Selecionar Paciente</label>
            <select id="select-paciente">
                <option value="">Selecione um paciente...</option>
                <option value="1">João Silva - ID: 12345</option>
                <option value="2">Maria Santos - ID: 12346</option>
                <option value="3">Pedro Oliveira - ID: 12347</option>
            </select>
        </div>
        <div class="upload-area" onclick="simularUpload()">
            <div class="upload-icon">📁</div>
            <h3>Clique para fazer upload</h3>
            <p>ou arraste e solte (DICOM, JPEG, PNG)</p>
            <p style="font-size: 12px; margin-top: 10px;">Máximo: 50MB</p>
        </div>
        <div class="form-group" style="margin-top: 20px;">
            <label>Observações</label>
            <textarea id="observacoes" rows="4" placeholder="Observações iniciais sobre o exame..."></textarea>
        </div>
        <button class="btn btn-primary" onclick="enviarExame()">Enviar para Análise</button>
    `;
}

function gerarTelaDiagnosticos() {
    const pendentes = exames.filter(e => e.status === 'pendente');
    
    return `
        <h2 style="margin-bottom: 20px;">Diagnósticos Pendentes (${pendentes.length})</h2>
        <div class="exam-list">
            ${pendentes.length > 0 ? pendentes.map(exame => `
                <div class="exam-item">
                    <div>
                        <h4>${exame.paciente} - ${exame.tipo}</h4>
                        <p>Enviado: ${exame.data}</p>
                    </div>
                    <span class="exam-status status-pending">Aguardando validação</span>
                    <button class="btn btn-primary" onclick="validarDiagnostico(${exame.id})">Validar</button>
                </div>
            `).join('') : `
                <div class="alert alert-success">
                    Nenhum diagnóstico pendente no momento.
                </div>
            `}
        </div>
    `;
}

function gerarTelaPacientes() {
    return `
        <h2 style="margin-bottom: 20px;">Meus Pacientes</h2>
        <div class="form-group">
            <input type="text" placeholder="Buscar paciente..." onkeyup="buscarPaciente(this.value)">
        </div>
        <div class="exam-list" id="lista-pacientes">
            ${gerarListaPacientes()}
        </div>
    `;
}

function gerarListaPacientes(filtro = '') {
    const pacientes = [...new Set(exames.map(e => e.paciente))];
    const pacientesFiltrados = filtro ? 
        pacientes.filter(p => p.toLowerCase().includes(filtro.toLowerCase())) : 
        pacientes;
    
    return pacientesFiltrados.map(paciente => {
        const examesPaciente = exames.filter(e => e.paciente === paciente);
        const ultimoExame = examesPaciente[examesPaciente.length - 1];
        
        return `
            <div class="exam-item">
                <div>
                    <h4>${paciente}</h4>
                    <p>Total de exames: ${examesPaciente.length}</p>
                    <p>Último exame: ${ultimoExame.data} - ${ultimoExame.tipo}</p>
                </div>
                <button class="btn btn-outline" onclick="verHistoricoPaciente('${paciente}')">Ver histórico</button>
            </div>
        `;
    }).join('');
}

function buscarPaciente(valor) {
    const lista = document.getElementById('lista-pacientes');
    if (lista) {
        lista.innerHTML = gerarListaPacientes(valor);
    }
}

function verHistoricoPaciente(paciente) {
    const examesPaciente = exames.filter(e => e.paciente === paciente);
    mostrarModal('histórico', `
        <h2>Histórico de ${paciente}</h2>
        <div class="exam-list">
            ${examesPaciente.map(exame => `
                <div class="exam-item">
                    <div>
                        <h4>${exame.tipo}</h4>
                        <p>Data: ${exame.data}</p>
                    </div>
                    <span class="exam-status status-${exame.status}">
                        ${exame.status === 'pronto' ? 'Concluído' : 'Pendente'}
                    </span>
                    <button class="btn btn-outline" onclick="verDiagnostico(${exame.id})">Ver</button>
                </div>
            `).join('')}
        </div>
    `);
}

// Funções para paciente
function showPacienteScreen(screen) {
    const mainContent = document.querySelector('#screen-paciente .main-content');
    if (!mainContent) return;
    
    switch(screen) {
        case 'exames':
            mainContent.innerHTML = gerarTelaExamesPaciente();
            break;
        case 'perfil':
            mainContent.innerHTML = gerarTelaPerfilPaciente();
            break;
    }
}

function gerarTelaExamesPaciente() {
    const examesPaciente = exames.filter(e => e.paciente === (currentUser?.nome || 'João Silva'));
    
    return `
        <h2 style="margin-bottom: 20px;">Meus Exames</h2>
        <div class="exam-list">
            ${examesPaciente.map(exame => `
                <div class="exam-item">
                    <div>
                        <h4>${exame.tipo}</h4>
                        <p>Data: ${exame.data}</p>
                    </div>
                    <span class="exam-status status-${exame.status}">
                        ${exame.status === 'pronto' ? 'Diagnóstico pronto' : 'Aguardando análise'}
                    </span>
                    <button class="btn btn-outline" 
                            onclick="verDiagnostico(${exame.id})"
                            ${exame.status !== 'pronto' ? 'disabled' : ''}>
                        ${exame.status === 'pronto' ? 'Ver detalhes' : 'Aguardando'}
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function gerarTelaPerfilPaciente() {
    return `
        <h2 style="margin-bottom: 20px;">Meu Perfil</h2>
        <div class="form-container" style="max-width: 100%;">
            <div class="form-group">
                <label>Nome completo</label>
                <input type="text" value="${currentUser?.nome || 'João da Silva'}" disabled>
            </div>
            <div class="form-group">
                <label>E-mail</label>
                <input type="email" value="${currentUser?.email || 'joao.silva@email.com'}" disabled>
            </div>
            <div class="form-group">
                <label>CPF</label>
                <input type="text" value="123.456.789-00" disabled>
            </div>
            <div class="form-group">
                <label>Data de Nascimento</label>
                <input type="text" value="15/05/1980" disabled>
            </div>
            <div class="form-group">
                <label>Telefone</label>
                <input type="text" value="(11) 98765-4321" disabled>
            </div>
            <div class="form-group">
                <label>Endereço</label>
                <input type="text" value="Rua das Flores, 123 - São Paulo/SP" disabled>
            </div>
            <button class="btn btn-primary" onclick="editarPerfil()">Editar informações</button>
        </div>
    `;
}

// Funções de diagnóstico
function verDiagnostico(id) {
    const exame = exames.find(e => e.id === id);
    if (!exame) return;
    
    showScreen('diagnostico');
    carregarDiagnostico(exame);
}

function verDiagnosticoPorId(id) {
    verDiagnostico(id);
}

function carregarDiagnostico(exame) {
    const diagnosticoScreen = document.getElementById('screen-diagnostico');
    if (!diagnosticoScreen) return;
    
    diagnosticoScreen.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <button class="btn btn-outline" onclick="voltarParaDashboard()" style="margin-bottom: 20px;">
                ← Voltar
            </button>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Diagnóstico - ${exame.tipo}</h2>
                <span class="exam-status status-${exame.status}">
                    ${exame.status === 'pronto' ? 'Concluído' : 'Em análise'}
                </span>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 15px; padding: 30px; margin-bottom: 20px;">
                <h3 style="color: #667eea; margin-bottom: 15px;">Imagem do Exame</h3>
                <div style="background: #e2e8f0; height: 250px; border-radius: 10px; 
                            display: flex; align-items: center; justify-content: center;">
                    🖼️ [${exame.imagem || 'Imagem do exame'}]
                </div>
            </div>

            ${exame.diagnostico ? `
                <div style="background: #f8f9fa; border-radius: 15px; padding: 30px; margin-bottom: 20px;">
                    <h3 style="color: #667eea; margin-bottom: 15px;">Diagnóstico</h3>
                    <p style="line-height: 1.8;">${exame.diagnostico}</p>
                    ${exame.medico ? `
                        <p style="margin-top: 15px; font-style: italic; color: #718096;">
                            *Laudo validado por ${exame.medico}
                        </p>
                    ` : ''}
                </div>
            ` : ''}

            ${exame.recomendacao ? `
                <div style="background: #f8f9fa; border-radius: 15px; padding: 30px;">
                    <h3 style="color: #667eea; margin-bottom: 15px;">Recomendação de Tratamento</h3>
                    <p style="line-height: 1.8; white-space: pre-line;">${exame.recomendacao}</p>
                </div>
            ` : ''}

            <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: flex-end;">
                <button class="btn btn-outline" onclick="gerarPDF(${exame.id})">
                    📥 Baixar PDF
                </button>
                <button class="btn btn-primary" onclick="imprimirDiagnostico()">
                    🖨️ Imprimir
                </button>
                ${currentUser?.tipo === 'medico' ? `
                    <button class="btn btn-secondary" onclick="editarDiagnostico(${exame.id})">
                        ✏️ Editar
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function validarDiagnostico(id) {
    const exame = exames.find(e => e.id === id);
    if (exame) {
        verDiagnostico(id);
        mostrarNotificacao('Validando diagnóstico...', 'info');
    }
}

function editarDiagnostico(id) {
    const exame = exames.find(e => e.id === id);
    if (!exame) return;
    
    mostrarModal('editar', `
        <h2>Editar Diagnóstico</h2>
        <div class="form-group">
            <label>Diagnóstico</label>
            <textarea id="edit-diagnostico" rows="6">${exame.diagnostico || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Recomendação de Tratamento</label>
            <textarea id="edit-recomendacao" rows="6">${exame.recomendacao || ''}</textarea>
        </div>
        <div class="flex gap-10">
            <button class="btn btn-primary" onclick="salvarDiagnostico(${id})">Salvar</button>
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
        </div>
    `);
}

function salvarDiagnostico(id) {
    const exame = exames.find(e => e.id === id);
    if (exame) {
        exame.diagnostico = document.getElementById('edit-diagnostico')?.value;
        exame.recomendacao = document.getElementById('edit-recomendacao')?.value;
        exame.status = 'pronto';
        exame.medico = currentUser?.nome;
        
        fecharModal();
        carregarDiagnostico(exame);
        mostrarNotificacao('Diagnóstico salvo com sucesso!', 'success');
    }
}

// Funções de upload
function simularUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.dcm';
    input.multiple = true;
    input.onchange = (e) => handleFiles(e.target.files);
    input.click();
}

function enviarExame() {
    const paciente = document.getElementById('select-paciente')?.value;
    const observacoes = document.getElementById('observacoes')?.value;
    
    if (!paciente) {
        mostrarNotificacao('Selecione um paciente', 'error');
        return;
    }
    
    mostrarLoading(true);
    
    setTimeout(() => {
        mostrarLoading(false);
        
        // Criar novo exame
        const novoExame = {
            id: exames.length + 1,
            paciente: document.querySelector('#select-paciente option:checked')?.text.split(' - ')[0],
            tipo: 'Novo Exame',
            data: new Date().toLocaleDateString('pt-BR'),
            status: 'pendente',
            imagem: 'Novo-Exame'
        };
        
        exames.push(novoExame);
        mostrarNotificacao('Exame enviado com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById('observacoes').value = '';
    }, 2000);
}

// Funções auxiliares
function mostrarLoading(show) {
    let loader = document.getElementById('loading-spinner');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loading-spinner';
            loader.className = 'spinner';
            loader.style.position = 'fixed';
            loader.style.top = '50%';
            loader.style.left = '50%';
            loader.style.transform = 'translate(-50%, -50%)';
            loader.style.zIndex = '9999';
            document.body.appendChild(loader);
        }
    } else if (loader) {
        loader.remove();
    }
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `alert alert-${tipo}`;
    notificacao.style.position = 'fixed';
    notificacao.style.top = '20px';
    notificacao.style.right = '20px';
    notificacao.style.maxWidth = '300px';
    notificacao.style.zIndex = '10000';
    notificacao.style.animation = 'slideIn 0.3s ease';
    notificacao.innerHTML = `
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 18px;">&times;</button>
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        if (notificacao.parentElement) {
            notificacao.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notificacao.remove(), 300);
        }
    }, 5000);
}

function mostrarModal(titulo, conteudo) {
    let modal = document.getElementById('modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close" onclick="fecharModal()">&times;</span>
                <div id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('modal-body').innerHTML = conteudo;
    modal.classList.add('active');
}

function fecharModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function voltarParaDashboard() {
    if (currentUser?.tipo === 'medico') {
        showScreen('medico-upload');
    } else if (currentUser?.tipo === 'paciente') {
        showScreen('paciente');
    } else {
        showScreen('home');
    }
}

function gerarPDF(id) {
    mostrarLoading(true);
    setTimeout(() => {
        mostrarLoading(false);
        mostrarNotificacao('PDF gerado com sucesso!', 'success');
    }, 1500);
}

function imprimirDiagnostico() {
    window.print();
    mostrarNotificacao('Enviando para impressão...', 'info');
}

function editarPerfil() {
    mostrarNotificacao('Funcionalidade em desenvolvimento', 'info');
}

function carregarDiagnosticosPendentes() {
    // Já é feito no showMedicoScreen
}

function carregarExamesPaciente() {
    // Já é feito no showPacienteScreen
}

function carregarDadosAdmin() {
    const mainContent = document.querySelector('#screen-admin-dashboard .main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <h2>Dashboard Administrativo</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total de Usuários</h3>
                    <div class="stat-value">1,234</div>
                </div>
                <div class="stat-card">
                    <h3>Exames Hoje</h3>
                    <div class="stat-value">56</div>
                </div>
                <div class="stat-card">
                    <h3>Médicos Ativos</h3>
                    <div class="stat-value">45</div>
                </div>
                <div class="stat-card">
                    <h3>Pacientes</h3>
                    <div class="stat-value">1,189</div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 15px; padding: 30px;">
                <h3 style="margin-bottom: 20px;">Atividades Recentes</h3>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-date">10:30</div>
                        <div class="timeline-title">Novo exame enviado</div>
                        <div class="timeline-description">Dr. Silva - Paciente João</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">09:45</div>
                        <div class="timeline-title">Diagnóstico validado</div>
                        <div class="timeline-description">Dra. Santos - Raio-X</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">08:20</div>
                        <div class="timeline-title">Novo cadastro</div>
                        <div class="timeline-description">Paciente Maria Oliveira</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);