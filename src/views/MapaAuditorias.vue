<template>
  <div class="login-bg" :class="{ 'light-mode': !darkMode }">
    <!-- Toggle de tema no canto superior direito -->
    <button class="theme-toggle" @click="toggleTheme">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>

    <div class="page-container">
      <!-- Header elegante -->
      <div class="page-header">
        <button class="back-btn" @click="$router.back()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2 class="page-title">Mapa de Auditorias</h2>
        <button class="filter-btn" @click="toggleFilters">
          <i class="fas fa-filter"></i>
        </button>
      </div>

      <!-- Filtros -->
      <div v-if="showFilters" class="filters-section">
        <div class="filter-group">
          <label class="filter-label">Tipo de Auditoria</label>
          <select v-model="filtroTipo" class="filter-select" @change="atualizarMarcadores">
            <option value="">Todos os tipos</option>
            <option value="Segurança Rodoviária">Segurança Rodoviária</option>
            <option value="Infraestruturas">Infraestruturas</option>
            <option value="Ambiente">Ambiente</option>
            <option value="Urbanismo">Urbanismo</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select v-model="filtroStatus" class="filter-select" @change="atualizarMarcadores">
            <option value="">Todos os status</option>
            <option value="nova">Novas</option>
            <option value="ativa">Ativas</option>
            <option value="concluida">Concluídas</option>
          </select>
        </div>
      </div>

      <!-- Mapa -->
      <div class="map-section">
        <div id="map" class="map-container"></div>
        <div v-if="!mapLoaded" class="map-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando mapa...</p>
        </div>
      </div>

      <!-- Detalhes da auditoria selecionada -->
      <div v-if="auditoriaSelecionada" class="details-section">
        <div class="details-card">
          <div class="details-header">
            <h3 class="details-title">{{ auditoriaSelecionada.titulo }}</h3>
            <button class="close-details" @click="auditoriaSelecionada = null">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="details-content">
            <div class="detail-item">
              <i class="fas fa-tag"></i>
              <span>{{ auditoriaSelecionada.tipo }}</span>
            </div>
            
            <div class="detail-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ auditoriaSelecionada.local || 'Localização não definida' }}</span>
            </div>
            
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatarData(auditoriaSelecionada.data) }}</span>
            </div>
            
            <div class="detail-item">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ auditoriaSelecionada.prioridade }}</span>
            </div>
          </div>
          
          <div class="details-actions">
            <button class="details-btn" @click="verDetalhes(auditoriaSelecionada)">
              <i class="fas fa-eye"></i>
              <span>Ver Detalhes</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de auditorias -->
      <div class="list-section">
        <div class="list-header">
          <h3 class="list-title">
            <i class="fas fa-list"></i>
            Auditorias ({{ auditoriasFiltradas.length }})
          </h3>
        </div>
        
        <div class="auditorias-list">
          <div 
            v-for="auditoria in auditoriasFiltradas.slice(0, 5)" 
            :key="auditoria.id"
            class="auditoria-item"
            :class="getStatusClass(auditoria)"
            @click="focusAuditoria(auditoria)"
          >
            <div class="auditoria-marker">
              <i :class="getMarkerIcon(auditoria)"></i>
            </div>
            <div class="auditoria-info">
              <h4 class="auditoria-title">{{ auditoria.titulo }}</h4>
              <p class="auditoria-location">{{ auditoria.local || 'Localização não definida' }}</p>
            </div>
            <div class="auditoria-status">
              <span class="status-badge" :class="getStatusClass(auditoria)">
                {{ getStatusText(auditoria) }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="auditoriasFiltradas.length > 5" class="show-more">
          <button class="show-more-btn" @click="$router.push('/auditorias/adecorrer')">
            <span>Ver todas ({{ auditoriasFiltradas.length - 5 }} restantes)</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNav />
  </div>
</template>

<script>
import BottomNav from '../components/BottomNav.vue'
import { Loader } from "@googlemaps/js-api-loader"

export default {
  name: 'MapaAuditorias',
  components: { BottomNav },
  data() {
    return {
      auditorias: [],
      auditoriasNovas: [],
      auditoriasConcluidas: [],
      auditoriaSelecionada: null,
      showFilters: false,
      filtroTipo: '',
      filtroStatus: '',
      darkMode: true,
      mapa: null,
      mapLoaded: false,
      marcadores: []
    }
  },
  computed: {
    todasAuditorias() {
      return [
        ...this.auditoriasNovas.map(a => ({ ...a, status: 'nova' })),
        ...this.auditorias.map(a => ({ ...a, status: 'ativa' })),
        ...this.auditoriasConcluidas.map(a => ({ ...a, status: 'concluida' }))
      ]
    },
    
    auditoriasFiltradas() {
      return this.todasAuditorias.filter(auditoria => {
        const tipoMatch = !this.filtroTipo || auditoria.tipo === this.filtroTipo
        const statusMatch = !this.filtroStatus || auditoria.status === this.filtroStatus
        return tipoMatch && statusMatch
      })
    }
  },
  mounted() {
    this.loadTheme()
    this.loadData()
    this.inicializarMapa()
  },
  methods: {
    loadTheme() {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.darkMode = savedTheme === 'dark'
      }
    },
    
    toggleTheme() {
      this.darkMode = !this.darkMode
      localStorage.setItem('theme', this.darkMode ? 'dark' : 'light')
    },

    loadData() {
      this.auditoriasNovas = JSON.parse(localStorage.getItem('auditoriasNovas') || '[]')
      this.auditorias = JSON.parse(localStorage.getItem('auditorias') || '[]')
      this.auditoriasConcluidas = JSON.parse(localStorage.getItem('auditoriasConcluidas') || '[]')
    },

    toggleFilters() {
      this.showFilters = !this.showFilters
    },

    async inicializarMapa() {
      try {
        const loader = new Loader({
          apiKey: "AIzaSyBdbfZcG0t6f5c3MI3RVA2Aj07IIdmkL9o",
          version: "weekly"
        })

        await loader.load()
        await this.iniciarMapa()
      } catch (error) {
        console.error('Erro ao carregar Google Maps:', error)
        this.showMapError()
      }
    },

    async iniciarMapa() {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 41.5454, lng: -8.4265 },
        zoom: 12,
        styles: this.darkMode ? this.getDarkMapStyle() : [],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
      })
      
      this.mapa = map
      this.mapLoaded = true
      await this.adicionarMarcadores()
    },

    async adicionarMarcadores() {
      // Limpar marcadores existentes
      this.marcadores.forEach(marcador => {
        marcador.setMap(null)
      })
      this.marcadores = []

      // Ícones para os marcadores
      const iconeVerde = {
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
      }

      const iconeAmarelo = {
        url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
      }

      const iconeAzul = {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }

      for (const auditoria of this.auditoriasFiltradas) {
        if (!auditoria.local) continue

        try {
          const endereco = encodeURIComponent(auditoria.local)
          const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${endereco}&format=json`)
          const dados = await response.json()
          if (dados.length === 0) continue

          const { lat, lon } = dados[0]

          // Escolher ícone baseado no status
          let icone
          switch (auditoria.status) {
            case 'nova':
              icone = iconeAmarelo
              break
            case 'ativa':
              icone = iconeAzul
              break
            case 'concluida':
              icone = iconeVerde
              break
            default:
              icone = iconeAzul
          }

          const marcador = new google.maps.Marker({
            position: { lat: parseFloat(lat), lng: parseFloat(lon) },
            map: this.mapa,
            title: auditoria.titulo,
            icon: icone
          })

          const contentString = `
            <div style="color: black; padding: 10px; font-family: 'Poppins', sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px;">${auditoria.titulo}</h3>
              <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Tipo:</strong> ${auditoria.tipo}</p>
              <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Localização:</strong> ${auditoria.local}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Status:</strong> ${this.getStatusText(auditoria)}</p>
            </div>
          `
          
          const info = new google.maps.InfoWindow({
            content: contentString
          })

          marcador.addListener("click", () => {
            info.open(this.mapa, marcador)
            this.auditoriaSelecionada = auditoria
          })

          this.marcadores.push(marcador)
        } catch (error) {
          console.error('Erro ao geocodificar endereço:', auditoria.local, error)
        }
      }
    },

    atualizarMarcadores() {
      if (this.mapa) {
        this.adicionarMarcadores()
      }
    },

    focusAuditoria(auditoria) {
      this.auditoriaSelecionada = auditoria
      
      // Encontrar o marcador correspondente e centralizar no mapa
      const marcador = this.marcadores.find(m => m.getTitle() === auditoria.titulo)
      if (marcador) {
        this.mapa.setCenter(marcador.getPosition())
        this.mapa.setZoom(16)
        
        // Simular clique no marcador
        google.maps.event.trigger(marcador, 'click')
      }
    },

    getDarkMapStyle() {
      return [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ]
    },

    showMapError() {
      const mapElement = document.getElementById('map')
      if (mapElement) {
        mapElement.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
            <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 16px;"></i>
            <p>Erro ao carregar o mapa</p>
            <small>Verifique a conexão com a internet</small>
          </div>
        `
      }
    },

    getStatusClass(auditoria) {
      return auditoria.status
    },

    getMarkerIcon(auditoria) {
      switch (auditoria.status) {
        case 'nova': return 'fas fa-star'
        case 'ativa': return 'fas fa-play'
        case 'concluida': return 'fas fa-check'
        default: return 'fas fa-map-marker-alt'
      }
    },

    getStatusText(auditoria) {
      switch (auditoria.status) {
        case 'nova': return 'Nova'
        case 'ativa': return 'Ativa'
        case 'concluida': return 'Concluída'
        default: return 'Desconhecido'
      }
    },

    formatarData(dataStr) {
      const data = new Date(dataStr)
      return data.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },

    verDetalhes(auditoria) {
      let rota = ''
      switch (auditoria.status) {
        case 'nova':
          rota = `/auditoriasnovas/${auditoria.id}`
          break
        case 'ativa':
          rota = `/auditoria/${auditoria.id}`
          break
        case 'concluida':
          rota = `/auditoriasconcluidas/${auditoria.id}`
          break
      }
      if (rota) {
        this.$router.push(rota)
      }
    }
  }
}
</script>

