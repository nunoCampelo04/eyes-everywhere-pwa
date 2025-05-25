<template>
  <div class="login-bg" :class="{ 'light-mode': !darkMode }">
    <!-- Toggle de tema no canto superior direito -->
    <button class="theme-toggle" @click="toggleTheme">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>

    <div class="page-container">
      <!-- Header elegante -->
      <div class="page-header">
        <button class="back-btn" @click="$router.back()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2 class="page-title">Detalhes da Auditoria</h2>
        <div class="header-badge" :class="getStatusClass(auditoria)">
          <i :class="getStatusIcon(auditoria)"></i>
        </div>
      </div>

      <!-- Status da auditoria -->
      <div class="status-section">
        <div class="status-badge" :class="getStatusClass(auditoria)">
          <i :class="getStatusIcon(auditoria)"></i>
          <span>{{ getStatusText(auditoria) }}</span>
        </div>
      </div>

      <!-- Informações da auditoria -->
      <div class="info-section">
        <div class="info-card">
          <div class="info-header">
            <h3 class="info-title">{{ auditoria.titulo }}</h3>
            <span class="info-type" :class="getStatusClass(auditoria)">{{ auditoria.tipo }}</span>
          </div>
          
          <div class="info-details">
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatarDataCompleta(auditoria.data) }}</span>
            </div>
            
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatarHora(auditoria.data) }}</span>
            </div>
            
            <div class="info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ auditoria.local || 'Localização não definida' }}</span>
            </div>
            
            <div class="info-item">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Prioridade: {{ auditoria.prioridade }}</span>
            </div>
          </div>
        </div>

        <div class="description-card">
          <h4 class="description-title">
            <i class="fas fa-align-left"></i>
            Descrição
          </h4>
          <p class="description-text">{{ auditoria.descricao || 'Sem descrição disponível' }}</p>
        </div>

        <!-- Progresso do trabalho -->
        <div v-if="auditoria.statusEspecialista !== 'atribuida'" class="progress-card">
          <h4 class="progress-title">
            <i class="fas fa-tasks"></i>
            Progresso do Trabalho
          </h4>
          
          <div class="progress-timeline">
            <div class="timeline-item" :class="{ completed: auditoria.statusEspecialista !== 'atribuida' }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-label">Auditoria Aceite</span>
                <span v-if="auditoria.dataAceite" class="timeline-date">{{ formatarDataHora(auditoria.dataAceite) }}</span>
              </div>
            </div>
            
            <div class="timeline-item" :class="{ completed: ['em_curso', 'concluida'].includes(auditoria.statusEspecialista) }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-label">Trabalho Iniciado</span>
                <span v-if="auditoria.dataInicio" class="timeline-date">{{ formatarDataHora(auditoria.dataInicio) }}</span>
              </div>
            </div>
            
            <div class="timeline-item" :class="{ completed: auditoria.presencaConfirmada }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-label">Presença Confirmada</span>
                <span v-if="auditoria.dataPresenca" class="timeline-date">{{ formatarDataHora(auditoria.dataPresenca) }}</span>
              </div>
            </div>
            
            <div class="timeline-item" :class="{ completed: auditoria.statusEspecialista === 'concluida' }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-label">Trabalho Concluído</span>
                <span v-if="auditoria.dataConclusao" class="timeline-date">{{ formatarDataHora(auditoria.dataConclusao) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Relatório de trabalho (se em curso ou concluída) -->
        <div v-if="['em_curso', 'concluida'].includes(auditoria.statusEspecialista)" class="work-report-card">
          <h4 class="report-title">
            <i class="fas fa-clipboard-list"></i>
            Relatório de Trabalho
          </h4>
          
          <div class="form-group">
            <label class="form-label">Descrição do Trabalho Realizado</label>
            <textarea 
              v-model="relatorioTrabalho.descricao"
              class="form-textarea"
              rows="4"
              placeholder="Descreva o trabalho realizado, observações e conclusões..."
              :disabled="auditoria.statusEspecialista === 'concluida'"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Custo do Serviço (€)</label>
            <input 
              type="number" 
              v-model="relatorioTrabalho.custo"
              class="form-input"
              placeholder="0.00"
              step="0.01"
              min="0"
              :disabled="auditoria.statusEspecialista === 'concluida'"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Tempo Gasto (horas)</label>
            <input 
              type="number" 
              v-model="relatorioTrabalho.tempoGasto"
              class="form-input"
              placeholder="0"
              step="0.5"
              min="0"
              :disabled="auditoria.statusEspecialista === 'concluida'"
            />
          </div>

          <div v-if="auditoria.statusEspecialista === 'em_curso'" class="form-actions">
            <button class="save-btn" @click="salvarRelatorio">
              <i class="fas fa-save"></i>
              Salvar Relatório
            </button>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="actions-section">
        <button 
          v-if="auditoria.statusEspecialista === 'atribuida'"
          class="action-btn accept"
          @click="aceitarAuditoria"
        >
          <i class="fas fa-check"></i>
          <span>Aceitar Auditoria</span>
        </button>
        
        <button 
          v-if="auditoria.statusEspecialista === 'aceite'"
          class="action-btn start"
          @click="iniciarAuditoria"
        >
          <i class="fas fa-play"></i>
          <span>Iniciar Trabalho</span>
        </button>
        
        <button 
          v-if="auditoria.statusEspecialista === 'em_curso' && !auditoria.presencaConfirmada"
          class="action-btn location"
          @click="confirmarPresenca"
        >
          <i class="fas fa-map-marker-alt"></i>
          <span>Confirmar Presença</span>
        </button>
        
        <button 
          v-if="auditoria.statusEspecialista === 'em_curso' && auditoria.presencaConfirmada"
          class="action-btn complete"
          @click="finalizarAuditoria"
        >
          <i class="fas fa-flag-checkered"></i>
          <span>Finalizar Trabalho</span>
        </button>

        <button 
          v-if="auditoria.statusEspecialista === 'atribuida'"
          class="action-btn reject"
          @click="rejeitarAuditoria"
        >
          <i class="fas fa-times"></i>
          <span>Rejeitar</span>
        </button>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNav />
  </div>
</template>

<script>
import BottomNav from '../../components/BottomNav.vue'

export default {
  name: 'EspecialistaDetalhe',
  components: { BottomNav },
  data() {
    return {
      auditoria: {
        id: null,
        titulo: '',
        tipo: '',
        data: '',
        local: '',
        descricao: '',
        prioridade: '',
        statusEspecialista: 'atribuida',
        presencaConfirmada: false
      },
      relatorioTrabalho: {
        descricao: '',
        custo: 0,
        tempoGasto: 0
      },
      darkMode: true
    }
  },
  mounted() {
    this.loadTheme()
    this.carregarAuditoria()
  },
  methods: {
    loadTheme() {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.darkMode = savedTheme === 'dark'
      }
    },
    
    toggleTheme() {
      this.darkMode = !this.darkMode
      localStorage.setItem('theme', this.darkMode ? 'dark' : 'light')
    },

    carregarAuditoria() {
      const id = this.$route.params.id
      const auditorias = JSON.parse(localStorage.getItem('auditoriasEspecialista') || '[]')
      const auditoria = auditorias.find(a => a.id == id)
      
      if (auditoria) {
        this.auditoria = { ...auditoria }
        
        // Carregar relatório se existir
        if (auditoria.relatorioTrabalho) {
          this.relatorioTrabalho = { ...auditoria.relatorioTrabalho }
        }
      } else {
        this.$router.back()
      }
    },

    formatarDataCompleta(dataStr) {
      const data = new Date(dataStr)
      return data.toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },

    formatarHora(dataStr) {
      const data = new Date(dataStr)
      return `${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`
    },

    formatarDataHora(dataStr) {
      const data = new Date(dataStr)
      return data.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusClass(auditoria) {
      switch (auditoria.statusEspecialista) {
        case 'atribuida': return 'pending'
        case 'aceite': return 'accepted'
        case 'em_curso': return 'active'
        case 'concluida': return 'completed'
        default: return 'pending'
      }
    },

    getStatusIcon(auditoria) {
      switch (auditoria.statusEspecialista) {
        case 'atribuida': return 'fas fa-clock'
        case 'aceite': return 'fas fa-thumbs-up'
        case 'em_curso': return 'fas fa-play'
        case 'concluida': return 'fas fa-check'
        default: return 'fas fa-question'
      }
    },

    getStatusText(auditoria) {
      switch (auditoria.statusEspecialista) {
        case 'atribuida': return 'Aguarda Aceitação'
        case 'aceite': return 'Aceite - Pronto para Iniciar'
        case 'em_curso': return 'Trabalho em Curso'
        case 'concluida': return 'Trabalho Concluído'
        default: return 'Estado Desconhecido'
      }
    },

    aceitarAuditoria() {
      if (confirm('Aceitar esta auditoria?')) {
        this.auditoria.statusEspecialista = 'aceite'
        this.auditoria.dataAceite = new Date().toISOString()
        this.salvarAuditoria()
        this.showSuccess('Auditoria aceite com sucesso!')
      }
    },

    iniciarAuditoria() {
      if (confirm('Iniciar o trabalho desta auditoria?')) {
        this.auditoria.statusEspecialista = 'em_curso'
        this.auditoria.dataInicio = new Date().toISOString()
        this.salvarAuditoria()
        this.showSuccess('Trabalho iniciado!')
      }
    },

    confirmarPresenca() {
      this.$router.push(`/especialista/confirmar-presenca/${this.auditoria.id}`)
    },

    finalizarAuditoria() {
      if (!this.relatorioTrabalho.descricao.trim()) {
        alert('Por favor, preencha a descrição do trabalho realizado.')
        return
      }

      if (this.relatorioTrabalho.custo <= 0) {
        alert('Por favor, indique o custo do serviço.')
        return
      }

      if (confirm('Finalizar este trabalho? Esta ação não pode ser desfeita.')) {
        this.auditoria.statusEspecialista = 'concluida'
        this.auditoria.dataConclusao = new Date().toISOString()
        this.auditoria.relatorioTrabalho = { ...this.relatorioTrabalho }
        this.salvarAuditoria()
        this.showSuccess('Trabalho finalizado com sucesso!')
      }
    },

    rejeitarAuditoria() {
      if (confirm('Tem certeza que deseja rejeitar esta auditoria?')) {
        // Remover da lista do especialista
        let auditorias = JSON.parse(localStorage.getItem('auditoriasEspecialista') || '[]')
        auditorias = auditorias.filter(a => a.id !== this.auditoria.id)
        localStorage.setItem('auditoriasEspecialista', JSON.stringify(auditorias))
        
        this.$router.back()
      }
    },

    salvarRelatorio() {
      this.auditoria.relatorioTrabalho = { ...this.relatorioTrabalho }
      this.salvarAuditoria()
      this.showSuccess('Relatório salvo!')
    },

    salvarAuditoria() {
      let auditorias = JSON.parse(localStorage.getItem('auditoriasEspecialista') || '[]')
      const index = auditorias.findIndex(a => a.id === this.auditoria.id)
      
      if (index !== -1) {
        auditorias[index] = { ...this.auditoria }
        localStorage.setItem('auditoriasEspecialista', JSON.stringify(auditorias))
      }
    },

    showSuccess(message) {
      alert(message)
    }
  }
}
</script>

<style scoped>
/* Variáveis CSS para temas - IGUAIS AO LOGIN */
:root {
  --bg-primary: #0a0f1a;
  --bg-secondary: #132340;
  --text-primary: #ffffff;
  --text-secondary: #aad1ff;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
  --success-primary: #10b981;
  --success-secondary: #059669;
  --warning-primary: #f59e0b;
  --warning-secondary: #ea580c;
  --danger-primary: #ef4444;
  --danger-secondary: #dc2626;
}

.light-mode {
  --bg-primary: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  --bg-secondary: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
  --success-primary: #10b981;
  --success-secondary: #059669;
  --warning-primary: #f59e0b;
  --warning-secondary: #ea580c;
  --danger-primary: #ef4444;
  --danger-secondary: #dc2626;
}

/* Background principal - IGUAL AO LOGIN */
.login-bg {
  background: var(--bg-primary);
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  transition: all 0.5s ease;
  padding: 10px 10px 80px 10px;
}

.login-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 80%, rgba(39, 122, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Toggle de tema - IGUAL AO LOGIN */
.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Container principal - IGUAL AO LOGIN */
.page-container {
  background: var(--bg-secondary);
  padding: 24px 20px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.5s ease;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.back-btn:hover {
  background: var(--accent-primary);
  color: white;
  transform: scale(1.05);
}

.page-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.header-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.header-badge.pending {
  background: linear-gradient(135deg, var(--warning-primary), var(--warning-secondary));
}

.header-badge.accepted {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.header-badge.active {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.header-badge.completed {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
}

/* Status Section */
.status-section {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.status-badge.pending {
  background: linear-gradient(135deg, var(--warning-primary), var(--warning-secondary));
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.status-badge.accepted {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.status-badge.active {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.3);
}

.status-badge.completed {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.description-card,
.progress-card,
.work-report-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.info-header {
  margin-bottom: 16px;
}

.info-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-family: 'Poppins', sans-serif;
}

.info-type {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.info-type.pending {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning-primary);
}

.info-type.accepted {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.info-type.active {
  background: rgba(39, 122, 255, 0.2);
  color: var(--accent-primary);
}

.info-type.completed {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-primary);
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
}

.info-item i {
  width: 16px;
  color: var(--accent-primary);
  font-size: 12px;
}

.description-title,
.progress-title,
.report-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.description-title i,
.progress-title i,
.report-title i {
  color: var(--accent-primary);
  font-size: 12px;
}

.description-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Progress Timeline */
.progress-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 20px;
  bottom: -16px;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.timeline-item.completed:not(:last-child)::after {
  background: var(--success-primary);
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.3s ease;
}

.timeline-item.completed .timeline-dot {
  background: var(--success-primary);
  border-color: var(--success-primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.timeline-date {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* Form Elements */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
}

.form-input,
.form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  resize: none;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(39, 122, 255, 0.1);
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  min-height: 80px;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.save-btn {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.4);
}

/* Actions Section */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: 'Poppins', sans-serif;
}

.action-btn.accept {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-primary);
}

.action-btn.accept:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--success-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-btn.start {
  background: rgba(39, 122, 255, 0.1);
  border-color: rgba(39, 122, 255, 0.3);
  color: var(--accent-primary);
}

.action-btn.start:hover {
  background: rgba(39, 122, 255, 0.2);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.3);
}

.action-btn.location {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: var(--warning-primary);
}

.action-btn.location:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: var(--warning-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.action-btn.complete {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-primary);
}

.action-btn.complete:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--success-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-btn.reject {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--danger-primary);
}

.action-btn.reject:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--danger-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Responsividade */
@media (max-width: 480px) {
  .login-bg {
    padding: 5px 5px 80px 5px;
  }

  .page-container {
    margin: 0;
    padding: 20px 16px;
    border-radius: 16px;
    max-width: 100%;
  }

  .theme-toggle {
    width: 35px;
    height: 35px;
    top: 10px;
    right: 10px;
    font-size: 14px;
  }

  .page-title {
    font-size: 16px;
  }

  .info-title {
    font-size: 16px;
  }

  .info-card,
  .description-card,
  .progress-card,
  .work-report-card {
    padding: 16px;
  }

  .action-btn {
    padding: 14px;
    font-size: 15px;
  }

  .timeline-item {
    gap: 10px;
  }

  .timeline-dot {
    width: 14px;
    height: 14px;
  }
}

/* Animação de entrada */
.page-container {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
