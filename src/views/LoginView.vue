<template>
  <div class="login-bg" :class="{ 'light-mode': !darkMode }">
    <!-- Toggle de tema no canto superior direito -->
    <button class="theme-toggle" @click="toggleTheme">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>

    <div class="login-box">
      <!-- Header elegante -->
      <div class="login-header">
        <img src="../assets/logo.png" alt="Logo EyesEverywhere" class="logo-inside" />
        <h2 class="welcome-text">Bem-vindo de volta</h2>
        <p class="subtitle">Escolha o seu tipo de acesso</p>
      </div>

      <!-- Avatar com anel animado -->
      <div class="avatar-container">
        <div class="avatar-ring">
          <img src="../assets/user-icon.png" alt="User Icon" class="avatar" />
        </div>
      </div>

      <!-- TABS com ícones e animações -->
      <div class="tabs">
        <span :class="{ 'active-tab': tipoLogin === 'gestor', 'inactive-tab': tipoLogin !== 'gestor' }"
          @click="tipoLogin = 'gestor'">
          <i class="fas fa-user-tie"></i>
          Gestor
        </span>
        <span :class="{ 'active-tab': tipoLogin === 'especialista', 'inactive-tab': tipoLogin !== 'especialista' }"
          @click="tipoLogin = 'especialista'">
          <i class="fas fa-user-cog"></i>
          Especialista
        </span>
      </div>

      <form @submit.prevent="login" class="form-container">
        <!-- Input com ícones -->
        <div class="input-group">
          <i class="fas fa-envelope input-icon"></i>
          <input v-model="email" type="email" placeholder="EMAIL" required />
        </div>

        <div class="input-group">
          <i class="fas fa-lock input-icon"></i>
          <input v-model="password" type="password" placeholder="PASSWORD" required />
        </div>

        <p class="info-text" @click="showForgotPassword">
          <i class="fas fa-question-circle"></i>
          Esqueceste-te da password?
        </p>

        <!-- Botão com loading state -->
        <button type="submit" :disabled="isLoading" class="login-btn">
          <span v-if="!isLoading" class="btn-content">
            <i class="fas fa-sign-in-alt"></i>
            LOG IN
          </span>
          <div v-else class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            Entrando...
          </div>
        </button>

        <!-- Divisor elegante -->
        <div class="divider">
          <span>ou</span>
        </div>

        <!-- Botão Google melhorado -->
        <button class="google-btn" @click.prevent="loginGoogle" type="button" :disabled="isLoading">
          <img src="https://developers.google.com/identity/images/g-logo.png" class="google-logo" />
          <span>Entrar com Google</span>
          <i class="fas fa-external-link-alt google-icon"></i>
        </button>
      </form>

      <!-- Indicador de tipo de login -->
      <div class="login-type-indicator">
        <i :class="tipoLogin === 'gestor' ? 'fas fa-building' : 'fas fa-tools'"></i>
        <span>Acesso {{ tipoLogin === 'gestor' ? 'Administrativo' : 'Técnico' }}</span>
      </div>
    </div>

    <!-- Partículas de fundo (opcional) -->
    <div class="background-particles">
      <div class="particle" v-for="n in 6" :key="n" :style="getParticleStyle(n)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, provider, signInWithPopup } from '../firebase'

const email = ref('')
const password = ref('')
const tipoLogin = ref('gestor')
const isLoading = ref(false)
const darkMode = ref(true)
const router = useRouter()

// Theme
const toggleTheme = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('theme', darkMode.value ? 'dark' : 'light')
}

const getParticleStyle = (index) => {
  const styles = [
    { top: '10%', left: '10%', animationDelay: '0s' },
    { top: '20%', right: '15%', animationDelay: '2s' },
    { top: '60%', left: '5%', animationDelay: '4s' },
    { bottom: '20%', right: '10%', animationDelay: '1s' },
    { bottom: '10%', left: '20%', animationDelay: '3s' },
    { top: '40%', right: '5%', animationDelay: '5s' }
  ]
  return styles[index - 1] || {}
}


const login = async () => {
  isLoading.value = true
  await new Promise(r => setTimeout(r, 1000))
  try {
    if (tipoLogin.value === 'gestor') {
      const utilizadores = JSON.parse(localStorage.getItem('utilizadores') || '[]')
      const encontrado = utilizadores.find(u => u.email === email.value && u.password === password.value)
      if (encontrado) {
        localStorage.setItem('user', JSON.stringify({ ...encontrado, tipo: 'gestor' }))
        router.push('/home')
      } else {
        alert('Email ou password incorretos.')
      }
    } else {
      const especialistas = JSON.parse(localStorage.getItem('especialistas') || '[]')
      const encontrado = especialistas.find(e => e.email === email.value && e.password === password.value)
      if (encontrado) {
        localStorage.setItem('user', JSON.stringify({ ...encontrado, tipo: 'especialista' }))
        router.push('/home/especialista')
      } else {
        alert('Email ou password incorretos para especialista.')
      }
    }
  } catch (error) {
    alert('Erro ao fazer login. Tenta novamente.')
  } finally {
    isLoading.value = false
  }
}

const loginGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log('User autenticado:', user)

    const emailGoogle = user.email

    // Procurar em auditores
    const auditoresStr = localStorage.getItem('auditores') || '[]'
    const auditores = JSON.parse(auditoresStr)
    const auditor = auditores.find(a => a.email === emailGoogle)
    if (!auditor) {
      alert('Este email não está registado como auditor no sistema.')
      return
    }
    const utilizadorAutenticado = {
      ...auditor,
      email: emailGoogle,
      avatar: user.photoURL || '',
      metodo: 'google'
    }
    localStorage.setItem('user', JSON.stringify(utilizadorAutenticado))
    router.push('/home')
  } catch (e) {
    alert('Erro ao autenticar com Google.')
  }
}
</script>


<style scoped>
/* Variáveis CSS para temas */
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

/* Background principal */
.login-bg {
  background: var(--bg-primary);
  min-height: 100vh;
  min-height: 100dvh;
  /* Usar dynamic viewport height */
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
  padding: 10px;
  /* Adicionar padding para mobile */
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

/* Toggle de tema */
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

/* Caixa de login principal */
.login-box {
  background: var(--bg-secondary);
  padding: 24px 20px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.5s ease;
  max-height: calc(100vh - 20px);
  /* Limitar altura máxima */
  max-height: calc(100dvh - 20px);
  overflow-y: auto;
  /* Permitir scroll se necessário */
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo-inside {
  width: 140px;
  height: auto;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.welcome-text {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  font-family: 'Poppins', sans-serif;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 13px;
  margin: 0;
  opacity: 0.8;
}

/* Avatar com anel animado */
.avatar-container {
  margin-bottom: 20px;
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

/* Tabs melhoradas */
.tabs {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 3px;
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  gap: 3px;
}

.tabs span {
  flex: 1;
  padding: 10px 12px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.active-tab {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.3);
}

.inactive-tab {
  color: var(--text-secondary);
}

.inactive-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

/* Form container */
.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Input groups com ícones */
.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  z-index: 1;
  transition: color 0.3s ease;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px 12px 12px 38px;
  border-radius: 10px;
  border: 2px solid transparent;
  background-color: var(--input-bg);
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  color: var(--input-text);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input::placeholder {
  color: #666;
  font-weight: 500;
}

input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(39, 122, 255, 0.1);
  transform: translateY(-1px);
}

input:focus+.input-icon {
  color: var(--accent-primary);
}

/* Info text melhorado */
.info-text {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px;
  border-radius: 6px;
  margin: -2px 0;
}

.info-text:hover {
  color: var(--accent-primary);
  background: rgba(39, 122, 255, 0.05);
}

/* Botão principal melhorado */
.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--accent-primary), #1e6bb8);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  transform: translateY(0);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(39, 122, 255, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* Divisor elegante */
.divider {
  position: relative;
  text-align: center;
  margin: 6px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.divider span {
  background: var(--bg-secondary);
  padding: 0 12px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
}

/* Botão Google melhorado */
.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.google-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #d0d0d0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.google-logo {
  width: 18px;
  height: 18px;
}

.google-icon {
  font-size: 11px;
  opacity: 0.6;
}

/* Indicador de tipo de login */
.login-type-indicator {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 11px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Partículas de fundo */
.background-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: var(--accent-primary);
  border-radius: 50%;
  opacity: 0.2;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-15px) rotate(180deg);
  }
}

/* Responsividade MELHORADA para mobile */
@media (max-width: 480px) {
  .login-bg {
    padding: 5px;
    align-items: flex-start;
    padding-top: 10px;
  }

  .login-box {
    margin: 0;
    padding: 16px;
    border-radius: 16px;
    max-height: calc(100vh - 10px);
    max-height: calc(100dvh - 10px);
  }

  .login-header {
    margin-bottom: 16px;
  }

  .logo-inside {
    width: 120px;
    margin-bottom: 8px;
  }

  .welcome-text {
    font-size: 16px;
  }

  .subtitle {
    font-size: 12px;
  }

  .avatar-container {
    margin-bottom: 16px;
  }

  .avatar {
    width: 50px;
    height: 50px;
  }

  .tabs {
    margin-bottom: 16px;
  }

  .tabs span {
    font-size: 12px;
    padding: 8px 10px;
    gap: 4px;
  }

  .form-container {
    gap: 12px;
  }

  .input-group {
    margin-bottom: 0;
  }

  .login-type-indicator {
    margin-top: 12px;
    font-size: 10px;
    padding: 4px 10px;
  }

  .theme-toggle {
    width: 35px;
    height: 35px;
    top: 10px;
    right: 10px;
    font-size: 14px;
  }

  /* Reduzir partículas no mobile */
  .particle {
    width: 2px;
    height: 2px;
    opacity: 0.1;
  }
}

/* Para ecrãs muito pequenos */
@media (max-height: 700px) and (max-width: 480px) {
  .login-box {
    padding: 12px;
  }

  .login-header {
    margin-bottom: 12px;
  }

  .logo-inside {
    width: 100px;
    margin-bottom: 6px;
  }

  .avatar-container {
    margin-bottom: 12px;
  }

  .avatar {
    width: 45px;
    height: 45px;
  }

  .tabs {
    margin-bottom: 12px;
  }

  .form-container {
    gap: 10px;
  }

  .login-type-indicator {
    margin-top: 8px;
  }
}

@media (min-width: 768px) {
  .login-box {
    padding: 32px 28px;
    max-width: 420px;
  }

  .logo-inside {
    width: 160px;
  }

  .avatar {
    width: 70px;
    height: 70px;
  }
}

/* Animações de entrada */
.login-box {
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