<template>
  <div class="login-bg" :class="{ 'light-mode': !darkMode }">
    <button class="theme-toggle" @click="toggleTheme">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
    <div class="page-container">
      <div class="page-header">
        <button class="back-btn" @click="$router.back()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2 class="page-title">{{ auditoria?.titulo || auditoria?.nome || 'Auditoria' }}</h2>
        <div style="width: 40px;"></div>
      </div>

      <div v-if="auditoria" class="form-section">
        <div class="form-group">
          <label class="form-label"><i class="fas fa-tag"></i> Tipo</label>
          <input type="text" :value="auditoria.tipo || '—'" class="form-input" readonly />
        </div>
        <div class="form-group">
          <label class="form-label"><i class="fas fa-clock"></i> Hora</label>
          <input type="text" :value="horaFormatada" class="form-input" readonly />
        </div>
        <div class="form-group">
          <label class="form-label"><i class="fas fa-map-marker-alt"></i> Localização</label>
          <input type="text" :value="auditoria.local || auditoria.morada || '—'" class="form-input" readonly />
        </div>
        <div class="form-group">
          <label class="form-label"><i class="fas fa-map"></i> Mapa da Localização</label>
          <div class="map-section">
            <div id="map" class="map-container"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label"><i class="fas fa-align-left"></i> Descrição</label>
          <textarea class="form-textarea" :value="auditoria.descricao || 'Sem descrição.'" rows="4" readonly></textarea>
        </div>
        <div class="form-group">
          <label class="form-label"><i class="fas fa-exclamation-triangle"></i> Prioridade</label>
          <input type="text" :value="auditoria.prioridade || '—'" class="form-input" readonly />
        </div>
        <div class="form-group">
          <label class="form-label"><i class="fas fa-users"></i> Auditores</label>
          <input type="text" :value="nomeAuditores" class="form-input" readonly />
        </div>
        <div class="form-group">
          <label class="form-label"><i class="fas fa-tools"></i> Materiais</label>
          <input type="text" :value="auditoria.materiais || '—'" class="form-input" readonly />
        </div>
        <div class="form-group">
          <label class="form-label"><i class="fas fa-file-alt"></i> Documento</label>
          <div>
            <a v-if="auditoria.documentoBase64 || auditoria.documentos"
              :href="auditoria.documentoBase64 || auditoria.documentos" target="_blank" class="anexar-btn">
              <i class="fas fa-eye"></i>
              <span>Ver ficheiro</span>
            </a>
            <span v-else class="text-muted-foreground">Sem documento</span>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <button class="action-btn complete" @click="aceitarAuditoria">
          <i class="fas fa-check"></i>
          <span>Aceitar</span>
        </button>
        <button class="action-btn danger" @click="rejeitarAuditoria">
          <i class="fas fa-trash"></i>
          <span>Rejeitar</span>
        </button>
      </div>
    </div>
    <BottomNav class=" fixed-nav" />
  </div>
</template>

<script>
import BottomNav from '../components/BottomNav.vue'
import { Loader } from '@googlemaps/js-api-loader'

