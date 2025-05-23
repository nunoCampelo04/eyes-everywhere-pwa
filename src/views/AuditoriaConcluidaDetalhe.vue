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
        <div class="readonly">Tipo: {{ auditoria.tipo }}</div>
        <div class="readonly">Hora: {{ horaFormatada }}</div>

        <h4 class="secao">Recursos</h4>
        <div v-if="auditoria.documentoBase64" class="readonly">
          Documento: <a :href="auditoria.documentoBase64" target="_blank">Ver ficheiro</a>
        </div>

        <!-- Aqui usas o teu componente de áudio -->
        <div v-if="auditoria.audioBase64" class="readonly">
          <label class="campo-label">Áudio:</label>
          <AudioGravador :audio="auditoria.audioBase64" :readonly="true" />
        </div>

        <div class="readonly">Prioridade: {{ auditoria.prioridade || '---' }}</div>
        <div class="readonly">Especialistas: {{ auditoria.especialistas?.join(', ') || '---' }}</div>
        <div class="readonly">Materiais: {{ auditoria.materiais || '---' }}</div>

        <h4 class="secao">Localização</h4>
        <div class="readonly">Origem: {{ auditoria.origem || '---' }}</div>
        <div class="readonly">Localização: {{ auditoria.local || '---' }}</div>
      </div>

      <label class="secao">Descrição:</label>
      <div class="descricao-readonly">
        {{ auditoria.descricao || 'Sem descrição.' }}
      </div>
    </div>

    <NavBar />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import AudioGravador from '../components/AudioGravador.vue' // Importa componente
import { Loader } from "@googlemaps/js-api-loader"

export default {
  name: 'DetalheAuditoriaConcluida',
  components: { NavBar, AudioGravador },
  data() {
    return {
      auditoria: null,
      horaFormatada: '',
      mapa: null
    }
  },
  mounted() {
    const id = this.$route.params.id
    const armazenadas = JSON.parse(localStorage.getItem('auditoriasConcluidas') || '[]')
    const encontrada = armazenadas.find(a => a.id.toString() === id)
    this.auditoria = encontrada || null

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
            console.error('Geocode falhou:', status)
          }
        })
      } catch (error) {
        console.error('Erro ao carregar o mapa:', error)
      }
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
  font-size: 14px;
}

.readonly {
  background-color: #1c2e4a;
  border-radius: 8px;
  padding: 10px;
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
  background-color: #dce4f7;
  color: #000;
  border-radius: 8px;
  padding: 10px;
  margin-top: 4px;
  font-size: 14px;
  white-space: pre-line;
}


.audio-readonly {
  background-color: #1c2e4a;
  border-radius: 12px;
  padding: 10px 12px;
  margin-top: 4px;
}

.audio-readonly audio {
  width: 100%;
  border-radius: 12px;
  outline: none;
  box-shadow: 0 1px 4px #0c142530;
  background: #dce4f7;
  height: 36px;
}
</style>
