<template>
  <div class="page">
    <div class="content" v-if="auditoria">
      <div class="top-bar">
        <i class="fas fa-arrow-left" @click="$router.back()"></i>
        <h3>{{ auditoria.titulo }}</h3>
      </div>

      <div id="map" class="mapa-interativa"></div>

      <div class="info-box">
        <h4 class="secao">Informações Gerais</h4>
        <label class="campo-label">Tipo:</label>
        <div class="readonly">{{ auditoria.tipo }}</div>

        <label class="campo-label">Hora:</label>
        <div class="readonly">{{ horaFormatada }}</div>

        <h4 class="secao">Recursos</h4>
        <label class="campo-label">Documentos:</label>
        <div class="readonly" v-if="auditoria.documentoBase64">
          <a :href="auditoria.documentoBase64" target="_blank">Ver ficheiro</a>
        </div>
        <div class="readonly" v-else>Sem documento</div>

        <label class="campo-label">Prioridade:</label>
        <div class="readonly">{{ auditoria.prioridade || '---' }}</div>

        <label class="campo-label">Especialistas:</label>
        <div class="readonly">{{ auditoria.especialistas?.join(', ') || '---' }}</div>

        <label class="campo-label">Materiais:</label>
        <div class="readonly">{{ auditoria.materiais || '---' }}</div>

        <h4 class="secao">Localização</h4>
        <label class="campo-label">Origem:</label>
        <div class="readonly">{{ auditoria.origem || '---' }}</div>

        <label class="campo-label">Local:</label>
        <div class="readonly">{{ auditoria.local || '---' }}</div>
      </div>

      <label class="secao">Descrição:</label>
      <div class="descricao-readonly">
        {{ auditoria.descricao || 'Sem descrição.' }}
      </div>

      <div class="botoes">
        <button class="aceitar" @click="aceitarAuditoria">Aceitar</button>
        <button class="rejeitar" @click="rejeitarAuditoria">Rejeitar</button>
      </div>
    </div>

    <NavBar />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import { Loader } from "@googlemaps/js-api-loader"
import auditoriasJSON from '../assets/auditorias.json'
import especialistasJSON from '../assets/especialistas.json'

export default {
    name: 'DetalheAuditoriaNova',
    components: { NavBar },
    data() {
        return {
            auditoria: null,
            horaFormatada: '',
            mapa: null,
            especialistasDisponiveis: []
        }
    },
    mounted() {
        const id = this.$route.params.id
        const armazenadas = localStorage.getItem('auditoriasNovas')
        const lista = armazenadas ? JSON.parse(armazenadas) : auditoriasJSON
        const especialistasData = localStorage.getItem('especialistas')
        this.especialistasDisponiveis = especialistasData ? JSON.parse(especialistasData) : especialistasJSON

        const encontrada = lista.find(a => a.id.toString() === id)
        this.auditoria = encontrada ? { ...encontrada } : null

        if (this.auditoria?.data) {
            const d = new Date(this.auditoria.data)
            this.horaFormatada = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
        }

        if (this.auditoria?.especialistas && typeof this.auditoria.especialistas === 'string') {
            this.auditoria.especialistas = this.auditoria.especialistas.split(',').map(e => e.trim())
        }

        this.carregarMapa()
    },
    methods: {
        async carregarMapa() {
            if (!this.auditoria?.local) return

            const loader = new Loader({
                apiKey: "AIzaSyBdbfZcG0t6f5c3MI3RVA2Aj07IIdmkL9o",
                version: "weekly"
            })

            try {
                await loader.load()

                const geocoder = new google.maps.Geocoder()
                geocoder.geocode({ address: this.auditoria.local }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const location = results[0].geometry.location

                        if (this.mapa) {
                            this.mapa = null
                            document.getElementById('map').innerHTML = ''
                        }

                        this.mapa = new google.maps.Map(document.getElementById('map'), {
                            center: location,
                            zoom: 16,
                        })

                        new google.maps.Marker({
                            position: location,
                            map: this.mapa,
                            title: this.auditoria.titulo
                        })
                    } else {
                        console.error('Geocode falhou: ', status)
                    }
                })
            } catch (error) {
                console.error('Erro ao carregar mapa:', error)
            }
        },

        aceitarAuditoria() {
            if (!this.auditoria) return

            // Remove da lista de auditorias novas
            const novas = JSON.parse(localStorage.getItem('auditoriasNovas') || '[]')
            const index = novas.findIndex(a => a.id === this.auditoria.id)
            if (index === -1) return

            const auditoriaAceite = novas.splice(index, 1)[0]

            // Adiciona à lista de auditorias a decorrer
            const aDecorrer = JSON.parse(localStorage.getItem('auditorias') || '[]')
            aDecorrer.push(auditoriaAceite)

            // Guarda as alterações
            localStorage.setItem('auditoriasNovas', JSON.stringify(novas))
            localStorage.setItem('auditorias', JSON.stringify(aDecorrer))

            alert('Auditoria aceite e movida para "A decorrer".')
            this.$router.push('/auditorias/adecorrer')
        },

        rejeitarAuditoria() {
            if (!this.auditoria) return

            // Remove da lista de auditorias novas
            const novas = JSON.parse(localStorage.getItem('auditoriasNovas') || '[]')
            const index = novas.findIndex(a => a.id === this.auditoria.id)
            if (index === -1) return

            novas.splice(index, 1)

            // Guarda as alterações
            localStorage.setItem('auditoriasNovas', JSON.stringify(novas))

            alert('Auditoria rejeitada e removida.')
            this.$router.push('/auditorias/nova')
        }
    }
}
</script>

<style scoped>
.page {
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

.content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.top-bar i {
  font-size: 20px;
  cursor: pointer;
}

.top-bar h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.mapa-interativa {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.info-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.readonly {
  background-color: #1a2e4a;
  border-radius: 12px;
  padding: 10px;
  font-size: 14px;
  color: white;
  margin-bottom: 8px;
}

.campo-label {
  font-weight: 500;
  font-size: 13px;
  color: #d0d0d0;
  margin-bottom: 4px;
}

.secao {
  margin-top: 1.5rem;
  font-size: 15px;
  font-weight: 600;
  color: #aad1ff;
}

.descricao-label {
  margin-top: 1.5rem;
  font-weight: 500;
  font-size: 14px;
}

.descricao-readonly {
  width: 100%;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  margin-top: 12px;
  background-color: #dce4f7;
  color: #000;
  white-space: pre-line;
}

.botoes {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 1.5rem;
}

.botoes button {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s ease;
}

.aceitar {
  background-color: #28a745;
}

.aceitar:hover {
  background-color: #218838;
}

.rejeitar {
  background-color: #dc3545;
}

.rejeitar:hover {
  background-color: #c82333;
}
</style>