export default {
  name: 'DetalheNovaAuditoria',
  components: { BottomNav },
  data() {
    return {
      auditoria: null,
      horaFormatada: '',
      mapa: null,
      darkMode: true,
      nomeAuditores: '—'
    }
  },
  mounted() {
    this.loadTheme()
    this.loadAuditoria()
  },
  methods: {
    loadTheme() {
      const saved = localStorage.getItem('theme')
      if (saved) this.darkMode = saved === 'dark'
    },
    toggleTheme() {
      this.darkMode = !this.darkMode
      localStorage.setItem('theme', this.darkMode ? 'dark' : 'light')
    },
    loadAuditoria() {
      const id = this.$route.params.id

      // 1º tenta buscar das auditorias principais
      const lista = JSON.parse(localStorage.getItem('auditorias') || '[]')
      let aud = lista.find(a => String(a.id) === String(id))

      // se não encontrar, tenta nas auditoriasNovas (compatibilidade)
      if (!aud) {
        const novas = JSON.parse(localStorage.getItem('auditoriasNovas') || '[]')
        aud = novas.find(a => String(a.id) === String(id)) || null
      }
      if (!aud) return // não existe auditoria

      this.auditoria = aud

      // Hora formatada
      if (aud.data) {
        const d = new Date(aud.data)
        this.horaFormatada = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      }

      // Auditores (ID → nome)
      if (aud.auditores && Array.isArray(aud.auditores)) {
        // Vai buscar todos os utilizadores/auditores registados para mostrar nomes
        const allAuditores = JSON.parse(localStorage.getItem('auditores') || '[]')
        const nomes = aud.auditores
          .map(audId => {
            const auditor = allAuditores.find(a => String(a.id) === String(audId))
            return auditor?.nomeCompleto || auditor?.nome || audId
          })
          .filter(Boolean)
        this.nomeAuditores = nomes.length ? nomes.join(', ') : '—'
      } else if (aud.especialistas && Array.isArray(aud.especialistas)) {
        this.nomeAuditores = aud.especialistas.join(', ')
      } else {
        this.nomeAuditores = '—'
      }

      this.$nextTick(() => {
        this.carregarMapa()
      })
    },
    async carregarMapa() {
      // Tenta usar coordenadas, se existirem; se não, faz geocode ao local/morada
      const aud = this.auditoria
      if (!aud) return

      let center = null
      if (aud.coordenadas && aud.coordenadas.lat && aud.coordenadas.lng) {
        center = { lat: parseFloat(aud.coordenadas.lat), lng: parseFloat(aud.coordenadas.lng) }
      }

      try {
        const loader = new Loader({ apiKey: 'AIzaSyBdbfZcG0t6f5c3MI3RVA2Aj07IIdmkL9o', version: 'weekly' })
        await loader.load()
        let mapEl = document.getElementById('map')
        if (!mapEl) return

        if (center) {
          this.mapa = new google.maps.Map(mapEl, { center, zoom: 16 })
          new google.maps.Marker({ position: center, map: this.mapa, title: aud.titulo || aud.nome })
        } else if (aud.local || aud.morada) {
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ address: aud.local || aud.morada }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const loc = results[0].geometry.location
              this.mapa = new google.maps.Map(mapEl, { center: loc, zoom: 16 })
              new google.maps.Marker({ position: loc, map: this.mapa, title: aud.titulo || aud.nome })
            }
          })
        }
      } catch (e) { console.error(e) }
    },
    aceitarAuditoria() {
      if (!this.auditoria) return
      // Remove da lista de novas auditorias
      let lista = JSON.parse(localStorage.getItem('auditorias') || '[]')
      lista = lista.filter(a => a.id !== this.auditoria.id)
      localStorage.setItem('auditorias', JSON.stringify(lista))
      // Adiciona à lista de auditorias aceites
      let aceites = JSON.parse(localStorage.getItem('auditoriasADECORRER') || '[]')
      aceites.push(this.auditoria)
      localStorage.setItem('auditoriasADECORRER', JSON.stringify(aceites))
      // Redireciona para a lista de auditorias aceites
      this.$router.push('/auditorias/adecorrer')
    },
    rejeitarAuditoria() {
      // Remove da lista de novas auditorias
      let lista = JSON.parse(localStorage.getItem('auditorias') || '[]')
      lista = lista.filter(a => a.id !== this.auditoria.id)
      localStorage.setItem('auditorias', JSON.stringify(lista))
      // Redireciona para a lista de auditorias novas
      this.$router.push('/auditorias/nova')
    }
  }
}
</script>

<style>
:root {
  --bg-primary: #0a0f1a;
  --bg-secondary: #132340;
  --text-primary: #ffffff;
  --text-secondary: #aad1ff;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
  --success-primary: #10b981;
  --success-secondary: #059669;
  --danger-primary: #ef4444;
  --danger-secondary: #dc2626;
}

.light-mode {
  --bg-primary: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  --bg-secondary: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
}

.login-bg {
  background: var(--bg-primary);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  transition: all 0.5s ease;
  padding: 10px;
}

.login-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 80%, rgba(39, 122, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

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
  backdrop-filter: blur(10px);
  z-index: 10;
  transition: all 0.3s;
}

.page-container {
  background: var(--bg-secondary);
  padding: 24px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.6s ease-out;
}

.fixed-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px)
  }

  to {
    opacity: 1;
    transform: translateY(0)
  }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn,
.save-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}

.page-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.form-label i {
  font-size: 12px;
  color: var(--accent-primary);
  width: 16px;
}

.form-input,
.form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-primary);
  transition: 0.3s;
  resize: none;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(39, 122, 255, 0.1);
}

.map-section {
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, rgba(39, 122, 255, 0.1), rgba(16, 185, 129, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.map-container {
  width: 100%;
  height: 100%;
}

.actions-section {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: 0.3s;
}

.action-btn.complete {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-primary);
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-primary);
}
</style>
