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
        <h2 class="page-title">Auditorias Concluídas</h2>
      </div>

      <!-- Search bar -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="pesquisa" 
            placeholder="Procurar auditorias..." 
            class="search-input"
          />
        </div>
      </div>

      <!-- Lista de auditorias -->
      <div class="auditorias-container">
        <div v-if="auditoriasFiltradas.length === 0" class="empty-state">
          <i class="fas fa-check-circle"></i>
          <h3>Nenhuma auditoria encontrada</h3>
          <p>Não há auditorias concluídas no momento</p>
        </div>
        
        <div v-else class="auditorias-list">
          <div 
            class="auditoria-card completed" 
            v-for="aud in auditoriasFiltradas" 
            :key="aud.id" 
            @click="$router.push(`/auditoriasconcluidas/${aud.id}`)"
          >
            <div class="auditoria-date completed-date">
              <span class="date-day">{{ formatarData(aud.data).dia }}</span>
              <span class="date-month">{{ formatarData(aud.data).mes }}</span>
            </div>
            <div class="auditoria-content">
              <h3 class="auditoria-title">{{ aud.titulo }}</h3>
              <div class="auditoria-details">
                <p class="auditoria-time">
                  <i class="fas fa-clock"></i>
                  {{ formatarHora(aud.data) }}
                </p>
                <p class="auditoria-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ aud.local || 'Localização não definida' }}
                </p>
              </div>
              <span class="auditoria-type completed-type">{{ aud.tipo }}</span>
            </div>
            <div class="completion-badge">
              <i class="fas fa-check"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNav />
  </div>
</template>

<script>
import BottomNav from '../components/BottomNav.vue'

export default {
  name: 'AuditoriasConcluidas',
  components: { BottomNav },
  data() {
    return {
      auditorias: [],
      pesquisa: '',
      darkMode: true
    }
  },
  computed: {
    auditoriasFiltradas() {
      return this.auditorias.filter((a) =>
        a.titulo.toLowerCase().includes(this.pesquisa.toLowerCase())
      )
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
      const concluidas = localStorage.getItem('auditoriasConcluidas')
      this.auditorias = concluidas ? JSON.parse(concluidas) : []
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
  --success: #10b981;
}

.light-mode {
  --bg-primary: #ffffff;
  --bg-secondary: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
  --success: #10b981;
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
    radial-gradient(circle at 80% 20%, rgba(0, 170, 255, 0.1) 0%, transparent 50%);
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
  gap: 16px;
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
  margin-right: auto;
}

/* Search */
.search-container {
  margin-bottom: 8px;
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
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(39, 122, 255, 0.1);
}

/* Lista de auditorias */
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
  color: var(--success);
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
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.auditoria-card.completed {
  border-color: rgba(16, 185, 129, 0.3);
}

.auditoria-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.auditoria-card:hover {
  transform: translateY(-2px);
  border-color: var(--success);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
}

.auditoria-card:hover::before {
  opacity: 1;
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

.auditoria-date.completed-date {
  background: linear-gradient(135deg, var(--success), #059669);
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

.auditoria-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.auditoria-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.auditoria-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.auditoria-time,
.auditoria-location {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.auditoria-time i,
.auditoria-location i {
  font-size: 10px;
  opacity: 0.8;
  width: 12px;
}

.auditoria-type {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-block;
  font-weight: 500;
}

.auditoria-type.completed-type {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
}

.completion-badge {
  width: 32px;
  height: 32px;
  background: var(--success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  position: relative;
  z-index: 1;
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

  .completion-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
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
