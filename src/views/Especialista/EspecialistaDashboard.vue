<template>
  <div class="home-container">
    <!-- Background Pattern -->
    <div class="background-pattern"></div>
    
    <div class="main-content">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="user-section">
          <div class="greeting-container">
            <h1 class="user-greeting">Olá, {{ user.name }}</h1>
            <div class="online-indicator"></div>
          </div>
          <p class="current-date">{{ currentDate }}</p>
          <div class="productivity-stats">
            <i class="fas fa-chart-line"></i>
            <span>Produtividade: +15% esta semana</span>
          </div>
        </div>
        <div class="avatar-container">
          <div class="avatar-glow"></div>
          <img :src="`../assets/${user.avatar}`" :alt="`Avatar de ${user.name}`" class="profile-pic" />
          <div class="status-indicator"></div>
          <div class="star-badge">
            <i class="fas fa-star"></i>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-number">23</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card">
          <div class="stat-number emerald">12</div>
          <div class="stat-label">Concluídas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number amber">3</div>
          <div class="stat-label">Ativas</div>
        </div>
      </div>

      <!-- Notificações -->
      <div class="notifications-section">
        <div class="section-header">
          <h2 class="section-title">Notificações</h2>
          <div v-if="auditoriasNovas.length > 0" class="notification-badge">
            {{ auditoriasNovas.length }} novas
          </div>
        </div>

        <div :class="['notificacoes-container', { aberta: notificacoesAbertas }]">
          <template v-if="!notificacoesAbertas">
            <!-- Só a notificação do topo visível -->
            <div v-if="auditoriasNovas.length > 0" class="notification-card main-notification"
                :class="{ focused: focusedNotifId === auditoriasNovas[0].id }"
                @click="handleNotificationClick(auditoriasNovas[0].id)" tabindex="0">
              <div class="notification-icon">
                <i class="fas fa-bell"></i>
              </div>
              <div class="notification-content">
                <p class="notification-title">Nova Auditoria: {{ auditoriasNovas[0].titulo }}</p>
                <p class="notification-time">Há alguns minutos</p>
              </div>
            </div>
            <div v-if="auditoriasNovas.length > 1" class="notification-behind second"></div>
            <div v-if="auditoriasNovas.length > 2" class="notification-behind third"></div>
            <div v-if="auditoriasNovas.length === 0" class="no-notifications">
              <i class="fas fa-bell"></i>
              <p>Sem notificações novas</p>
            </div>
          </template>
          <template v-else>
            <!-- Mostra todas as notificações com animação -->
            <transition-group name="notificacao-fade" tag="div" class="notifications-expanded">
              <div v-for="(aud, idx) in auditoriasNovas" :key="aud.id" class="notification-card"
                  :class="{ focused: focusedNotifId === aud.id }" @click="handleNotificationClick(aud.id)"
                  tabindex="0">
                <div class="notification-icon">
                  <i class="fas fa-bell"></i>
                </div>
                <div class="notification-content">
                  <p class="notification-title">Nova Auditoria: {{ aud.titulo }}</p>
                  <p class="notification-time">Há alguns minutos</p>
                </div>
              </div>
            </transition-group>
            <div v-if="auditoriasNovas.length === 0" class="no-notifications">
              <i class="fas fa-bell"></i>
              <p>Sem notificações novas</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Auditorias Grid -->
      <div class="auditorias-section">
        <h2 class="section-title">Auditorias</h2>
        <div class="auditorias-grid">
          <div class="audit-card blue-card" @click="$router.push('/auditorias/adecorrer')">
            <div class="card-gradient-overlay"></div>
            <div class="card-content">
              <div class="icon-container">
                <div class="icon-background blue-gradient">
                  <i class="fas fa-file-alt"></i>
                </div>
                <div class="count-badge blue-badge">3</div>
              </div>
              <div class="card-text">
                <h3 class="card-title">A decorrer</h3>
                <p class="card-subtitle">Auditorias ativas</p>
              </div>
            </div>
          </div>

          <div class="audit-card green-card" @click="$router.push('/auditorias/concluidas')">
            <div class="card-gradient-overlay"></div>
            <div class="card-content">
              <div class="icon-container">
                <div class="icon-background green-gradient">
                  <i class="fas fa-check"></i>
                </div>
                <div class="count-badge green-badge">12</div>
              </div>
              <div class="card-text">
                <h3 class="card-title">Concluídas</h3>
                <p class="card-subtitle">Finalizadas</p>
              </div>
            </div>
          </div>

          <div class="audit-card orange-card" @click="$router.push('/auditorias/nova')">
            <div class="card-gradient-overlay"></div>
            <div class="card-content">
              <div class="icon-container">
                <div class="icon-background orange-gradient">
                  <i class="fas fa-plus"></i>
                </div>
                <div v-if="auditoriasNovas.length > 0" class="count-badge orange-badge">{{ auditoriasNovas.length }}</div>
              </div>
              <div class="card-text">
                <h3 class="card-title">Novas</h3>
                <p class="card-subtitle">Aguardando início</p>
              </div>
            </div>
          </div>

          <div class="audit-card dark-blue-card" @click="$router.push('/especialistas')">
            <div class="card-gradient-overlay"></div>
            <div class="card-content">
              <div class="icon-container">
                <div class="icon-background dark-blue-gradient">
                  <i class="fas fa-user-cog"></i>
                </div>
                <div class="count-badge dark-blue-badge">8</div>
              </div>
              <div class="card-text">
                <h3 class="card-title">Especialistas</h3>
                <p class="card-subtitle">Gerir equipa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <button class="nav-item active">
        <div class="nav-icon-container active">
          <i class="fas fa-home"></i>
        </div>
        <span class="nav-label">Início</span>
      </button>
      <button class="nav-item">
        <div class="nav-icon-container">
          <i class="fas fa-search"></i>
        </div>
        <span class="nav-label">Pesquisar</span>
      </button>
      <button class="nav-item">
        <div class="nav-icon-container">
          <i class="fas fa-cog"></i>
        </div>
        <span class="nav-label">Definições</span>
      </button>
      <button class="nav-item">
        <div class="nav-icon-container">
          <i class="fas fa-user"></i>
        </div>
        <span class="nav-label">Perfil</span>
      </button>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      user: { name: '', avatar: '' },
      auditoriasNovas: [],
      notificacoesAbertas: false,
      focusedNotifId: null
    }
  },
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    }
  },
  mounted() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }

    const auditoriasNovas = localStorage.getItem('auditoriasNovas');
    if (auditoriasNovas) {
      this.auditoriasNovas = JSON.parse(auditoriasNovas);
    }

    // DEBUG
    console.log("Auditorias Novas:", this.auditoriasNovas);
  },
  methods: {
    handleNotificationClick(id) {
      if (!this.notificacoesAbertas) {
        this.notificacoesAbertas = true;
        setTimeout(() => {
          this.notificacoesAbertas = false;
          this.focusedNotifId = null;
        }, 8000);
      } else if (this.focusedNotifId === id) {
        this.irParaDetalhe(id);
      } else {
        this.focusedNotifId = id;
        setTimeout(() => {
          if (this.focusedNotifId === id) this.focusedNotifId = null;
        }, 2000);
      }
    },
    irParaDetalhe(id) {
      this.focusedNotifId = null;
      this.notificacoesAbertas = false;
      this.$router.push(`/auditoriasnovas/${id}`);
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  min-height: 100dvh; /* Para mobile */
  background: linear-gradient(135deg, #132340 0%, #1c2e4a 50%, #277aff 100%);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.background-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.main-content {
  flex: 1;
  padding: 2rem 1rem 6rem 1rem;
  max-width: 28rem;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-sizing: border-box;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .main-content {
    padding: 1.5rem 1rem 5rem 1rem;
    gap: 1.25rem;
    max-width: 100%;
  }
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.user-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.greeting-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-greeting {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #aad1ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

@media (max-width: 640px) {
  .user-greeting {
    font-size: 1.25rem;
  }
}

.online-indicator {
  width: 0.5rem;
  height: 0.5rem;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.current-date {
  color: rgba(170, 209, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0;
}

.productivity-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(170, 209, 255, 0.6);
  font-size: 0.625rem;
}

.avatar-container {
  position: relative;
}

.avatar-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #277aff 0%, #185cc6 100%);
  border-radius: 50%;
  filter: blur(0.5rem);
  opacity: 0.6;
  animation: pulse 2s infinite;
}

.profile-pic {
  position: relative;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 3px solid #277aff;
  object-fit: cover;
  box-shadow: 0 8px 25px rgba(39, 122, 255, 0.3);
}

@media (max-width: 640px) {
  .profile-pic {
    width: 3.5rem;
    height: 3.5rem;
  }
}

.status-indicator {
  position: absolute;
  bottom: -0.125rem;
  right: -0.125rem;
  width: 1rem;
  height: 1rem;
  background: linear-gradient(135deg, #4ade80 0%, #10b981 100%);
  border-radius: 50%;
  border: 2px solid #132340;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator::after {
  content: '';
  width: 0.25rem;
  height: 0.25rem;
  background: white;
  border-radius: 50%;
}

.star-badge {
  position: absolute;
  top: -0.125rem;
  left: -0.125rem;
  width: 1rem;
  height: 1rem;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  border-radius: 50%;
  border: 2px solid #132340;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.5rem;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-card {
  background: rgba(39, 122, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(39, 122, 255, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem;
  text-align: center;
}

@media (max-width: 640px) {
  .stat-card {
    padding: 0.5rem;
  }
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.stat-number.emerald {
  color: #10b981;
}

.stat-number.amber {
  color: #f59e0b;
}

.stat-label {
  font-size: 0.625rem;
  color: rgba(170, 209, 255, 0.7);
  margin-top: 0.25rem;
}

/* Notifications */
.notifications-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.notification-badge {
  background: linear-gradient(135deg, #277aff 0%, #185cc6 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(39, 122, 255, 0.3);
}

.notificacoes-container {
  position: relative;
  transition: all 0.5s ease;
}

.notificacoes-container.aberta {
  margin-bottom: 1rem;
}

.no-notifications {
  background: rgba(39, 122, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(39, 122, 255, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  color: rgba(170, 209, 255, 0.7);
}

.no-notifications i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.notification-card {
  background: rgba(39, 122, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(39, 122, 255, 0.3);
  border-radius: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
  z-index: 10;
}

.notification-card:hover {
  transform: scale(1.02);
  background: rgba(39, 122, 255, 0.2);
}

.notification-card.focused {
  background: rgba(39, 122, 255, 0.4);
  border-color: rgba(39, 122, 255, 0.6);
  box-shadow: 0 8px 25px rgba(39, 122, 255, 0.3);
  transform: scale(1.02);
}

.main-notification {
  background: rgba(39, 122, 255, 0.2);
  border-color: rgba(39, 122, 255, 0.4);
  box-shadow: 0 4px 15px rgba(39, 122, 255, 0.2);
}

.notification-behind {
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  background: rgba(39, 122, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(39, 122, 255, 0.2);
  border-radius: 0.75rem;
  pointer-events: none;
}

.notification-behind.second {
  top: 0.5rem;
  height: 2.5rem;
  z-index: 0;
}

.notification-behind.third {
  top: 1rem;
  height: 2rem;
  z-index: 0;
  left: 1rem;
  right: 1rem;
}

.notifications-expanded {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification-icon {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #277aff 0%, #185cc6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 0.875rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1.25;
  margin: 0 0 0.25rem 0;
}

.notification-time {
  color: rgba(170, 209, 255, 0.7);
  font-size: 0.625rem;
  margin: 0;
}

/* Auditorias Grid */
.auditorias-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auditorias-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.audit-card {
  background: rgba(39, 122, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

@media (max-width: 640px) {
  .audit-card {
    padding: 0.75rem;
  }
}

.audit-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-gradient-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.audit-card:hover .card-gradient-overlay {
  opacity: 0.1;
}

/* Cores originais azuis */
.blue-card {
  border: 1px solid rgba(39, 122, 255, 0.3);
}

.blue-card .card-gradient-overlay {
  background: linear-gradient(135deg, #277aff 0%, #185cc6 100%);
}

.green-card {
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.green-card .card-gradient-overlay {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.orange-card {
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.orange-card .card-gradient-overlay {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
}

.dark-blue-card {
  border: 1px solid rgba(28, 46, 74, 0.5);
}

.dark-blue-card .card-gradient-overlay {
  background: linear-gradient(135deg, #1c2e4a 0%, #132340 100%);
}

.card-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.icon-container {
  position: relative;
}

.icon-background {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

@media (max-width: 640px) {
  .icon-background {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
}

.audit-card:hover .icon-background {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.blue-gradient {
  background: linear-gradient(135deg, #277aff 0%, #185cc6 100%);
}

.green-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.orange-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
}

.dark-blue-gradient {
  background: linear-gradient(135deg, #1c2e4a 0%, #132340 100%);
}

.count-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.blue-badge {
  background: linear-gradient(135deg, #277aff 0%, #185cc6 100%);
}

.green-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.orange-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
}

.dark-blue-badge {
  background: linear-gradient(135deg, #1c2e4a 0%, #132340 100%);
}

.card-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.card-title {
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  margin: 0;
}

.card-subtitle {
  color: rgba(170, 209, 255, 0.6);
  font-size: 0.625rem;
  margin: 0;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(19, 35, 64, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(39, 122, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem 0;
  z-index: 50;
  height: 4rem;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.nav-item:hover {
  color: #94a3b8;
  background: rgba(39, 122, 255, 0.1);
}

.nav-item.active {
  color: #277aff;
}

.nav-icon-container {
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(39, 122, 255, 0.1);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.nav-icon-container.active {
  background: linear-gradient(135deg, #277aff 0%, #185cc6 100%);
  color: white;
}

.nav-label {
  font-size: 0.625rem;
  font-weight: 500;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.notificacao-fade-enter-active,
.notificacao-fade-leave-active {
  transition: all 0.44s cubic-bezier(0.23, 1.01, 0.32, 1);
}

.notificacao-fade-enter-from,
.notificacao-fade-leave-to {
  opacity: 0;
  transform: translateY(-1rem) scale(0.96);
}

.notificacao-fade-enter-to,
.notificacao-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .home-container {
    min-height: 100vh;
    min-height: 100dvh;
  }
  
  .bottom-nav {
    height: 3.5rem;
    padding: 0.375rem 0;
  }
}

/* Landscape mobile */
@media (max-width: 640px) and (orientation: landscape) {
  .main-content {
    padding: 1rem 1rem 4rem 1rem;
    gap: 1rem;
  }
  
  .profile-pic {
    width: 3rem;
    height: 3rem;
  }
  
  .quick-stats {
    gap: 0.5rem;
  }
  
  .stat-card {
    padding: 0.5rem 0.25rem;
  }
  
  .audit-card {
    padding: 0.5rem;
  }
  
  .icon-background {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.875rem;
  }
}
</style>