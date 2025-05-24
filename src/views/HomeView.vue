<template>
    <div class="home-bg">

        <div class="main-content">
            <!-- Perfil -->
            <div class="profile-header">
                <div class="user-info">
                    <p class="user-name">{{ user.name }}</p>
                </div>
                <img :src="`../assets/${user.avatar}`" alt="User" class="profile-pic" />
            </div>

            <!-- Notificações -->
            <div :class="['notificacoes-iphone', { aberta: notificacoesAbertas }]">
                <template v-if="!notificacoesAbertas">
                    <!-- Só a notificação do topo visível -->
                    <div v-if="auditoriasNovas.length > 0" class="notification-iphone notification-top"
                        :class="{ focused: focusedNotifId === auditoriasNovas[0].id }"
                        @click="handleNotificationClick(auditoriasNovas[0].id)" tabindex="0">
                        <i class="fas fa-bell"></i>
                        <span class="notif-text">Nova Auditoria: {{ auditoriasNovas[0].titulo }}</span>
                    </div>
                    <div v-if="auditoriasNovas.length > 1" class="notification-iphone notification-behind"
                        style="pointer-events: none;"></div>
                    <div v-if="auditoriasNovas.length === 0" class="no-notif">Sem notificações novas.</div>
                </template>
                <template v-else>
                    <!-- Mostra todas as notificações com animação -->
                    <transition-group name="notificacao-fade" tag="div">
                        <div v-for="(aud, idx) in auditoriasNovas" :key="aud.id" class="notification-iphone"
                            :class="{ focused: focusedNotifId === aud.id }" @click="handleNotificationClick(aud.id)"
                            tabindex="0">
                            <i class="fas fa-bell"></i>
                            <span class="notif-text">Nova Auditoria: {{ aud.titulo }}</span>
                        </div>
                    </transition-group>
                    <div v-if="auditoriasNovas.length === 0" class="no-notif">Sem notificações novas.</div>
                </template>
            </div>

            <!-- Auditorias -->
            <p class="section-title">Auditorias</p>
            <div class="auditorias-grid">
                <button class="card-btn" @click="$router.push('/auditorias/adecorrer')">
                    <i class="fas fa-file-alt icon-above"></i>
                    A decorrer
                </button>
                <button class="card-btn" @click="$router.push('/auditorias/concluidas')">
                    <i class="fas fa-check icon-above"></i>
                    Concluídas
                </button>
                <button class="card-btn" @click="$router.push('/auditorias/nova')">
                    <i class="fas fa-plus icon-above"></i>
                    Novas
                </button>
                <button class="card-btn" @click="$router.push('/especialistas')">
                    <i class="fas fa-user-cog icon-above"></i>
                    Gerir Especialista
                </button>

            </div>
        </div>

        <!-- Barra de navegação inferior -->
        <NavBar />

    </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'

export default {
    name: 'HomeView',
    components: {
        NavBar
    },
    data() {
        return {
            user: { name: '', avatar: '' },
            auditoriasNovas: [],
            notificacoesAbertas: false,
            focusedNotifId: null
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
.home-bg {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 48px 20px 90px 20px;
    background: transparent;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
}

.main-content {
    flex: 1 1 auto;
    overflow-y: auto;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 28px;
    justify-content: flex-start;
    padding-top: 8px;
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-name {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
}

.profile-pic {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 3px solid #277AFF;
    object-fit: cover;
}

.section-title {
    font-weight: 600;
    font-size: 16px;
    margin: 0;
}

/* === Notificações iPhone === */
.notificacoes-iphone {
    position: relative;
    width: 100%;
    margin-bottom: 28px;
    z-index: 1;
    /* Por defeito: modo fechado (stack) */
    min-height: 56px;
    max-height: 76px;
    overflow: visible;
}

.notificacoes-iphone.aberta {
    /* Quando está aberta, permite crescer! */
    min-height: unset;
    max-height: unset;
    overflow: visible;
    margin-bottom: 36px;
    position: relative;
    z-index: 1;
    padding-bottom: 6px;
    /* espaço extra para separar das auditorias */
}

/* Notificação empilhada (stack: só 1ª + "borda" de trás) */
.notificacoes-iphone:not(.aberta) .notification-iphone.notification-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    margin: 0;
}

.notificacoes-iphone:not(.aberta) .notification-iphone.notification-behind {
    position: absolute;
    top: 32px;
    left: 18px;
    right: 18px;
    z-index: 1;
    background: #185cc6;
    opacity: 0.55;
    height: 22px;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 4px 10px 0px #277aff44;
    pointer-events: none;
    margin: 0;
}

/* Notificações em modo aberto (todas visíveis, espaçadas) */
.notificacoes-iphone.aberta .notification-iphone {
    position: relative !important;
    margin-bottom: 14px;
    z-index: 2;
}

.notificacoes-iphone.aberta .notification-iphone:last-child {
    margin-bottom: 0;
}

/* Notificação visual */
.notification-iphone {
    background-color: #277aff;
    padding: 14px 18px;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.18);
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    transition:
        transform 0.16s cubic-bezier(.23, 1.01, .32, 1),
        box-shadow 0.15s,
        background-color 0.13s,
        outline 0.14s;
    margin-bottom: 0;
    position: relative;
    z-index: 2;
}

.notification-iphone.focused,
.notification-iphone:active {
    background: #185cc6;
    box-shadow: 0 16px 40px -2px #277aff, 0 2px 12px rgba(0, 0, 0, 0.25);
    outline: 2px solid #aad1ff;
    transform: scale(1.045);
    z-index: 9;
}

.notif-text {
    flex: 1;
    white-space: pre-line;
}

.no-notif {
    color: #fff;
    opacity: 0.5;
    text-align: center;
    padding: 12px 0;
}

.notificacao-fade-enter-active,
.notificacao-fade-leave-active {
    transition: all 0.44s cubic-bezier(.23, 1.01, .32, 1);
}

.notificacao-fade-enter-from,
.notificacao-fade-leave-to {
    opacity: 0;
    transform: translateY(-24px) scale(0.96);
}

.notificacao-fade-enter-to,
.notificacao-fade-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}


/* --- RESTANTE CSS (layout e cards) --- */
.auditorias-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.card-btn {
    background-color: #1c2e4a;
    color: white;
    border: none;
    padding: 18px 12px 12px;
    border-radius: 12px;
    text-align: center;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s ease;
}

.card-btn:hover {
    background-color: #22395a;
}

.icon-above {
    font-size: 20px;
}

.nav-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #132340;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 12px 0;
    border-top: 1px solid #1c2e4a;
    z-index: 10;
    height: 64px;
}

.nav-icon {
    font-size: 20px;
    color: #bbb;
    width: 20%;
    text-align: center;
}

.nav-circle {
    background-color: #277aff;
    border-radius: 50%;
    padding: 14px;
    color: white;
    margin-top: -36px;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    z-index: 11;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 56px;
}
</style>
