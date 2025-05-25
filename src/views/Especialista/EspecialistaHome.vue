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
        <h2 class="page-title">Especialistas</h2>
        <button class="add-btn" @click="$router.push('/especialistas/adicionar')">
          <i class="fas fa-plus"></i>
        </button>
      </div>

      <!-- Dashboard de estatísticas -->
      <div class="stats-container">
        <div class="stat-card" :class="{ 'active-stat': totalEspecialistas > 0 }">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalEspecialistas }}</div>
            <div class="stat-label">Total</div>
          </div>
        </div>
        
        <div class="stat-card" :class="{ 'active-stat': especialistasDisponiveis > 0 }">
          <div class="stat-icon available">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ especialistasDisponiveis }}</div>
            <div class="stat-label">Disponíveis</div>
          </div>
        </div>
        
        <div class="stat-card" :class="{ 'active-stat': especialistasOcupados > 0 }">
          <div class="stat-icon busy">
            <i class="fas fa-user-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ especialistasOcupados }}</div>
            <div class="stat-label">Ocupados</div>
          </div>
        </div>
      </div>

      <!-- Filtros e pesquisa -->
      <div class="filters-section">
        <div class="search-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="pesquisa" 
              placeholder="Procurar especialistas..." 
              class="search-input"
            />
          </div>
        </div>
        
        <div class="filter-row">
          <select v-model="filtroArea" class="filter-select">
            <option value="">Todas as áreas</option>
            <option value="Segurança Rodoviária">Segurança Rodoviária</option>
            <option value="Infraestruturas">Infraestruturas</option>
            <option value="Ambiente">Ambiente</option>
            <option value="Urbanismo">Urbanismo</option>
            <option value="Engenharia Civil">Engenharia Civil</option>
          </select>
          
          <select v-model="filtroStatus" class="filter-select">
            <option value="">Todos os status</option>
            <option value="disponivel">Disponível</option>
            <option value="ocupado">Ocupado</option>
            <option value="ausente">Ausente</option>
          </select>
        </div>
      </div>

      <!-- Lista de especialistas -->
      <div class="especialistas-container">
        <div v-if="especialistasFiltrados.length === 0" class="empty-state">
          <i class="fas fa-user-friends"></i>
          <h3>Nenhum especialista encontrado</h3>
          <p>Adicione especialistas à sua equipa</p>
          <button class="add-first-btn" @click="$router.push('/especialistas/adicionar')">
            <i class="fas fa-plus"></i>
            <span>Adicionar Primeiro Especialista</span>
          </button>
        </div>
        
        <div v-else class="especialistas-list">
          <div 
            class="especialista-card" 
            v-for="especialista in especialistasFiltrados" 
            :key="especialista.id" 
            @click="$router.push(`/especialistas/${especialista.id}`)"
          >
            <div class="especialista-avatar-container">
              <img :src="especialista.avatar" :alt="especialista.nome" class="especialista-avatar" />
              <div class="status-indicator" :class="especialista.status"></div>
            </div>
            
            <div class="especialista-content">
              <h3 class="especialista-nome">{{ especialista.nome }}</h3>
              <p class="especialista-area">{{ especialista.area }}</p>
              <div class="especialista-details">
                <div class="detail-item">
                  <i class="fas fa-star"></i>
                  <span>{{ especialista.rating || '5.0' }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-clipboard-check"></i>
                  <span>{{ especialista.auditoriasCompletas || 0 }} auditorias</span>
                </div>
              </div>
              <div class="especialista-tags">
                <span 
                  v-for="competencia in especialista.competencias?.slice(0, 2)" 
                  :key="competencia"
                  class="tag"
                >
                  {{ competencia }}
                </span>
                <span v-if="especialista.competencias?.length > 2" class="tag more">
                  +{{ especialista.competencias.length - 2 }}
                </span>
              </div>
            </div>
            
            <div class="especialista-actions">
              <div class="status-badge" :class="especialista.status">
                {{ getStatusText(especialista.status) }}
              </div>
              <i class="fas fa-chevron-right especialista-arrow"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações rápidas -->
      <div class="quick-actions">
        <button class="quick-action-btn" @click="$router.push('/especialistas/confirmacao')">
          <i class="fas fa-map-marker-alt"></i>
          <span>Confirmar Presença</span>
        </button>
        
        <button class="quick-action-btn" @click="exportarLista">
          <i class="fas fa-download"></i>
          <span>Exportar Lista</span>
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
  name: 'EspecialistasHome',
  components: { BottomNav },
  data() {
    return {
      especialistas: [],
      pesquisa: '',
      filtroArea: '',
      filtroStatus: '',
      darkMode: true
    }
  },
  computed: {
    especialistasFiltrados() {
      return this.especialistas.filter(especialista => {
        const nomeMatch = especialista.nome.toLowerCase().includes(this.pesquisa.toLowerCase())
        const areaMatch = !this.filtroArea || especialista.area === this.filtroArea
        const statusMatch = !this.filtroStatus || especialista.status === this.filtroStatus
        return nomeMatch && areaMatch && statusMatch
      })
    },
    
    totalEspecialistas() {
      return this.especialistas.length
    },
    
    especialistasDisponiveis() {
      return this.especialistas.filter(e => e.status === 'disponivel').length
    },
    
    especialistasOcupados() {
      return this.especialistas.filter(e => e.status === 'ocupado').length
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
      const especialistas = localStorage.getItem('especialistas')
      if (especialistas) {
        this.especialistas = JSON.parse(especialistas)
      } else {
        // Dados de exemplo
        this.especialistas = [
          {
            id: 1,
            nome: 'Dr. João Silva',
            area: 'Segurança Rodoviária',
            avatar: '/placeholder.svg?height=60&width=60&query=professional+man',
            status: 'disponivel',
            rating: 4.8,
            auditoriasCompletas: 23,
            competencias: ['Sinalização', 'Pavimentos', 'Segurança'],
            telefone: '+351 912 345 678',
            email: 'joao.silva@email.com',
            certificacoes: ['Técnico de Segurança Rodoviária', 'Auditor Certificado']
          },
          {
            id: 2,
            nome: 'Eng. Maria Santos',
            area: 'Infraestruturas',
            avatar: '/placeholder.svg?height=60&width=60&query=professional+woman',
            status: 'ocupado',
            rating: 4.9,
            auditoriasCompletas: 31,
            competencias: ['Pontes', 'Estruturas', 'Materiais'],
            telefone: '+351 923 456 789',
            email: 'maria.santos@email.com',
            certificacoes: ['Engenheira Civil', 'Especialista em Estruturas']
          },
          {
            id: 3,
            nome: 'Dr. Carlos Oliveira',
            area: 'Ambiente',
            avatar: '/placeholder.svg?height=60&width=60&query=environmental+specialist',
            status: 'disponivel',
            rating: 4.7,
            auditoriasCompletas: 18,
            competencias: ['Impacto Ambiental', 'Sustentabilidade', 'Ecologia'],
            telefone: '+351 934 567 890',
            email: 'carlos.oliveira@email.com',
            certificacoes: ['Especialista Ambiental', 'Auditor ISO 14001']
          }
        ]
        localStorage.setItem('especialistas', JSON.stringify(this.especialistas))
      }
    },

    getStatusText(status) {
      const statusMap = {
        'disponivel': 'Disponível',
        'ocupado': 'Ocupado',
        'ausente': 'Ausente'
      }
      return statusMap[status] || 'Desconhecido'
    },

    exportarLista() {
      const dados = this.especialistas.map(e => ({
        nome: e.nome,
        area: e.area,
        status: this.getStatusText(e.status),
        rating: e.rating,
        auditorias: e.auditoriasCompletas,
        telefone: e.telefone,
        email: e.email
      }))
      
      console.log('Exportando lista de especialistas:', dados)
      alert('Lista exportada com sucesso! (Funcionalidade simulada)')
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
    radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(39, 122, 255, 0.1) 0%, transparent 50%);
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

.back-btn,
.add-btn {
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

.add-btn:hover {
  background: var(--success-primary);
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

.stat-card.active-stat {
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-secondary));
  border-color: var(--purple-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.stat-icon.available {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
}

.stat-icon.busy {
  background: linear-gradient(135deg, var(--warning-primary), var(--warning-secondary));
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  line-height: 1;
}

.stat-card.active-stat .stat-number {
  color: white;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
  font-weight: 500;
}

.stat-card.active-stat .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

/* Filters Section */
.filters-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-container {
  margin-bottom: 4px;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 14px;
  opacity: 0.7;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  color: var(--text-primary);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.search-input:focus {
  outline: none;
  border-color: var(--purple-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.filter-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--purple-primary);
  background: rgba(255, 255, 255, 0.08);
}

/* Especialistas Container */
.especialistas-container {
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
  color: var(--purple-primary);
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 14px;
  margin: 0 0 20px 0;
  opacity: 0.8;
}

.add-first-btn {
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-secondary));
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
  margin: 0 auto;
}

.add-first-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.especialistas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.especialista-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.especialista-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(139, 92, 246, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.especialista-card:hover {
  transform: translateY(-2px);
  border-color: var(--purple-primary);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
}

.especialista-card:hover::before {
  opacity: 1;
}

.especialista-avatar-container {
  position: relative;
  flex-shrink: 0;
}

.especialista-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--bg-secondary);
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

.especialista-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.especialista-nome {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  line-height: 1.3;
  font-family: 'Poppins', sans-serif;
}

.especialista-area {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  opacity: 0.8;
}

.especialista-details {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.detail-item i {
  font-size: 10px;
  color: var(--purple-primary);
}

.especialista-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(139, 92, 246, 0.2);
  color: var(--purple-primary);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
}

.tag.more {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.especialista-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  text-transform: uppercase;
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

.especialista-arrow {
  color: var(--text-secondary);
  font-size: 14px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.especialista-card:hover .especialista-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.quick-action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
}

.quick-action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--purple-primary);
  transform: translateY(-1px);
}

.quick-action-btn i {
  font-size: 16px;
  color: var(--purple-primary);
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

  .especialista-card {
    padding: 14px;
  }

  .especialista-avatar {
    width: 45px;
    height: 45px;
  }

  .especialista-nome {
    font-size: 14px;
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
