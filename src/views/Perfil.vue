<template>
  <div class="login-bg" :class="{ 'light-mode': !darkMode }">
    <button class="theme-toggle" @click="toggleTheme">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>

    <div class="page-container">
      <!-- Header elegante -->
      <div class="page-header">
        <button class="back-btn" @click="$router.back()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2 class="page-title">Perfil</h2>
        <button class="settings-btn" @click="$router.push('/definicoes')">
          <i class="fas fa-cog"></i>
        </button>
      </div>

      <!-- Avatar e informações do utilizador -->
      <div class="profile-section">
        <div class="avatar-container">
          <div class="avatar-ring">
            <img :src="user.avatar" class="avatar" />
          </div>
        </div>
        <h2 class="user-name">{{ user.nomeCompleto || user.name || 'Utilizador' }}</h2>
        <p class="user-role">{{ user.area || user.localidade || 'Especialista' }}</p>
      </div>

      <!-- Informações detalhadas -->
      <div class="info-section">
        <div class="info-item">
          <div class="info-icon"><i class="fas fa-id-badge"></i></div>
          <div class="info-content">
            <span class="info-label">Número</span>
            <span class="info-value">{{ user.numero || user.id || 'Não definido' }}</span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon"><i class="fas fa-envelope"></i></div>
          <div class="info-content">
            <span class="info-label">Email</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon"><i class="fas fa-map-marker-alt"></i></div>
          <div class="info-content">
            <span class="info-label">Localidade</span>
            <span class="info-value">{{ user.localidade || user.local || 'Não definido' }}</span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon"><i class="fas fa-mobile-alt"></i></div>
          <div class="info-content">
            <span class="info-label">Telemóvel</span>
            <span class="info-value">{{ user.telemovel || 'Não definido' }}</span>
          </div>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="stats-section">
        <h3 class="section-title">Estatísticas</h3>
        <div class="stats-grid">
          <div class="stat-card active">
            <div class="stat-icon"><i class="fas fa-play"></i></div>
            <div class="stat-content">
              <span class="stat-number">{{ auditoriasAdecorrer }}</span>
              <span class="stat-label">A Decorrer</span>
            </div>
          </div>
          <div class="stat-card completed">
            <div class="stat-icon"><i class="fas fa-check"></i></div>
            <div class="stat-content">
              <span class="stat-number">{{ auditoriasConcluidas }}</span>
              <span class="stat-label">Concluídas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Progresso motivacional -->
      <div class="progress-section">
        <h3 class="section-title">Progresso</h3>
        <div class="progress-info">
          <span class="progress-label">Próximo objetivo: {{ proximoObjetivo }} auditorias</span>
          <span class="progress-percent">{{ progresso.toFixed(0) }}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progresso + '%' }"></div>
        </div>
        <div v-if="mensagemAtual" class="achievement-message">
          <i class="fas fa-trophy"></i>
          <span>{{ mensagemAtual }}</span>
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
  name: 'Perfil',
  components: { BottomNav },
  data() {
    return {
      user: {
        nomeCompleto: '',
        avatar: '',
        area: '',
        numero: '',
        email: '',
        localidade: '',
        telemovel: '',
        id: ''
      },
      auditoriasAdecorrer: 0,
      auditoriasConcluidas: 0,
      objetivos: [5, 10, 20],
      mensagens: [
        "Primeiro marco atingido! Continua assim!",
        "Excelente! Já 10 auditorias concluídas!",
        "Super Auditor! Estás no topo!",
      ],
      darkMode: true
    }
  },
  computed: {
    proximoObjetivo() {
      return this.objetivos.find(o => o > this.auditoriasConcluidas) || this.objetivos[this.objetivos.length - 1];
    },
    progresso() {
      const idx = this.objetivos.findIndex(o => o > this.auditoriasConcluidas);
      const objetivoAnterior = idx === 0 ? 0 : this.objetivos[idx - 1] || 0;
      const objetivoAtual = this.proximoObjetivo;
      const progresso = ((this.auditoriasConcluidas - objetivoAnterior) / (objetivoAtual - objetivoAnterior)) * 100;
      return Math.min(100, Math.max(0, progresso));
    },
    mensagemAtual() {
      let mensagem = "";
      for (let i = this.objetivos.length - 1; i >= 0; i--) {
        if (this.auditoriasConcluidas >= this.objetivos[i]) {
          mensagem = this.mensagens[i];
          break;
        }
      }
      return mensagem;
    }
  },
  mounted() {
    this.loadTheme()
    this.loadUserAndStats()
  },
  methods: {
    loadTheme() {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) this.darkMode = savedTheme === 'dark'
    },
    toggleTheme() {
      this.darkMode = !this.darkMode
      localStorage.setItem('theme', this.darkMode ? 'dark' : 'light')
    },
    loadUserAndStats() {
      // 1. Ler user autenticado
      const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
      let user = { ...userStorage };

      // 2. Procurar nos auditores para garantir todos os campos (caso seja login Google)
      const auditores = JSON.parse(localStorage.getItem('auditores') || '[]');
      const auditor = auditores.find(a => a.email === user.email);

      if (auditor) {
        // Misturar dados locais + info do auditor
        user = { ...auditor, ...user, nomeCompleto: auditor.nomeCompleto || user.name || user.nomeCompleto };
      }
      this.user = user;

      // 3. Estatísticas: contar auditorias associadas ao utilizador
      const uid = this.user.id; // ID do utilizador logado

      // 1) Contar auditorias “A Decorrer”
      const arrAdecorrer = JSON.parse(localStorage.getItem('auditoriasADECORRER') || '[]');
      this.auditoriasAdecorrer = arrAdecorrer.filter(a =>
        Array.isArray(a.auditores) && a.auditores.includes(uid)
      ).length;

      // 2) Contar auditorias “Concluídas”
      const arrConcluidas = JSON.parse(localStorage.getItem('auditoriasConcluidas') || '[]');
      this.auditoriasConcluidas = arrConcluidas.filter(a =>
        Array.isArray(a.auditores) && a.auditores.includes(uid)
      ).length;
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
  gap: 24px;
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

.back-btn:hover,
.settings-btn:hover {
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
  margin-bottom: 16px;
}

.avatar-ring {
  position: relative;
  padding: 4px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
  display: inline-block;
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

@keyframes pulse-ring {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.user-name {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px 0;
  font-family: 'Poppins', sans-serif;
}

.user-role {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

/* Stats Section */
.stats-section {
  margin-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-family: 'Poppins', sans-serif;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.stat-card.active {
  border-color: var(--accent-primary);
  background: linear-gradient(135deg, rgba(39, 122, 255, 0.1), rgba(0, 170, 255, 0.05));
}

.stat-card.completed {
  border-color: var(--success-primary);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
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
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Progress Section */
.progress-section {
  margin-bottom: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.progress-percent {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-primary);
}

.progress-bar-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar {
  background: linear-gradient(90deg, var(--accent-primary), var(--success-primary));
  height: 100%;
  border-radius: 8px;
  transition: width 0.8s cubic-bezier(.23, 1.01, .32, 1);
}

.achievement-message {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--success-primary);
  font-size: 14px;
  font-weight: 500;
}

.achievement-message i {
  font-size: 16px;
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

  .user-name {
    font-size: 20px;
  }

  .info-item {
    padding: 14px;
  }

  .stat-card {
    padding: 14px;
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