<style scoped>
/* Variáveis CSS para temas - IGUAIS AO LOGIN */
:root {
  --bg-primary: #0a0f1a;
  --bg-secondary: #132340;
  --text-primary: #ffffff;
  --text-secondary: #aad1ff;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
  --success-primary: #10b981;
  --success-secondary: #059669;
  --warning-primary: #f59e0b;
  --warning-secondary: #ea580c;
}

.light-mode {
  --bg-primary: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  --bg-secondary: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
  --success-primary: #10b981;
  --success-secondary: #059669;
  --warning-primary: #f59e0b;
  --warning-secondary: #ea580c;
}

/* Background principal - IGUAL AO LOGIN */
.login-bg {
  background: var(--bg-primary);
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  transition: all 0.5s ease;
  padding: 10px 10px 80px 10px;
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
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Toggle de tema - IGUAL AO LOGIN */
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

/* Container principal - IGUAL AO LOGIN */
.page-container {
  background: var(--bg-secondary);
  padding: 24px 20px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.5s ease;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.back-btn,
.filter-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.back-btn:hover,
.filter-btn:hover {
  background: var(--accent-primary);
  color: white;
  transform: scale(1.05);
}

.page-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

/* Filters Section */
.filters-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
}

.filter-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
}

/* Map Section */
.map-section {
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, rgba(39, 122, 255, 0.1), rgba(16, 185, 129, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(19, 35, 64, 0.9);
  color: var(--text-secondary);
  z-index: 1;
}

.map-loading i {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--accent-primary);
}

