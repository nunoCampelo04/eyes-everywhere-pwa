<template>
  <div class="login-bg">
    <div class="login-box">

      <!-- LOGO dentro da caixa -->
      <img src="../assets/logo.png" alt="Logo EyesEverywhere" class="logo-inside" />

      <div class="avatar-container">
        <img src="../assets/user-icon.png" alt="User Icon" class="avatar" />
      </div>

      <div class="tabs">
        <span class="active-tab">Log in</span>
        <span class="inactive-tab">Sign Up</span>
      </div>

      <form @submit.prevent="login" class="form-container">
        <input v-model="email" type="text" placeholder="EMAIL" required />
        <input v-model="password" type="password" placeholder="PASSWORD" required />
        <p class="info-text">Esqueceste-te da password?</p>
        <button type="submit">LOG IN</button>
      </form>
    </div>
  </div>
</template>


<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: ''
    }
  },
methods: {
  login() {
    const utilizadores = JSON.parse(localStorage.getItem('utilizadores') || '[]')
    const encontrado = utilizadores.find(u => u.email === this.email && u.password === this.password)

    if (encontrado) {
      localStorage.setItem('user', JSON.stringify(encontrado))
      this.$router.push('/home')
    } else {
      alert('Email ou password incorretos.')
    }
  }
}

}
</script>

<style scoped>

.logo-inside {
  width: 160px;
  height: auto;
  margin-top: -16px;
  margin-bottom: 16px;
}

.login-bg {
  background-color: #0a0f1a;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background-color: #132340;
  padding: 24px 16px;
  border-radius: 16px;
  width: 90%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.avatar-container {
  margin-top: -12px;
  margin-bottom: 16px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 4px solid white;
  background-color: #ccc;
}

.tabs {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 16px;
  font-weight: bold;
  font-size: 16px;
}

.active-tab {
  color: white;
  border-bottom: 2px solid #00aaff;
  padding-bottom: 4px;
  flex: 1;
  text-align: center;
}

.inactive-tab {
  color: #aaa;
  flex: 1;
  text-align: center;
}

.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background-color: #dce4f7;
  font-size: 14px;
}

.info-text {
  font-size: 12px;
  color: white;
  text-align: center;
  margin-top: -4px;
  margin-bottom: 4px;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}

button:hover {
  background-color: #005dc5;
}

</style>
