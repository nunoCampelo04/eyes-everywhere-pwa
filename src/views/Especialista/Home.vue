<template>
  <div class="login-bg" :class="{ 'light-mode': !darkMode }">
    <!-- Toggle de tema no canto superior direito -->
    <button class="theme-toggle" @click="toggleTheme">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>

    <div class="page-container">
      <!-- Header com perfil do especialista -->
      <div class="profile-header">
        <div class="profile-info">
          <div class="avatar-container">
            <div class="avatar-ring">
              <img :src="especialista.avatar || '../assets/user-icon.png'" :alt="especialista.nome" class="avatar" />
            </div>
            <div class="status-indicator online"></div>
          </div>
          <div class="profile-details">
            <h2 class="profile-name">{{ especialista.nome }}</h2>
            <p class="profile-area">{{ especialista.area || 'Especialista' }}</p>
            <div class="profile-stats">
              <span class="stat-item">
                <i class="fas fa-tasks"></i>
                {{ auditoriasAtribuidas.length }} atribuídas
              </span>
            </div>
          </div>
        </div>
        <button class="settings-btn" @click="$router.push('/perfil')">
          <i class="fas fa-cog"></i>
        </button>
      </div>

      <!-- Estatísticas rápidas -->
      <div class="stats-container">
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ auditoriasPendentes.length }}</span>
            <span class="stat-label">Pendentes</span>
          </div>
        </div>
        
        <div class="stat-card active">
          <div class="stat-icon">
            <i class="fas fa-play"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ auditoriasEmAndamento.length }}</span>
            <span class="stat-label">Em Curso</span>
          </div>
        </div>
        
        <div class="stat-card completed">
          <div class="stat-icon">
            <i class="fas fa-check"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ auditoriasConcluidas.length }}</span>
            <span class="stat-label">Concluídas</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            :class="{ active: filtroAtivo === 'todas' }"
            @click="filtroAtivo = 'todas'"
          >
            Todas
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: filtroAtivo === 'pendentes' }"
            @click="filtroAtivo = 'pendentes'"
          >
            Pendentes
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: filtroAtivo === 'andamento' }"
            @click="filtroAtivo = 'andamento'"
          >
            Em Curso
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: filtroAtivo === 'concluidas' }"
            @click="filtroAtivo = 'concluidas'"
          >
            Concluídas
          </button>
        </div>
      </div>

      <!-- Lista de auditorias -->
      <div class="auditorias-container">
        <div v-if="auditoriasFiltradas.length === 0" class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <h3>Nenhuma auditoria encontrada</h3>
          <p>{{ getEmptyMessage() }}</p>
        </div>
        
        <div v-else class="auditorias-list">
          <div 
            class="auditoria-card" 
            v-for="auditoria in auditoriasFiltradas" 
            :key="auditoria.id" 
            :class="getAuditoriaStatusClass(auditoria)"
             @click="$router.push('/detalhe/especialista/' + auditoria.id)"
          >
            <div class="auditoria-header">
              <div class="auditoria-date">
                <span class="date-day">{{ formatarData(auditoria.data).dia }}</span>
                <span class="date-month">{{ formatarData(auditoria.data).mes }}</span>
              </div>
              <div class="auditoria-status">
                <span class="status-badge" :class="getStatusClass(auditoria)">
                  <i :class="getStatusIcon(auditoria)"></i>
                  {{ getStatusText(auditoria) }}
                </span>
              </div>
            </div>
            
            <div class="auditoria-content">
              <h3 class="auditoria-title">{{ auditoria.titulo }}</h3>
              <div class="auditoria-details">
                <div class="detail-item">
                  <i class="fas fa-tag"></i>
                  <span>{{ auditoria.tipo }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ auditoria.local || 'Localização não definida' }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-clock"></i>
                  <span>{{ formatarHora(auditoria.data) }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-exclamation-triangle"></i>
                  <span>Prioridade: {{ auditoria.prioridade }}</span>
                </div>
              </div>
              
              <!-- Ações rápidas -->
              <div class="auditoria-actions">
                <button 
                  v-if="auditoria.statusEspecialista === 'atribuida'"
                  class="action-btn accept"
                  @click.stop="aceitarAuditoria(auditoria)"
                >
                  <i class="fas fa-check"></i>
                  Aceitar
                </button>
                
                <button 
                  v-if="auditoria.statusEspecialista === 'aceite'"
                  class="action-btn start"
                  @click.stop="iniciarAuditoria(auditoria)"
                >
                  <i class="fas fa-play"></i>
                  Iniciar
                </button>
                
                <button 
                  v-if="auditoria.statusEspecialista === 'em_curso'"
                  class="action-btn location"
                  @click.stop="confirmarPresenca(auditoria)"
                >
                  <i class="fas fa-map-marker-alt"></i>
                  Confirmar Presença
                </button>
                
                <button 
                  v-if="auditoria.statusEspecialista === 'em_curso'"
                  class="action-btn complete"
                  @click.stop="finalizarAuditoria(auditoria)"
                >
                  <i class="fas fa-flag-checkered"></i>
                  Finalizar
                </button>
              </div>
            </div>
            
            <i class="fas fa-chevron-right auditoria-arrow"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNav />
  </div>
</template>

<script>
import BottomNav from '../../components/BottomNav.vue'

export default {
  name: 'EspecialistasHome',
  components: { BottomNav },
  data() {
    return {
      especialista: {},
      auditoriasAtribuidas: [],
      filtroAtivo: 'todas',
      darkMode: true
    }
  },
  computed: {
    auditoriasPendentes() {
      return this.auditoriasAtribuidas.filter(a => a.statusEspecialista === 'atribuida')
    },
    
    auditoriasEmAndamento() {
      return this.auditoriasAtribuidas.filter(a => ['aceite', 'em_curso'].includes(a.statusEspecialista))
    },
    
    auditoriasConcluidas() {
      return this.auditoriasAtribuidas.filter(a => a.statusEspecialista === 'concluida')
    },
    
    auditoriasFiltradas() {
      switch (this.filtroAtivo) {
        case 'pendentes':
          return this.auditoriasPendentes
        case 'andamento':
          return this.auditoriasEmAndamento
        case 'concluidas':
          return this.auditoriasConcluidas
        default:
          return this.auditoriasAtribuidas
      }
    }
  },
  mounted() {
    this.loadTheme()
    this.loadData()
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

    loadData() {
      // Carregar dados do especialista logado
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.tipo !== 'especialista') {
        this.$router.push('/')
        return
      }
      
      this.especialista = user
      
      // Carregar auditorias atribuídas a este especialista
      this.carregarAuditoriasAtribuidas()
    },

    carregarAuditoriasAtribuidas() {
      // Simular auditorias atribuídas ao especialista
      const auditorias = [
        {
          id: 1,
          titulo: "Inspeção de Sinalização Rodoviária",
          tipo: "Segurança Rodoviária",
          data: new Date().toISOString(),
          local: "Rua de Santo António, Braga",
          descricao: "Verificar placas e marcações no cruzamento principal.",
          prioridade: "Alta",
          statusEspecialista: "atribuida", // atribuida, aceite, em_curso, concluida
          especialistaId: this.especialista.id
        },
        {
          id: 2,
          titulo: "Auditoria de Infraestruturas",
          tipo: "Infraestruturas",
          data: new Date(Date.now() + 86400000).toISOString(),
          local: "Ponte de Dom Luís I, Porto",
          descricao: "Inspeção estrutural da ponte.",
          prioridade: "Crítica",
          statusEspecialista: "aceite",
          especialistaId: this.especialista.id
        },
        {
          id: 3,
          titulo: "Avaliação Ambiental",
          tipo: "Ambiente",
          data: new Date(Date.now() - 86400000).toISOString(),
          local: "Parque da Cidade, Porto",
          descricao: "Análise da qualidade do ar e ruído.",
          prioridade: "Média",
          statusEspecialista: "em_curso",
          especialistaId: this.especialista.id
        }
      ]
      
      // Salvar no localStorage para persistência
      localStorage.setItem('auditoriasEspecialista', JSON.stringify(auditorias))
      this.auditoriasAtribuidas = auditorias
    },

    formatarData(dataStr) {
      const data = new Date(dataStr)
      const dia = data.getDate().toString().padStart(2, '0')
      const mes = data.toLocaleString('pt-PT', { month: 'short' }).toUpperCase()
      return { dia, mes }
    },

    formatarHora(dataStr) {
      const data = new Date(dataStr)
      return `${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`
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
        case 'atribuida': return 'Atribuída'
        case 'aceite': return 'Aceite'
        case 'em_curso': return 'Em Curso'
        case 'concluida': return 'Concluída'
        default: return 'Desconhecido'
      }
    },

    getAuditoriaStatusClass(auditoria) {
      return this.getStatusClass(auditoria)
    },

    getEmptyMessage() {
      switch (this.filtroAtivo) {
        case 'pendentes': return 'Não tens auditorias pendentes'
        case 'andamento': return 'Não tens auditorias em curso'
        case 'concluidas': return 'Ainda não concluíste nenhuma auditoria'
        default: return 'Não tens auditorias atribuídas'
      }
    },

    abrirDetalheAuditoria(auditoria) {
      this.$router.push(`/especialista/auditoria/${auditoria.id}`)
    },

    aceitarAuditoria(auditoria) {
      if (confirm('Aceitar esta auditoria?')) {
        auditoria.statusEspecialista = 'aceite'
        this.salvarAuditorias()
        this.showSuccess('Auditoria aceite com sucesso!')
      }
    },

    iniciarAuditoria(auditoria) {
      if (confirm('Iniciar esta auditoria?')) {
        auditoria.statusEspecialista = 'em_curso'
        auditoria.dataInicio = new Date().toISOString()
        this.salvarAuditorias()
        this.showSuccess('Auditoria iniciada!')
      }
    },

    confirmarPresenca(auditoria) {
      this.$router.push(`/especialista/confirmar-presenca/${auditoria.id}`)
    },

    finalizarAuditoria(auditoria) {
      this.$router.push(`/especialista/finalizar/${auditoria.id}`)
    },

    salvarAuditorias() {
      localStorage.setItem('auditoriasEspecialista', JSON.stringify(this.auditoriasAtribuidas))
    },

    showSuccess(message) {
      // Implementar notificação de sucesso
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

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.avatar-container {
  position: relative;
}

.avatar-ring {
  position: relative;
  padding: 3px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid var(--bg-secondary);
  background-color: #ccc;
  transition: transform 0.3s ease;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--bg-secondary);
}

.status-indicator.online {
  background: var(--success-primary);
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.profile-details {
  flex: 1;
}

.profile-name {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  font-family: 'Poppins', sans-serif;
}

.profile-area {
  color: var(--text-secondary);
  font-size: 13px;
  margin: 0 0 8px 0;
  opacity: 0.8;
}

.profile-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-item i {
  font-size: 10px;
  color: var(--accent-primary);
}

.settings-btn {
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

.settings-btn:hover {
  background: var(--accent-primary);
  color: white;
  transform: scale(1.05);
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.stat-card.pending {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.05);
}

.stat-card.active {
  border-color: rgba(39, 122, 255, 0.3);
  background: rgba(39, 122, 255, 0.05);
}

.stat-card.completed {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, var(--warning-primary), var(--warning-secondary));
}

.stat-card.active .stat-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.stat-card.completed .stat-icon {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Filters Section */
.filters-section {
  margin-bottom: 8px;
}

.filter-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.filter-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
}

.filter-tab.active {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.3);
}

.filter-tab:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

/* Auditorias Container */
.auditorias-container {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
  color: var(--accent-primary);
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

.auditorias-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auditoria-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.auditoria-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(39, 122, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.auditoria-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
  box-shadow: 0 8px 25px rgba(39, 122, 255, 0.15);
}

.auditoria-card:hover::before {
  opacity: 1;
}

.auditoria-card.pending {
  border-color: rgba(245, 158, 11, 0.3);
}

.auditoria-card.accepted {
  border-color: rgba(59, 130, 246, 0.3);
}

.auditoria-card.active {
  border-color: rgba(39, 122, 255, 0.3);
}

.auditoria-card.completed {
  border-color: rgba(16, 185, 129, 0.3);
}

.auditoria-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.auditoria-date {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.date-day {
  font-size: 16px;
  line-height: 1;
}

.date-month {
  font-size: 10px;
  text-transform: uppercase;
  margin-top: 2px;
  opacity: 0.9;
}

.auditoria-status {
  position: relative;
  z-index: 1;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning-primary);
}

.status-badge.accepted {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.status-badge.active {
  background: rgba(39, 122, 255, 0.2);
  color: var(--accent-primary);
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-primary);
}

.auditoria-content {
  position: relative;
  z-index: 1;
}

.auditoria-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.3;
  font-family: 'Poppins', sans-serif;
}

.auditoria-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.detail-item i {
  font-size: 10px;
  opacity: 0.8;
  width: 12px;
  color: var(--accent-primary);
}

.auditoria-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Poppins', sans-serif;
}

.action-btn.accept {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-primary);
}

.action-btn.start {
  background: rgba(39, 122, 255, 0.1);
  border-color: rgba(39, 122, 255, 0.3);
  color: var(--accent-primary);
}

.action-btn.location {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: var(--warning-primary);
}

.action-btn.complete {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-primary);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.auditoria-arrow {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 14px;
  opacity: 0.6;
  transition: all 0.3s ease;
  z-index: 1;
}

.auditoria-card:hover .auditoria-arrow {
  opacity: 1;
  transform: translateY(-50%) translateX(4px);
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

  .profile-name {
    font-size: 16px;
  }

  .avatar {
    width: 50px;
    height: 50px;
  }

  .stats-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .stat-card {
    padding: 12px 8px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .stat-icon {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .stat-number {
    font-size: 18px;
  }

  .filter-tab {
    padding: 6px 8px;
    font-size: 11px;
  }

  .auditoria-card {
    padding: 14px;
  }

  .auditoria-date {
    width: 45px;
    height: 45px;
  }

  .date-day {
    font-size: 14px;
  }

  .auditoria-title {
    font-size: 14px;
  }

  .auditoria-actions {
    gap: 6px;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 10px;
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
