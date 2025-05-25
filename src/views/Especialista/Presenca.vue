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
        <h2 class="page-title">Confirmar Presença</h2>
        <div class="header-badge location">
          <i class="fas fa-map-marker-alt"></i>
        </div>
      </div>

      <!-- Informações da auditoria -->
      <div class="auditoria-info">
        <h3 class="auditoria-title">{{ auditoria.titulo }}</h3>
        <div class="auditoria-details">
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ auditoria.local }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>{{ formatarDataCompleta(auditoria.data) }}</span>
          </div>
        </div>
      </div>

      <!-- Status da localização -->
      <div class="location-status">
        <div class="status-card" :class="getLocationStatusClass()">
          <div class="status-icon">
            <i :class="getLocationStatusIcon()"></i>
          </div>
          <div class="status-content">
            <h4 class="status-title">{{ getLocationStatusTitle() }}</h4>
            <p class="status-description">{{ getLocationStatusDescription() }}</p>
          </div>
        </div>
      </div>

      <!-- Mapa -->
      <div class="map-section">
        <h4 class="map-title">
          <i class="fas fa-map"></i>
          Localização
        </h4>
        <div id="presenceMap" class="map-container">
          <div v-if="!mapLoaded" class="map-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando mapa...</p>
          </div>
        </div>
        
        <!-- Informações de distância -->
        <div v-if="distanciaCalculada" class="distance-info">
          <div class="distance-item">
            <i class="fas fa-route"></i>
            <span>Distância: {{ distanciaCalculada.toFixed(0) }}m</span>
          </div>
          <div class="distance-item">
            <i class="fas fa-walking"></i>
            <span>~{{ Math.ceil(distanciaCalculada / 80) }} min a pé</span>
          </div>
        </div>
      </div>

      <!-- Localização atual -->
      <div class="current-location">
        <h4 class="section-title">
          <i class="fas fa-crosshairs"></i>
          Sua Localização Atual
        </h4>
        
        <div v-if="localizacaoAtual" class="location-card">
          <div class="location-coords">
            <div class="coord-item">
              <span class="coord-label">Latitude:</span>
              <span class="coord-value">{{ localizacaoAtual.latitude.toFixed(6) }}</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">Longitude:</span>
              <span class="coord-value">{{ localizacaoAtual.longitude.toFixed(6) }}</span>
            </div>
          </div>
          
          <div class="location-accuracy">
            <i class="fas fa-bullseye"></i>
            <span>Precisão: ±{{ localizacaoAtual.accuracy?.toFixed(0) || 'N/A' }}m</span>
          </div>
          
          <div class="location-timestamp">
            <i class="fas fa-clock"></i>
            <span>Atualizado: {{ formatarHora(new Date()) }}</span>
          </div>
        </div>
        
        <div v-else class="location-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ erroLocalizacao || 'Obtendo localização...' }}</p>
        </div>
      </div>

      <!-- Ações -->
      <div class="actions-section">
        <button 
          class="action-btn refresh"
          @click="obterLocalizacao"
          :disabled="obtendoLocalizacao"
        >
          <i :class="obtendoLocalizacao ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
          <span>{{ obtendoLocalizacao ? 'Obtendo...' : 'Atualizar Localização' }}</span>
        </button>
        
        <button 
          class="action-btn confirm"
          @click="confirmarPresenca"
          :disabled="!podeConfirmar"
        >
          <i class="fas fa-check"></i>
          <span>Confirmar Presença</span>
        </button>
        
        <div v-if="!podeConfirmar && localizacaoAtual" class="warning-message">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Você precisa estar a menos de {{ DISTANCIA_MAXIMA }}m do local da auditoria</span>
        </div>
      </div>

      <!-- Histórico de confirmações -->
      <div v-if="historicoConfirmacoes.length > 0" class="history-section">
        <h4 class="section-title">
          <i class="fas fa-history"></i>
          Histórico de Confirmações
        </h4>
        
        <div class="history-list">
          <div 
            v-for="(confirmacao, index) in historicoConfirmacoes" 
            :key="index"
            class="history-item"
          >
            <div class="history-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="history-content">
              <span class="history-time">{{ formatarDataHora(confirmacao.timestamp) }}</span>
              <span class="history-distance">Distância: {{ confirmacao.distancia.toFixed(0) }}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNav />
  </div>
</template>

<script>
import BottomNav from './components/BottomNav.vue'
import { Loader } from "@googlemaps/js-api-loader"

