<template>
  <nav class="bottom-navigation">
    <button 
      class="nav-item" 
      :class="{ active: currentRoute === 'home' }"
      @click="navigateTo('/home')"
    >
      <i class="fas fa-home"></i>
      <span>Início</span>
    </button>
    <button 
      class="nav-item" 
      :class="{ active: currentRoute === 'reports' }"
      @click="navigateTo('/mapa')"
    >
      <i class="fas fa-chart-bar"></i>
      <span>Mapa</span>
    </button>
    <button 
      class="nav-item" 
      :class="{ active: currentRoute === 'profile' }"
      @click="navigateTo('/perfil')"
    >
      <i class="fas fa-user"></i>
      <span>Perfil</span>
    </button>
  </nav>
</template>

<script>
export default {
  name: 'BottomNav',
  computed: {
    currentRoute() {
      const path = this.$route.path
      if (path === '/home' || path === '/') return 'home'
      if (path.includes('/search')) return 'search'
      if (path.includes('/reports')) return 'reports'
      if (path.includes('/profile')) return 'profile'
      return ''
    }
  },
  methods: {
    navigateTo(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    }
  }
}
</script>

<style scoped>
/* Variáveis CSS para temas */
:root {
  --bg-secondary: #132340;
  --text-primary: #ffffff;
  --text-secondary: #aad1ff;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
}

.light-mode {
  --bg-secondary: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
}

.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(19, 35, 64, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 20px;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  height: 60px;
   z-index: 9999;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 12px;
  min-width: 50px;
  opacity: 0.7;
}

.nav-item.active {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.4);
  opacity: 1;
}

.nav-item:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  opacity: 1;
}

.nav-item i {
  font-size: 18px;
}

.nav-item span {
  font-size: 11px;
  font-weight: 500;
}

/* Responsividade */
@media (max-width: 480px) {
  .bottom-navigation {
    padding: 6px 16px;
    height: 55px;
  }
  
  .nav-item {
    padding: 4px 8px;
    min-width: -8px;
  }
  
  .nav-item i {
    font-size: 16px;
  }
  
  .nav-item span {
    font-size: 10px;
  }
}

/* Para modo claro */
.light-mode .bottom-navigation {
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}
</style>