.map-loading p {
  font-size: 14px;
  margin: 0;
}

/* Details Section */
.details-section {
  animation: slideUp 0.3s ease-out;
}

.details-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s ease;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.details-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.close-details {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.close-details:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.detail-item i {
  width: 14px;
  color: var(--accent-primary);
  font-size: 11px;
}

.details-actions {
  display: flex;
  justify-content: center;
}

.details-btn {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Poppins', sans-serif;
}

.details-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.4);
}

/* List Section */
.list-section {
  margin-bottom: 8px;
}

.list-header {
  margin-bottom: 12px;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.list-title i {
  color: var(--accent-primary);
  font-size: 14px;
}

.auditorias-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auditoria-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.auditoria-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.auditoria-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.auditoria-item.nova .auditoria-marker {
  background: linear-gradient(135deg, var(--warning-primary), var(--warning-secondary));
}

.auditoria-item.ativa .auditoria-marker {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.auditoria-item.concluida .auditoria-marker {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
}

.auditoria-info {
  flex: 1;
}

.auditoria-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  font-family: 'Poppins', sans-serif;
}

.auditoria-location {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.8;
}

.auditoria-status {
  flex-shrink: 0;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  text-transform: uppercase;
}

.status-badge.nova {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning-primary);
}

.status-badge.ativa {
  background: rgba(39, 122, 255, 0.2);
  color: var(--accent-primary);
}

.status-badge.concluida {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-primary);
}

/* Show More */
.show-more {
  margin-top: 12px;
  text-align: center;
}

.show-more-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
  margin: 0 auto;
}

.show-more-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

/* Responsividade */
@media (max-width: 480px) {
  .login-bg {
    padding: 5px 5px 80px 5px;
  }

  .page-container {
    margin: 0;
    padding: 20px 16px;
    border-radius: 16px;
    max-width: 100%;
  }

  .theme-toggle {
    width: 35px;
    height: 35px;
    top: 10px;
    right: 10px;
    font-size: 14px;
  }

  .page-title {
    font-size: 16px;
  }

  .map-section {
    height: 200px;
  }

  .auditoria-item {
    padding: 10px;
  }

  .auditoria-marker {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

/* Animação de entrada */
.page-container {
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
