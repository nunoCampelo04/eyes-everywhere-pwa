<template>
  <nav class="navbar-especialista">
    <div class="nav-container">
      <!-- Logo/Título -->
      <div class="nav-brand">
        <div class="logo-icon">🔍</div>
        <span class="brand-text">AuditPro</span>
        <span class="user-type">Especialista</span>
      </div>

      <!-- Menu Principal -->
      <div class="nav-menu" :class="{ 'active': menuAberto }">
        <router-link 
          to="/especialista/dashboard" 
          class="nav-item"
          :class="{ 'active': $route.name === 'DashboardEspecialista' }"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">Dashboard</span>
        </router-link>

        <router-link 
          to="/especialista/atribuidas" 
          class="nav-item"
          :class="{ 'active': $route.name === 'AuditoriasAtribuidas' }"
        >
          <span class="nav-icon">📋</span>
          <span class="nav-text">Atribuídas</span>
          <span v-if="auditoriasAtribuidas > 0" class="badge">{{ auditoriasAtribuidas }}</span>
        </router-link>

        <router-link 
          to="/especialista/andamento" 
          class="nav-item"
          :class="{ 'active': $route.name === 'AuditoriasAndamento' }"
        >
          <span class="nav-icon">⚡</span>
          <span class="nav-text">Em Andamento</span>
          <span v-if="auditoriasAndamento > 0" class="badge warning">{{ auditoriasAndamento }}</span>
        </router-link>

        <router-link 
          to="/especialista/concluidas" 
          class="nav-item"
          :class="{ 'active': $route.name === 'AuditoriasConcluidas' }"
        >
          <span class="nav-icon">✅</span>
          <span class="nav-text">Concluídas</span>
        </router-link>

        <router-link 
          to="/especialista/perfil" 
          class="nav-item"
          :class="{ 'active': $route.name === 'PerfilEspecialista' }"
        >
          <span class="nav-icon">👤</span>
          <span class="nav-text">Perfil</span>
        </router-link>
      </div>

      <!-- Área do Utilizador -->
      <div class="nav-user">
        <div class="user-info">
          <img :src="'/images/' + user.imagem" :alt="user.nome" class="user-avatar" />
          <div class="user-details">
            <span class="user-name">{{ user.nome }}</span>
            <span class="user-specialty">{{ user.especialidade }}</span>
          </div>
        </div>
        <button @click="logout" class="logout-btn">
          <span class="logout-icon">🚪</span>
        </button>
      </div>

      <!-- Botão Mobile -->
      <button class="mobile-toggle" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBarEspecialista',
  data() {
    return {
      menuAberto: false,
      user: {},
      auditoriasAtribuidas: 0,
      auditoriasAndamento: 0
    }
  },
  mounted() {
    this.carregarDados()
  },
  methods: {
    carregarDados() {
      this.user = JSON.parse(localStorage.getItem('user') || '{}')
      this.contarAuditorias()
    },
    contarAuditorias() {
      const auditorias = JSON.parse(localStorage.getItem('auditorias') || '[]')
      
      this.auditoriasAtribuidas = auditorias.filter(a => 
        a.especialistas.includes(this.user.nome) && 
        (!a.especialistaStatus || !a.especialistaStatus[this.user.nome])
      ).length

      this.auditoriasAndamento = auditorias.filter(a => 
        a.especialistas.includes(this.user.nome) && 
        a.especialistaStatus && 
        a.especialistaStatus[this.user.nome] === 'em_andamento'
      ).length
    },
    toggleMenu() {
      this.menuAberto = !this.menuAberto
    },
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.navbar-especialista {
  background: linear-gradient(135deg, #1a2332 0%, #0C1425 100%);
  border-bottom: 1px solid #2a3441;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 1.5rem;
  background: linear-gradient(45deg, #4F46E5, #7C3AED);
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #DCE4F7;
}

.user-type {
  background: #4F46E5;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #94A3B8;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(79, 70, 229, 0.1);
  color: #DCE4F7;
  transform: translateY(-1px);
}

.nav-item.active {
  background: linear-gradient(45deg, #4F46E5, #7C3AED);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-text {
  font-size: 0.9rem;
}

.badge {
  background: #EF4444;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  min-width: 1.2rem;
  text-align: center;
  font-weight: 600;
}

.badge.warning {
  background: #F59E0B;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #4F46E5;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #DCE4F7;
}

.user-specialty {
  font-size: 0.75rem;
  color: #94A3B8;
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #EF4444;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-toggle span {
  width: 20px;
  height: 2px;
  background: #DCE4F7;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }
  
  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #0C1425;
    flex-direction: column;
    padding: 1rem;
    border-top: 1px solid #2a3441;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .nav-menu.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-item {
    width: 100%;
    justify-content: flex-start;
  }
  
  .mobile-toggle {
    display: flex;
  }
  
  .user-details {
    display: none;
  }
}
</style>
