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
        <input type="text" v-model="auditoria.tipo" placeholder="Tipo" />

        <label class="campo-label">Hora:</label>
        <input type="time" v-model="horaFormatada" />

        <h4 class="secao">Recursos</h4>
        <label class="campo-label">Documentos:</label>
        <input type="file" @change="handleFileUpload" />

        <!-- Áudio moderno e clean -->
        <label class="campo-label">Áudio:</label>
        <AudioGravador :audio="auditoria.audioBase64"
          @update-audio="novoAudio => { auditoria.audioBase64 = novoAudio; guardarAlteracoes(); }" />

        <label class="campo-label">Prioridade:</label>
        <input type="text" v-model="auditoria.prioridade" placeholder="Prioridade" />

        <label class="campo-label">Especialistas:</label>
        <select v-model="auditoria.especialistas" multiple class="select-especialistas">
          <option v-for="esp in especialistasDisponiveis" :key="esp.id" :value="esp.nome">
            {{ esp.nome }}
          </option>
        </select>

        <label class="campo-label">Materiais:</label>
        <input type="text" v-model="auditoria.materiais" placeholder="Materiais" />

        <h4 class="secao">Localização</h4>
        <label class="campo-label">Origem:</label>
        <input type="text" v-model="auditoria.origem" placeholder="Origem" />

        <label class="campo-label">Local:</label>
        <input type="text" v-model="auditoria.local" placeholder="Localização" />
      </div>

      <label class="secao">Descrição:</label>
      <textarea v-model="auditoria.descricao" rows="4" class="descricao-box" />

      <div class="botoes">
        <button class="guardar" @click="guardarAlteracoes">Guardar</button>
        <button class="concluir" @click="concluirAuditoria">Concluir</button>
      </div>
    </div>
    <NavBar />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import AudioGravador from '../components/AudioGravador.vue'
import { Loader } from "@googlemaps/js-api-loader"
import auditoriasJSON from '../assets/auditorias.json'
import especialistasJSON from '../assets/especialistas.json'

export default {
  name: 'DetalheAuditoria',
  components: { NavBar, AudioGravador },
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
    const armazenadas = localStorage.getItem('auditorias')
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

    guardarAlteracoes() {
      if (!this.auditoria) return

      const dataOriginal = new Date(this.auditoria.data || new Date())
      const [h, m] = this.horaFormatada.split(':')
      dataOriginal.setHours(+h)
      dataOriginal.setMinutes(+m)
      this.auditoria.data = dataOriginal.toISOString()

      const lista = JSON.parse(localStorage.getItem('auditorias') || '[]')
      const atualizada = lista.map(a => a.id === this.auditoria.id ? this.auditoria : a)

      localStorage.setItem('auditorias', JSON.stringify(atualizada))
      alert('Alterações guardadas!')
    },

    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        this.auditoria.documentoBase64 = reader.result
        this.guardarAlteracoes()
      }
      reader.readAsDataURL(file)
    },

    concluirAuditoria() {
      if (!this.auditoria) return

      const aDecorrer = JSON.parse(localStorage.getItem('auditorias') || '[]')
      const concluidas = JSON.parse(localStorage.getItem('auditoriasConcluidas') || '[]')

      const index = aDecorrer.findIndex(a => a.id === this.auditoria.id)
      if (index !== -1) {
        const finalizada = aDecorrer.splice(index, 1)[0]
        concluidas.push(finalizada)

        localStorage.setItem('auditorias', JSON.stringify(aDecorrer))
        localStorage.setItem('auditoriasConcluidas', JSON.stringify(concluidas))

        alert('Auditoria marcada como concluída.')
        this.$router.push('/auditorias/concluidas')
      }
    }
  }
}
</script>

<style scoped>
/* ... o mesmo CSS que já tinhas ... */
</style>


<style scoped>
.page {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 32px 20px 70px 20px;
  background: transparent;
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

.info-box input,
.select-especialistas {
  background-color: #1a2e4a;
  border: none;
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

.descricao-box {
  width: 100%;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  margin-top: 12px;
  border: none;
  resize: none;
  background-color: #dce4f7;
  color: #000;
}

.botoes {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 1.5rem;
}

.botoes button {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.guardar {
  background-color: #277aff;
  color: white;
}

.concluir {
  background-color: #1ca84d;
  color: white;
}

/* === AUDIO CLEAN === */
.audio-clean-box {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-top: 4px !important;
  flex-wrap: nowrap !important;
}

.audio-player-inline {
  max-width: 220px !important;
  width: auto !important;
  flex-grow: 1 !important;
  overflow: hidden !important;
}


.audio-mic-btn {
  background: #277aff;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 19px;
  box-shadow: 0 2px 10px #0c142580;
  position: relative;
  transition: background 0.18s, box-shadow 0.15s;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
}

.audio-mic-btn.gravando {
  background: #c92d2d;
  box-shadow: 0 0 8px #ff3737b5, 0 2px 12px #0c142555;
  animation: pulse-mic 1.2s infinite;
}

.audio-dot {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff3737;
  box-shadow: 0 0 4px #ff3737a0;
  animation: blink-dot 0.7s infinite alternate;
}


.audio-player-inline audio {
  height: 34px;
  border-radius: 32px;
  background: #f5f7fa;
  box-shadow: 0 1px 4px #0c142530;
  width: 100%;
  min-width: 0;
}

.audio-trash-btn {
  background: #222f44;
  color: #ff7777;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
  margin-left: 3px;
  transition: background-color 0.13s;
  flex-shrink: 0;
}

.audio-trash-btn:hover {
  background: #31263f;
  color: #ff3737;
}

</style>