export default {
  name: 'ConfirmacaoPresenca',
  components: { BottomNav },
  data() {
    return {
      auditoria: {},
      localizacaoAtual: null,
      localizacaoAuditoria: null,
      distanciaCalculada: null,
      obtendoLocalizacao: false,
      erroLocalizacao: null,
      darkMode: true,
      mapa: null,
      mapLoaded: false,
      marcadorUsuario: null,
      marcadorAuditoria: null,
      historicoConfirmacoes: [],
      DISTANCIA_MAXIMA: 100 // metros
    }
  },
  computed: {
    podeConfirmar() {
      return this.localizacaoAtual && 
             this.distanciaCalculada !== null && 
             this.distanciaCalculada <= this.DISTANCIA_MAXIMA
    }
  },
  mounted() {
    this.loadTheme()
    this.carregarAuditoria()
    this.carregarHistorico()
    this.obterLocalizacao()
    
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      this.inicializarMapa()
    }, 100)
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

    carregarAuditoria() {
      const id = this.$route.params.id
      const auditorias = JSON.parse(localStorage.getItem('auditoriasEspecialista') || '[]')
      const auditoria = auditorias.find(a => a.id == id)
      
      if (auditoria) {
        this.auditoria = { ...auditoria }
        this.geocodificarLocalAuditoria()
      } else {
        this.$router.back()
      }
    },

    carregarHistorico() {
      const historico = localStorage.getItem(`confirmacoes_${this.auditoria.id}`)
      if (historico) {
        this.historicoConfirmacoes = JSON.parse(historico)
      }
    },

    async geocodificarLocalAuditoria() {
      if (!this.auditoria.local) return

      try {
        const endereco = encodeURIComponent(this.auditoria.local)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${endereco}&format=json`)
        const dados = await response.json()
        
        if (dados.length > 0) {
          this.localizacaoAuditoria = {
            latitude: parseFloat(dados[0].lat),
            longitude: parseFloat(dados[0].lon)
          }
          
          if (this.localizacaoAtual) {
            this.calcularDistancia()
          }
        }
      } catch (error) {
        console.error('Erro ao geocodificar:', error)
      }
    },

    obterLocalizacao() {
      if (!navigator.geolocation) {
        this.erroLocalizacao = 'Geolocalização não suportada pelo navegador'
        return
      }

      this.obtendoLocalizacao = true
      this.erroLocalizacao = null

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.localizacaoAtual = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          }
          
          this.obtendoLocalizacao = false
          this.calcularDistancia()
          this.atualizarMapa()
        },
        (error) => {
          this.obtendoLocalizacao = false
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.erroLocalizacao = 'Permissão de localização negada'
              break
            case error.POSITION_UNAVAILABLE:
              this.erroLocalizacao = 'Localização indisponível'
              break
            case error.TIMEOUT:
              this.erroLocalizacao = 'Timeout ao obter localização'
              break
            default:
              this.erroLocalizacao = 'Erro desconhecido ao obter localização'
              break
          }
        },
        options
      )
    },

    calcularDistancia() {
      if (!this.localizacaoAtual || !this.localizacaoAuditoria) return

      const R = 6371e3 // Raio da Terra em metros
      const φ1 = this.localizacaoAtual.latitude * Math.PI/180
      const φ2 = this.localizacaoAuditoria.latitude * Math.PI/180
      const Δφ = (this.localizacaoAuditoria.latitude - this.localizacaoAtual.latitude) * Math.PI/180
      const Δλ = (this.localizacaoAuditoria.longitude - this.localizacaoAtual.longitude) * Math.PI/180

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

      this.distanciaCalculada = R * c
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
      if (!window.google || !window.google.maps) {
        console.error('Google Maps não foi carregado corretamente')
        this.showMapError()
        return
      }

      // Usar localização da auditoria como centro inicial
      const center = this.localizacaoAuditoria || { lat: 41.5454, lng: -8.4265 }

      const map = new window.google.maps.Map(document.getElementById("presenceMap"), {
        center: { lat: center.latitude || center.lat, lng: center.longitude || center.lng },
        zoom: 16,
        styles: this.darkMode ? this.getDarkMapStyle() : [],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        }
      })
      
      this.mapa = map
      this.mapLoaded = true
      this.atualizarMapa()
    },

    atualizarMapa() {
      if (!this.mapa) return

      // Limpar marcadores existentes
      if (this.marcadorUsuario) {
        this.marcadorUsuario.setMap(null)
      }
      if (this.marcadorAuditoria) {
        this.marcadorAuditoria.setMap(null)
      }

      // Adicionar marcador da auditoria
      if (this.localizacaoAuditoria) {
        this.marcadorAuditoria = new window.google.maps.Marker({
          position: { 
            lat: this.localizacaoAuditoria.latitude, 
            lng: this.localizacaoAuditoria.longitude 
          },
          map: this.mapa,
          title: this.auditoria.titulo,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
          }
        })

        const infoAuditoria = new window.google.maps.InfoWindow({
          content: `
            <div style="color: black; padding: 10px; font-family: 'Poppins', sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px;">${this.auditoria.titulo}</h3>
              <p style="margin: 0; font-size: 14px;"><strong>Local da Auditoria</strong></p>
            </div>
          `
        })

        this.marcadorAuditoria.addListener("click", () => {
          infoAuditoria.open(this.mapa, this.marcadorAuditoria)
        })
      }

      // Adicionar marcador do usuário
      if (this.localizacaoAtual) {
        this.marcadorUsuario = new window.google.maps.Marker({
          position: { 
            lat: this.localizacaoAtual.latitude, 
            lng: this.localizacaoAtual.longitude 
          },
          map: this.mapa,
          title: "Sua localização",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }
        })

        const infoUsuario = new window.google.maps.InfoWindow({
          content: `
            <div style="color: black; padding: 10px; font-family: 'Poppins', sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px;">Sua Localização</h3>
              <p style="margin: 0; font-size: 14px;">Precisão: ±${this.localizacaoAtual.accuracy?.toFixed(0) || 'N/A'}m</p>
            </div>
          `
        })

        this.marcadorUsuario.addListener("click", () => {
          infoUsuario.open(this.mapa, this.marcadorUsuario)
        })

        // Centralizar mapa na localização do usuário
        this.mapa.setCenter({ 
          lat: this.localizacaoAtual.latitude, 
          lng: this.localizacaoAtual.longitude 
        })
      }

      // Ajustar zoom para mostrar ambos os marcadores
      if (this.localizacaoAtual && this.localizacaoAuditoria) {
        const bounds = new window.google.maps.LatLngBounds()
        bounds.extend({ lat: this.localizacaoAtual.latitude, lng: this.localizacaoAtual.longitude })
        bounds.extend({ lat: this.localizacaoAuditoria.latitude, lng: this.localizacaoAuditoria.longitude })
        this.mapa.fitBounds(bounds)
        
        // Garantir zoom mínimo
        const listener = window.google.maps.event.addListener(this.mapa, "idle", () => {
          if (this.mapa.getZoom() > 18) this.mapa.setZoom(18)
          window.google.maps.event.removeListener(listener)
        })
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
      const mapElement = document.getElementById('presenceMap')
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

    getLocationStatusClass() {
      if (!this.localizacaoAtual) return 'loading'
      if (this.distanciaCalculada === null) return 'loading'
      if (this.distanciaCalculada <= this.DISTANCIA_MAXIMA) return 'success'
      return 'warning'
    },

    getLocationStatusIcon() {
      if (!this.localizacaoAtual) return 'fas fa-spinner fa-spin'
      if (this.distanciaCalculada === null) return 'fas fa-spinner fa-spin'
      if (this.distanciaCalculada <= this.DISTANCIA_MAXIMA) return 'fas fa-check-circle'
      return 'fas fa-exclamation-triangle'
    },

    getLocationStatusTitle() {
      if (!this.localizacaoAtual) return 'Obtendo localização...'
      if (this.distanciaCalculada === null) return 'Calculando distância...'
      if (this.distanciaCalculada <= this.DISTANCIA_MAXIMA) return 'Dentro do perímetro'
      return 'Fora do perímetro'
    },

    getLocationStatusDescription() {
      if (!this.localizacaoAtual) return 'Aguarde enquanto obtemos sua localização'
      if (this.distanciaCalculada === null) return 'Calculando distância até o local da auditoria'
      if (this.distanciaCalculada <= this.DISTANCIA_MAXIMA) {
        return `Você está a ${this.distanciaCalculada.toFixed(0)}m do local. Pode confirmar presença.`
      }
      return `Você está a ${this.distanciaCalculada.toFixed(0)}m do local. Aproxime-se mais para confirmar.`
    },

    confirmarPresenca() {
      if (!this.podeConfirmar) {
        alert('Você precisa estar mais próximo do local da auditoria para confirmar presença.')
        return
      }

      const confirmacao = {
        timestamp: new Date().toISOString(),
        latitude: this.localizacaoAtual.latitude,
        longitude: this.localizacaoAtual.longitude,
        distancia: this.distanciaCalculada,
        accuracy: this.localizacaoAtual.accuracy
      }

      // Salvar confirmação no histórico
      this.historicoConfirmacoes.unshift(confirmacao)
      localStorage.setItem(`confirmacoes_${this.auditoria.id}`, JSON.stringify(this.historicoConfirmacoes))

      // Atualizar auditoria
      this.auditoria.presencaConfirmada = true
      this.auditoria.dataPresenca = confirmacao.timestamp
      this.auditoria.localizacaoConfirmacao = {
        latitude: confirmacao.latitude,
        longitude: confirmacao.longitude,
        distancia: confirmacao.distancia
      }

      // Salvar auditoria atualizada
      let auditorias = JSON.parse(localStorage.getItem('auditoriasEspecialista') || '[]')
      const index = auditorias.findIndex(a => a.id === this.auditoria.id)
      if (index !== -1) {
        auditorias[index] = { ...this.auditoria }
        localStorage.setItem('auditoriasEspecialista', JSON.stringify(auditorias))
      }

      alert('Presença confirmada com sucesso!')
      this.$router.back()
    },

    formatarDataCompleta(dataStr) {
      const data = new Date(dataStr)
      return data.toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },

    formatarHora(data) {
      return data.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatarDataHora(dataStr) {
      const data = new Date(dataStr)
      return data.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
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
  --danger-primary: #ef4444;
  --danger-secondary: #dc2626;
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
  --danger-primary: #ef4444;
  --danger-secondary: #dc2626;
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
    radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
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

.back-btn {
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

.back-btn:hover {
  background: var(--warning-primary);
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

.header-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.header-badge.location {
  background: linear-gradient(135deg, var(--warning-primary), var(--warning-secondary));
}

/* Auditoria Info */
.auditoria-info {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
}

.auditoria-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  font-family: 'Poppins', sans-serif;
}

.auditoria-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
}

.detail-item i {
  width: 16px;
  color: var(--warning-primary);
  font-size: 12px;
}

/* Location Status */
.location-status {
  margin-bottom: 8px;
}

.status-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.status-card.loading {
  border-color: rgba(39, 122, 255, 0.3);
  background: rgba(39, 122, 255, 0.05);
}

.status-card.success {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}

.status-card.warning {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.05);
}

.status-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.status-card.loading .status-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.status-card.success .status-icon {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
}

.status-card.warning .status-icon {
  background: linear-gradient(135deg, var(--warning-primary), var(--warning-secondary));
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  font-family: 'Poppins', sans-serif;
}

.status-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Map Section */
.map-section {
  margin-bottom: 8px;
}

.map-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.map-title i {
  color: var(--warning-primary);
  font-size: 12px;
}

.map-container {
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 185, 129, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  color: var(--warning-primary);
}

.map-loading p {
  font-size: 14px;
  margin: 0;
}

.distance-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.distance-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.distance-item i {
  color: var(--warning-primary);
  font-size: 10px;
}

/* Current Location */
.current-location,
.history-section {
  margin-bottom: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.section-title i {
  color: var(--accent-primary);
  font-size: 12px;
}

.location-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.location-coords {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.coord-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coord-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.coord-value {
  font-size: 12px;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.location-accuracy,
.location-timestamp {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.location-accuracy:last-child,
.location-timestamp:last-child {
  margin-bottom: 0;
}

.location-accuracy i,
.location-timestamp i {
  color: var(--accent-primary);
  font-size: 10px;
}

.location-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  color: var(--danger-primary);
}

.location-error i {
  font-size: 24px;
  margin-bottom: 8px;
}

.location-error p {
  margin: 0;
  font-size: 14px;
}

/* Actions Section */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: 'Poppins', sans-serif;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.refresh {
  background: rgba(39, 122, 255, 0.1);
  border-color: rgba(39, 122, 255, 0.3);
  color: var(--accent-primary);
}

.action-btn.refresh:hover:not(:disabled) {
  background: rgba(39, 122, 255, 0.2);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.3);
}

.action-btn.confirm {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-primary);
}

.action-btn.confirm:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--success-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.warning-message {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--warning-primary);
  font-size: 13px;
  text-align: center;
}

.warning-message i {
  font-size: 16px;
  flex-shrink: 0;
}

/* History Section */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-time {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.history-distance {
  font-size: 12px;
  color: var(--text-secondary);
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

  .auditoria-title {
    font-size: 16px;
  }

  .auditoria-info,
  .status-card,
  .location-card {
    padding: 16px;
  }

  .map-container {
    height: 200px;
  }

  .status-icon {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }

  .action-btn {
    padding: 14px;
    font-size: 15px;
  }

  .distance-info {
    flex-direction: column;
    gap: 8px;
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
