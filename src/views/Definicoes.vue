<template>
  <div class="definicoes-bg">
    <!-- Header -->
    <div class="definicoes-header">
      <button class="back-btn" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
      </button>
      <span class="definicoes-title">Definições</span>
      <button class="menu-btn">
        <i class="fas fa-ellipsis-v"></i>
      </button>
    </div>

    <!-- Avatar + Nome -->
    <div class="definicoes-avatar">
      <img :src="`../assets/${user.avatar}`" alt="Foto de perfil" />
    </div>
    <h2 class="definicoes-nome">{{ user.name }}</h2>

    <!-- Opções -->
    <div class="definicoes-opcoes">
      <button class="definicoes-btn" style="justify-content: space-between;">
        <span style="display: flex; align-items: center; gap:10px;">
          <i class="fas fa-bell"></i>
          <span>Notificações</span>
        </span>
        <span class="definicoes-switch">
          <input type="checkbox" class="switch-checkbox" v-model="notificacoesAtivas" id="switchNotif" />
          <span class="switch-slider"></span>
        </span>
      </button>
      <button class="definicoes-btn" @click="abrirModal('privacidade')">
        <i class="fas fa-key"></i>
        <span>Privacidade</span>
      </button>
      <button class="definicoes-btn" @click="abrirModal('termos')">
        <i class="fas fa-file-alt"></i>
        <span>Termos de uso e política de privacidade</span>
      </button>
      <button class="definicoes-btn" @click="abrirModal('contacto')">
        <i class="fas fa-envelope"></i>
        <span>Contacte-nos</span>
      </button>
    </div>

    <!-- Terminar Sessão -->
    <button class="definicoes-logout" @click="terminarSessao">
      <i class="fas fa-sign-out-alt"></i>
      Terminar Sessão
    </button>

    <!-- Modal para info -->
    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-conteudo">
        <h3>{{ modalTitulo }}</h3>
        <div class="modal-texto" v-html="modalTexto"></div>
        <button class="modal-fechar" @click="fecharModal">Fechar</button>
      </div>
    </div>

    <!-- NavBar -->
    <NavBar />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'

export default {
  name: 'Definicoes',
  components: { NavBar },
  data() {
    return {
      user: {
        name: '',
        avatar: ''
      },
      notificacoesAtivas: true,
      modalAberto: false,
      modalTitulo: '',
      modalTexto: ''
    }
  },
  mounted() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      this.user = JSON.parse(savedUser)
    }
  },
  methods: {
    terminarSessao() {
      localStorage.removeItem('user')
      this.$router.push('/')
    },
    abrirModal(tipo) {
      if (tipo === 'termos') {
        this.modalTitulo = "Termos de Utilização e Política de Privacidade"
        this.modalTexto = `
        <b>Termos de Utilização</b><br>
        Esta aplicação foi desenvolvida para facilitar a gestão de auditorias e ocorrências. Ao utilizar a aplicação, assumes o compromisso de fornecer informações verdadeiras e utilizar as funcionalidades de forma responsável.<br><br>
        Não é permitido o uso da app para fins ilícitos ou para comprometer a segurança de outros utilizadores.<br>
        Reservamo-nos o direito de atualizar estes termos sem aviso prévio.<br><br>
        <b>Política de Privacidade</b><br>
        Respeitamos a tua privacidade! Todos os dados inseridos são armazenados apenas no teu dispositivo. Não partilhamos, vendemos ou transmitimos qualquer informação pessoal a terceiros. Podes apagar os teus dados a qualquer momento terminando a sessão ou removendo a app.
      `
      } else if (tipo === 'privacidade') {
        this.modalTitulo = "Privacidade"
        this.modalTexto = `
        <b>Privacidade dos teus dados</b><br>
        - Todos os dados ficam guardados apenas no teu dispositivo (localStorage).<br>
        - Não recolhemos informações pessoais nem monitorizamos a tua utilização da app.<br>
        - Para mais segurança, evita partilhar as tuas credenciais.<br>
        - Em caso de dúvida, contacta-nos pelo email indicado.
      `
      } else if (tipo === 'contacto') {
        this.modalTitulo = "Contacte-nos"
        this.modalTexto = `
        <p>Em caso de dúvida, sugestão ou necessidade de apoio técnico, envia um email para 
        <a href="mailto:suporte@aplicacao.pt">suporte@aplicacao.pt</a> ou telefona para 212 345 678.</p>
      `
      }
      this.modalAberto = true
    },
    fecharModal() {
      this.modalAberto = false
    }
  }

}
</script>

<style scoped>
.definicoes-bg {
  min-height: 100vh;
  background: #0C1425;
  padding: 28px 16px 90px 16px;
  color: #DCE4F7;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.definicoes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}

.back-btn,
.menu-btn {
  background: none;
  border: none;
  color: #AAD1FF;
  font-size: 20px;
  cursor: pointer;
  width: 34px;
}

.definicoes-title {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: #DCE4F7;
}

.definicoes-avatar {
  display: flex;
  justify-content: center;
  margin: 18px 0 8px 0;
}

.definicoes-avatar img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid #277AFF;
  object-fit: cover;
}

.definicoes-nome {
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #fff;
  width: 100%;
}

/* Botões/opções */
.definicoes-opcoes {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 26px;
}

.definicoes-btn {
  background: #1c2e4a;
  border: none;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  transition: background 0.14s;
  width: 100%;
  justify-content: flex-start;
  cursor: pointer;
}

.definicoes-btn i {
  font-size: 17px;
  color: #aad1ff;
  margin-right: 6px;
}

.definicoes-btn span {
  flex: 1;
  text-align: left;
}

.definicoes-btn:hover {
  background: #22395a;
}

/* SWITCH DE NOTIFICAÇÕES (iOS Style) */
.definicoes-switch {
  display: flex;
  align-items: center;
  height: 24px;
  min-width: 46px;
  position: relative;
}

.switch-checkbox {
  appearance: none;
  width: 40px;
  height: 22px;
  border-radius: 12px;
  background: #22395a;
  outline: none;
  cursor: pointer;
  transition: background 0.18s;
  position: relative;
  box-shadow: 0 0 0 2px #22395a40;
  margin: 0;
}

.switch-checkbox:checked {
  background: #277AFF;
}

.switch-slider {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: left 0.2s cubic-bezier(.22, .67, .5, 1.36);
  box-shadow: 0 1px 5px #185cc699;
  pointer-events: none;
}

.switch-checkbox:checked+.switch-slider {
  left: 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.44);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-conteudo {
  background: #1c2e4a;
  color: #fff;
  border-radius: 16px;
  padding: 28px 22px 18px 22px;
  box-shadow: 0 6px 24px #0006;
  width: 90vw;
  max-width: 380px;
  min-width: 260px;
  text-align: center;
  animation: popIn 0.22s cubic-bezier(.23, 1.01, .32, 1);
}

@keyframes popIn {
  from {
    transform: scale(0.94);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-texto {
  font-size: 15px;
  margin: 14px 0 12px 0;
  color: #DCE4F7;
}

.modal-fechar {
  background: #277aff;
  color: #fff;
  border: none;
  border-radius: 9px;
  padding: 10px 32px;
  margin-top: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 10px #277aff44;
  transition: background 0.15s;
}

.modal-fechar:hover {
  background: #185cc6;
}

/* Terminar Sessão */
.definicoes-logout {
  width: 100%;
  background: #1c2e4a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 0;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  margin-bottom: 30px;
  transition: background-color 0.14s;
  cursor: pointer;
}

.definicoes-logout:hover {
  background: #22395a;
}
</style>
