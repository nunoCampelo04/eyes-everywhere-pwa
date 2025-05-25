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
        <h2 class="page-title">Especialista</h2>
        <button class="edit-btn" @click="editarEspecialista">
          <i class="fas fa-edit"></i>
        </button>
      </div>

      <!-- Perfil do especialista -->
      <div class="profile-section">
        <div class="avatar-container">
          <div class="avatar-ring">
            <img :src="especialista.avatar" :alt="especialista.nome" class="avatar" />
          </div>
          <div class="status-indicator" :class="especialista.status"></div>
        </div>
        <h2 class="especialista-nome">{{ especialista.nome }}</h2>
        <p class="especialista-area">{{ especialista.area }}</p>
        <div class="rating-container">
          <div class="stars">
            <i v-for="n in 5" :key="n" 
               :class="n <= Math.floor(especialista.rating || 5) ? 'fas fa-star' : 'far fa-star'"
               class="star"></i>
          </div>
          <span class="rating-text">{{ especialista.rating || '5.0' }} ({{ especialista.avaliacoes || 12 }} avaliações)</span>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ especialista.auditoriasCompletas || 0 }}</span>
            <span class="stat-label">Auditorias</span>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ calcularExperiencia() }}</span>
            <span class="stat-label">Anos</span>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-award"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ especialista.certificacoes?.length || 0 }}</span>
            <span class="stat-label">Certificações</span>
          </div>
        </div>
      </div>

      <!-- Informações de contacto -->
      <div class="contact-section">
        <h3 class="section-title">
          <i class="fas fa-address-book"></i>
          Contacto
        </h3>
        <div class="contact-list">
          <div class="contact-item">
            <i class="fas fa-phone"></i>
            <span>{{ especialista.telefone || 'Não definido' }}</span>
            <button v-if="especialista.telefone" class="contact-action" @click="ligar(especialista.telefone)">
              <i class="fas fa-phone-alt"></i>
            </button>
          </div>
          
          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>{{ especialista.email || 'Não definido' }}</span>
            <button v-if="especialista.email" class="contact-action" @click="enviarEmail(especialista.email)">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
          
          <div v-if="especialista.localizacao" class="contact-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ especialista.localizacao }}</span>
            <button class="contact-action" @click="abrirMapa">
              <i class="fas fa-external-link-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Competências -->
      <div v-if="especialista.competencias?.length" class="competencias-section">
        <h3 class="section-title">
          <i class="fas fa-cogs"></i>
          Competências
        </h3>
        <div class="competencias-grid">
          <span 
            v-for="competencia in especialista.competencias" 
            :key="competencia"
            class="competencia-tag"
          >
            {{ competencia }}
          </span>
        </div>
      </div>

      <!-- Certificações -->
      <div v-if="especialista.certificacoes?.length" class="certificacoes-section">
        <h3 class="section-title">
          <i class="fas fa-certificate"></i>
          Certificações
        </h3>
        <div class="certificacoes-list">
          <div 
            v-for="certificacao in especialista.certificacoes" 
            :key="certificacao"
            class="certificacao-item"
          >
            <i class="fas fa-award"></i>
            <span>{{ certificacao }}</span>
          </div>
        </div>
      </div>

      <!-- Disponibilidade -->
      <div class="disponibilidade-section">
        <h3 class="section-title">
          <i class="fas fa-clock"></i>
          Disponibilidade
        </h3>
        <div class="status-card" :class="especialista.status">
          <div class="status-info">
            <div class="status-badge" :class="especialista.status">
              {{ getStatusText(especialista.status) }}
            </div>
            <p class="status-description">{{ getStatusDescription(especialista.status) }}</p>
          </div>
          <button class="status-action" @click="alterarStatus">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </div>

      <!-- Histórico de auditorias -->
      <div class="historico-section">
        <h3 class="section-title">
          <i class="fas fa-history"></i>
          Histórico Recente
        </h3>
        <div v-if="historicoAuditorias.length === 0" class="empty-historico">
          <i class="fas fa-clipboard-list"></i>
          <p>Nenhuma auditoria registada</p>
        </div>
        <div v-else class="historico-list">
          <div 
            v-for="auditoria in historicoAuditorias.slice(0, 3)" 
            :key="auditoria.id"
            class="historico-item"
          >
            <div class="historico-date">
              <span class="date-day">{{ formatarData(auditoria.data).dia }}</span>
              <span class="date-month">{{ formatarData(auditoria.data).mes }}</span>
            </div>
            <div class="historico-content">
              <h4 class="historico-title">{{ auditoria.titulo }}</h4>
              <p class="historico-type">{{ auditoria.tipo }}</p>
            </div>
            <div class="historico-status">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
        <button v-if="historicoAuditorias.length > 3" class="ver-mais-btn">
          <span>Ver todas ({{ historicoAuditorias.length - 3 }} restantes)</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>

      <!-- Ações -->
      <div class="actions-section">
        <button class="action-btn primary" @click="atribuirAuditoria">
          <i class="fas fa-plus-circle"></i>
          <span>Atribuir Auditoria</span>
        </button>
        
        <button class="action-btn secondary" @click="enviarMensagem">
          <i class="fas fa-comment"></i>
          <span>Enviar Mensagem</span>
        </button>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNav />
  </div>
