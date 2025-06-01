<template>
  <div class="login-bg" :class="{ 'light-mode': !darkMode }">
    <!-- Toggle de tema no canto superior direito -->
    <button class="theme-toggle" @click="toggleTheme">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>

    <div class="home-container">
      <!-- Header elegante -->
      <div class="home-header">
        <div class="user-welcome">
          <div class="avatar-container">
            <div class="avatar-ring">
              <img :src="user.avatar" class="avatar" />
            </div>
          </div>
          <div class="welcome-content">
            <h2 class="welcome-text">Olá, {{ user.nomeCompleto }}</h2>
            <p class="subtitle">{{ currentDate }}</p>
          </div>
        </div>
      </div>

      <!-- Stats com design do login -->
      <div class="stats-container">
        <div class="stat-card" :class="{ 'active-stat': totalAuditorias > 0 }">
          <div class="stat-number">{{ totalAuditorias }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card" :class="{ 'active-stat': auditoriasADecorrerCount > 0 }">
          <div class="stat-number">{{ auditoriasADecorrerCount }}</div>
          <div class="stat-label">Ativas</div>
        </div>
        <div class="stat-card" :class="{ 'active-stat': auditoriasConcluidasCount > 0 }">
          <div class="stat-number">{{ auditoriasConcluidasCount }}</div>
          <div class="stat-label">Concluídas</div>
        </div>
      </div>

      <!-- Menu principal -->
      <div class="menu-container">
        <div class="menu-item" @click="$router.push('/auditorias/adecorrer')">
          <div class="menu-icon blue-icon">
            <i class="fas fa-play"></i>
          </div>
          <div class="menu-content">
            <h3>Auditorias Ativas</h3>
            <p>{{ auditoriasADecorrerCount }} em progresso</p>
          </div>
          <i class="fas fa-chevron-right menu-arrow"></i>
        </div>

        <div class="menu-item" @click="$router.push('/auditorias/nova')">
          <div class="menu-icon orange-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="menu-content">
            <h3>Novas Auditorias</h3>
            <p>{{ auditoriasNovas.length }} para revisar</p>
          </div>
          <i class="fas fa-chevron-right menu-arrow"></i>
        </div>

        <div class="menu-item" @click="$router.push('/auditorias/concluidas')">
          <div class="menu-icon green-icon">
            <i class="fas fa-check"></i>
          </div>
          <div class="menu-content">
            <h3>Concluídas</h3>
            <p>{{ auditoriasConcluidasCount }} finalizadas</p>
          </div>
          <i class="fas fa-chevron-right menu-arrow"></i>
        </div>

        <div class="menu-item" @click="$router.push('/especialistas/ver')">
          <div class="menu-icon purple-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="menu-content" >
            <h3>Especialistas</h3>
            <p>{{ especialistasCount }} na equipa</p>
          </div>
          <i class="fas fa-chevron-right menu-arrow"></i>
        </div>
      </div>

      <!-- Notificações recentes -->
      <div v-if="auditoriasNovas.length > 0" class="notifications-container">
        <h3 class="section-title">Recentes</h3>
        <div class="notification-list">
          <div 
            v-for="auditoria in auditoriasNovas.slice(0, 2)" 
            :key="auditoria.id"
            class="notification-item"
            @click="$router.push(`/auditoriasnovas/${auditoria.id}`)"
          >
            <div class="notification-dot"></div>
            <div class="notification-content">
              <h4>{{ auditoria.titulo }}</h4>
              <p>Nova auditoria criada</p>
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
  name: 'CleanHomeView',
  components: {
    BottomNav
  },
  data() {
    return {
      user: { name: '', avatar: '' },
      auditoriasNovas: [],
      auditorias: [],
      auditoriasConcluidas: [],
      especialistas: [],
      darkMode: true
    }
  },
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    },
    auditoriasADecorrerCount() {
      return this.auditorias.length
    },
    auditoriasConcluidasCount() {
      return this.auditoriasConcluidas.length
    },
    especialistasCount() {
      return this.especialistas.length
    },
    totalAuditorias() {
      return this.auditoriasNovas.length + this.auditorias.length + this.auditoriasConcluidas.length
    }
  },
  mounted() {
    this.loadData()
    this.loadTheme()
  },
  methods: {
    loadData() {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        this.user = JSON.parse(savedUser)
      }

      const auditoriasNovas = localStorage.getItem('auditorias')
      if (auditoriasNovas) {
        this.auditoriasNovas = JSON.parse(auditoriasNovas)
      }

      const auditorias = localStorage.getItem('auditoriasADECORRER')
      if (auditorias) {
        this.auditorias = JSON.parse(auditorias)
      }

      const auditoriasConcluidas = localStorage.getItem('auditoriasConcluidas')
      if (auditoriasConcluidas) {
        this.auditoriasConcluidas = JSON.parse(auditoriasConcluidas)
      }

      const especialistas = localStorage.getItem('especialistas')
      if (especialistas) {
        this.especialistas = JSON.parse(especialistas)
      }
    },
    
    loadTheme() {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.darkMode = savedTheme === 'dark'
      }
    },
    
    toggleTheme() {
      this.darkMode = !this.darkMode
      localStorage.setItem('theme', this.darkMode ? 'dark' : 'light')
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
  --input-bg: #dce4f7;
  --input-text: #333;
}

.light-mode {
  --bg-primary: #ffffff;
  --bg-secondary: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
  --input-bg: #f8f9fa;
  --input-text: #333;
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
  padding: 10px 10px 80px 10px; /* Adicionar padding-bottom para navbar */
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

/* Container principal - remover padding-bottom e navbar */
.home-container {
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
.home-header {
  text-align: center;
  margin-bottom: 8px;
}

.user-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Avatar com anel animado - IGUAL AO LOGIN */
.avatar-container {
  margin-bottom: 8px;
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

.avatar-ring:hover .avatar {
  transform: scale(1.05);
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.welcome-text {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 13px;
  margin: 0;
  opacity: 0.8;
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
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card.active-stat {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-color: var(--accent-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.3);
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  line-height: 1;
}

.stat-card.active-stat .stat-number {
  color: white;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  font-weight: 500;
}

.stat-card.active-stat .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

/* Menu Container */
.menu-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.menu-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.blue-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.green-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.orange-icon {
  background: linear-gradient(135deg, #f59e0b, #ea580c);
}

.purple-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.menu-content {
  flex: 1;
}

.menu-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.menu-content p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.menu-arrow {
  color: var(--text-secondary);
  font-size: 14px;
  opacity: 0.6;
}

/* Notificações */
.notifications-container {
  margin-bottom: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
}

.notification-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.notification-content p {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
}

/* Responsividade */
@media (max-width: 480px) {
  .login-bg {
    padding: 5px 5px 80px 5px;
  }

  .home-container {
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

  .avatar {
    width: 50px;
    height: 50px;
  }

  .welcome-text {
    font-size: 16px;
  }

  .subtitle {
    font-size: 12px;
  }

  .stat-card {
    padding: 14px 10px;
  }

  .stat-number {
    font-size: 20px;
  }

  .menu-item {
    padding: 14px;
  }

  .menu-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}

/* Animação de entrada */
.home-container {
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
