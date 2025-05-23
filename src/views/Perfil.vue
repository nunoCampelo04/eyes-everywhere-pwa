<template>
    <div class="perfil-page">
        <!-- Header com seta voltar e definições -->
        <div class="perfil-header">
            <button class="back-btn" @click="$router.back()">&#8592;</button>
            <span class="perfil-title">Perfil</span>
            <button class="settings-btn" @click="$router.push('/definicoes')">
                <i class="fa fa-cog"></i>
            </button>
        </div>

        <!-- Foto do utilizador -->
        <div class="perfil-avatar">
            <img :src="`../assets/${user.avatar}`" alt="Foto de perfil" />
        </div>

        <!-- Nome do utilizador -->
        <h2 class="perfil-nome">{{ user.name }}</h2>

        <!-- Info do utilizador -->
        <div class="perfil-info">
            <p><strong>Área:</strong> {{ user.area || 'Gestor' }}</p>
            <p><strong>Número:</strong> {{ user.numero || '-' }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Localização:</strong> {{ user.local || '-' }}</p>
            <p><strong>ID:</strong> {{ user.id }}</p>
        </div>

        <!-- Estatísticas -->
        <div class="perfil-stats">
            <div class="stat-card">
                <span class="stat-num">{{ auditoriasAdecorrer }}</span>
                <span class="stat-label">Auditorias a Decorrer</span>
            </div>
            <div class="stat-card">
                <span class="stat-num">{{ auditoriasConcluidas }}</span>
                <span class="stat-label">Auditorias Concluídas</span>
            </div>
        </div>

        <!-- Barra de progresso motivacional -->
        <div class="progresso-container">
            <div class="progresso-label">
                Progresso até ao próximo objetivo ({{ proximoObjetivo }}):
            </div>
            <div class="progresso-bar-bg">
                <div class="progresso-bar-fg" :style="{ width: progresso + '%' }"></div>
            </div>
            <div class="progresso-percent">{{ progresso.toFixed(0) }}%</div>
            <transition name="fade">
                <div class="progresso-mensagem" v-if="mensagemAtual">
                    <i class="fa fa-trophy"></i>
                    {{ mensagemAtual }}
                </div>
            </transition>
        </div>
        <NavBar />
    </div>
</template>


<script>

import NavBar from '../components/NavBar.vue';


export default {
    name: 'Perfil',
    components: { NavBar },
    data() {
        return {
            user: {
                name: '',
                avatar: '',
                area: '',
                numero: '',
                email: '',
                local: '',
                id: ''
            },
            auditoriasAdecorrer: 0,
            auditoriasConcluidas: 0,
            objetivos: [5, 10, 20], // objetivos de progresso
            mensagens: [
                "Primeiro marco atingido! Continua assim!",
                "Excelente! Já 10 auditorias concluídas!",
                "Super Auditor! Estás no topo!",
            ]
        }
    },
    computed: {
        // Encontra o próximo objetivo acima do valor atual
        proximoObjetivo() {
            return this.objetivos.find(o => o > this.auditoriasConcluidas) || this.objetivos[this.objetivos.length - 1];
        },
        // Percentagem de progresso até ao próximo objetivo
        progresso() {
            const idx = this.objetivos.findIndex(o => o > this.auditoriasConcluidas);
            const objetivoAnterior = idx === 0 ? 0 : this.objetivos[idx - 1] || 0;
            const objetivoAtual = this.proximoObjetivo;
            const progresso = ((this.auditoriasConcluidas - objetivoAnterior) / (objetivoAtual - objetivoAnterior)) * 100;
            return Math.min(100, Math.max(0, progresso));
        },
        // Mensagem para o último objetivo atingido
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
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) this.user = user;
        const auditorias = JSON.parse(localStorage.getItem('auditorias')) || [];
        this.auditoriasAdecorrer = auditorias.length;
        const auditoriasConcluidas = JSON.parse(localStorage.getItem('auditoriasConcluidas')) || [];
        this.auditoriasConcluidas = auditoriasConcluidas.length;
    }
}
</script>


<style scoped>
.perfil-page {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 32px 20px 70px 20px;
  background: transparent;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}



.perfil-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.back-btn,
.settings-btn {
    background: none;
    border: none;
    color: #AAD1FF;
    font-size: 22px;
    cursor: pointer;
}

.perfil-title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: #DCE4F7;
}

.perfil-avatar {
    display: flex;
    justify-content: center;
    margin: 16px 0 8px 0;
}

.perfil-avatar img {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 4px solid #277AFF;
    object-fit: cover;
}

.perfil-nome {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #fff;
}

.perfil-info {
    margin: 0 auto 24px auto;
    max-width: 280px;
    font-size: 14px;
    color: #DCE4F7;
    line-height: 1.6;
}

.perfil-info p {
    margin: 2px 0;
}

.perfil-stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 12px;
}

.stat-card {
    background: #132340;
    border-radius: 12px;
    padding: 18px 24px;
    min-width: 120px;
    text-align: center;
}

.stat-num {
    font-size: 24px;
    font-weight: 700;
    color: #277AFF;
    display: block;
}

.stat-label {
    font-size: 13px;
    font-weight: 500;
    color: #DCE4F7;
}

.progresso-container {
    margin: 40px auto 0 auto;
    text-align: center;
    max-width: 340px;
}

.progresso-label {
    font-size: 13px;
    margin-bottom: 6px;
    color: #DCE4F7;
}

.progresso-bar-bg {
    background: #1C2E4A;
    border-radius: 8px;
    height: 20px;
    width: 100%;
    overflow: hidden;
    margin: 0 auto 4px auto;
    box-shadow: 0 1px 4px rgba(39, 122, 255, 0.10);
}

.progresso-bar-fg {
    background: linear-gradient(90deg, #277AFF 80%, #1CA84D 100%);
    height: 100%;
    width: 0;
    border-radius: 8px;
    transition: width 0.8s cubic-bezier(.23, 1.01, .32, 1);
}

.progresso-percent {
    font-size: 13px;
    font-weight: 600;
    color: #277AFF;
    margin-bottom: 4px;
}

.progresso-mensagem {
    margin-top: 10px;
    color: #1CA84D;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.7s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