</template>

<script>
import BottomNav from './components/BottomNav.vue'

export default {
  name: 'EspecialistaDetalhe',
  components: { BottomNav },
  data() {
    return {
      especialista: {
        id: null,
        nome: '',
        area: '',
        avatar: '',
        status: 'disponivel',
        rating: 5.0,
        avaliacoes: 0,
        auditoriasCompletas: 0,
        telefone: '',
        email: '',
        localizacao: '',
        competencias: [],
        certificacoes: [],
        dataContratacao: ''
      },
      historicoAuditorias: [],
      darkMode: true
    }
  },
  mounted() {
    this.loadTheme()
    this.carregarEspecialista()
    this.carregarHistorico()
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

    carregarEspecialista() {
      const id = this.$route.params.id
      const especialistas = JSON.parse(localStorage.getItem('especialistas') || '[]')
      const especialista = especialistas.find(e => e.id == id)
      
      if (especialista) {
        this.especialista = { ...especialista }
      } else {
        this.$router.back()
      }
    },

    carregarHistorico() {
      // Simular histórico de auditorias
      this.historicoAuditorias = [
        {
          id: 1,
          titulo: 'Inspeção de Ponte',
          tipo: 'Infraestruturas',
          data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          titulo: 'Auditoria de Sinalização',
          tipo: 'Segurança Rodoviária',
          data: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          titulo: 'Avaliação Ambiental',
          tipo: 'Ambiente',
          data: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },

    calcularExperiencia() {
      if (this.especialista.dataContratacao) {
        const inicio = new Date(this.especialista.dataContratacao)
        const agora = new Date()
        const anos = Math.floor((agora - inicio) / (365.25 * 24 * 60 * 60 * 1000))
        return anos > 0 ? anos : 1
      }
      return Math.floor(Math.random() * 10) + 1 // Valor aleatório para demonstração
    },

    getStatusText(status) {
      const statusMap = {
        'disponivel': 'Disponível',
        'ocupado': 'Ocupado',
        'ausente': 'Ausente'
      }
      return statusMap[status] || 'Desconhecido'
    },

    getStatusDescription(status) {
      const descMap = {
        'disponivel': 'Pronto para novas atribuições',
        'ocupado': 'Atualmente em auditoria',
        'ausente': 'Temporariamente indisponível'
      }
      return descMap[status] || ''
    },

    formatarData(dataStr) {
      const data = new Date(dataStr)
      const dia = data.getDate().toString().padStart(2, '0')
      const mes = data.toLocaleString('pt-PT', { month: 'short' }).toUpperCase()
      return { dia, mes }
    },

    editarEspecialista() {
      // Navegar para página de edição
      this.$router.push(`/especialistas/${this.especialista.id}/editar`)
    },

    alterarStatus() {
      const statusOptions = ['disponivel', 'ocupado', 'ausente']
      const currentIndex = statusOptions.indexOf(this.especialista.status)
      const nextIndex = (currentIndex + 1) % statusOptions.length
      this.especialista.status = statusOptions[nextIndex]
      
      // Atualizar no localStorage
      const especialistas = JSON.parse(localStorage.getItem('especialistas') || '[]')
      const index = especialistas.findIndex(e => e.id === this.especialista.id)
      if (index !== -1) {
        especialistas[index].status = this.especialista.status
        localStorage.setItem('especialistas', JSON.stringify(especialistas))
      }
    },

    ligar(telefone) {
      window.open(`tel:${telefone}`)
    },

    enviarEmail(email) {
      window.open(`mailto:${email}`)
    },

    abrirMapa() {
      if (this.especialista.localizacao) {
        const query = encodeURIComponent(this.especialista.localizacao)
        window.open(`https://maps.google.com/maps?q=${query}`, '_blank')
      }
    },

    atribuirAuditoria() {
      alert('Funcionalidade de atribuição de auditoria em desenvolvimento')
    },

    enviarMensagem() {
      alert('Sistema de mensagens em desenvolvimento')
    }
  }
}
</script>

<style scoped>
/* Usar as mesmas variáveis CSS do arquivo anterior */
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
  --purple-primary: #8b5cf6;
  --purple-secondary: #7c3aed;
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
  --purple-primary: #8b5cf6;
  --purple-secondary: #7c3aed;
}

/* Background e container - iguais ao anterior */
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
    radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(39, 122, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

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

.back-btn,
.edit-btn {
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
  background: var(--purple-primary);
  color: white;
  transform: scale(1.05);
}

.edit-btn:hover {
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

/* Profile Section */
.profile-section {
  text-align: center;
  margin-bottom: 8px;
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;
  display: inline-block;
}

.avatar-ring {
  position: relative;
  padding: 4px;
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-secondary));
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid var(--bg-secondary);
  background-color: #ccc;
  transition: transform 0.3s ease;
  object-fit: cover;
}

.avatar-ring:hover .avatar {
  transform: scale(1.05);
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid var(--bg-secondary);
}

.status-indicator.disponivel {
  background: var(--success-primary);
}

.status-indicator.ocupado {
  background: var(--warning-primary);
}

.status-indicator.ausente {
  background: #6b7280;
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.especialista-nome {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px 0;
  font-family: 'Poppins', sans-serif;
}

.especialista-area {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 12px 0;
  opacity: 0.8;
}

.rating-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #fbbf24;
  font-size: 16px;
}

.rating-text {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: var(--purple-primary);
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
  font-weight: 500;
}

/* Section Titles */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.section-title i {
  color: var(--purple-primary);
  font-size: 14px;
}

/* Contact Section */
.contact-section {
  margin-bottom: 8px;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--purple-primary);
}

.contact-item i {
  color: var(--purple-primary);
  font-size: 16px;
  width: 20px;
}

.contact-item span {
  flex: 1;
  color: var(--text-primary);
  font-size: 14px;
}

.contact-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(139, 92, 246, 0.2);
  color: var(--purple-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.contact-action:hover {
  background: rgba(139, 92, 246, 0.3);
  transform: scale(1.05);
}

/* Competências */
.competencias-section {
  margin-bottom: 8px;
}

.competencias-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.competencia-tag {
  background: rgba(139, 92, 246, 0.2);
  color: var(--purple-primary);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* Certificações */
.certificacoes-section {
  margin-bottom: 8px;
}

.certificacoes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.certificacao-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.certificacao-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--purple-primary);
}

.certificacao-item i {
  color: #fbbf24;
  font-size: 16px;
}

.certificacao-item span {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

/* Disponibilidade */
.disponibilidade-section {
  margin-bottom: 8px;
}

.status-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.status-card.disponivel {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}

.status-card.ocupado {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.05);
}

.status-card.ausente {
  border-color: rgba(107, 114, 128, 0.3);
  background: rgba(107, 114, 128, 0.05);
}

.status-info {
  flex: 1;
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 4px;
}

.status-badge.disponivel {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-primary);
}

.status-badge.ocupado {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning-primary);
}

.status-badge.ausente {
  background: rgba(107, 114, 128, 0.2);
  color: #6b7280;
}

.status-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.8;
}

.status-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.status-action:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

/* Histórico */
.historico-section {
  margin-bottom: 8px;
}

.empty-historico {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
}

.empty-historico i {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.historico-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.historico-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.historico-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--purple-primary);
}

.historico-date {
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-secondary));
  color: white;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  font-weight: 600;
}

.date-day {
  font-size: 14px;
  line-height: 1;
}

.date-month {
  font-size: 8px;
  text-transform: uppercase;
  margin-top: 1px;
  opacity: 0.9;
}

.historico-content {
  flex: 1;
}

.historico-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  font-family: 'Poppins', sans-serif;
}

.historico-type {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.8;
}

.historico-status {
  color: var(--success-primary);
  font-size: 16px;
}

.ver-mais-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  font-family: 'Poppins', sans-serif;
  margin-top: 8px;
}

.ver-mais-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--purple-primary);
  color: var(--text-primary);
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

.action-btn.primary {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  color: var(--purple-primary);
}

.action-btn.primary:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: var(--purple-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.action-btn.secondary {
  background: rgba(39, 122, 255, 0.1);
  border-color: rgba(39, 122, 255, 0.3);
  color: var(--accent-primary);
}

.action-btn.secondary:hover {
  background: rgba(39, 122, 255, 0.2);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.3);
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

  .avatar {
    width: 70px;
    height: 70px;
  }

  .especialista-nome {
    font-size: 20px;
  }

  .stats-section {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 12px 8px;
  }

  .action-btn {
    padding: 14px;
    font-size: 15px;
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
