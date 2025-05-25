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
        <h2 class="page-title">Confirmação de Presença</h2>
        <div class="location-status" :class="{ 'active': localizacaoAtiva }">
          <i class="fas fa-map-marker-alt"></i>
        </div>
      </div>

      <!-- Status atual -->
      <div class="status-section">
        <div class="status-card" :class="statusPresenca">
          <div class="status-icon">
            <i :class="getStatusIcon()"></i>
          </div>
          <div class="status-content">
            <h3 class="status-title">{{ getStatusTitle() }}</h3>
            <p class="status-description">{{ getStatusDescription() }}</p>
          </div>
        </div>
      </div>

      <!-- Seleção de auditoria -->
      <div class="auditoria-section">
        <h3 class="section-title">
          <i class="fas fa-clipboard-list"></i>
          Selecionar Auditoria
        </h3>
        <div v-if="auditoriasDisponiveis.length === 0" class="empty-auditorias">
          <i class="fas fa-calendar-times"></i>
          <p>Nenhuma auditoria disponível</p>
        </div>
        <div v-else class="auditorias-list">
          <div 
            v-for="auditoria in auditoriasDisponiveis" 
            :key="auditoria.id"
            class="auditoria-item"
            :class="{ 'selected': auditoriaSelected?.id === auditoria.id }"
            @click="selecionarAuditoria(auditoria)"
          >
            <div class="auditoria-date">
              <span class="date-day">{{ formatarData(auditoria.data).dia }}</span>
              <span class="date-month">{{ formatarData(auditoria.data).mes }}</span>
            </div>
            <div class="auditoria-content">
              <h4 class="auditoria-title">{{ auditoria.titulo }}</h4>
              <p class="auditoria-location">{{ auditoria.local }}</p>
              <p class="auditoria-time">{{ formatarHora(auditoria.data) }}</p>
            </div>
            <div class="auditoria-distance" v-if="auditoria.distancia">
              <span class="distance-value">{{ auditoria.distancia }}m</span>
              <span class="distance-label">distância</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mapa de localização -->
      <div v-if="auditoriaSelected" class="map-section">
        <h3 class="section-title">
          <i class="fas fa-map"></i>
          Localização
        </h3>
        <div class="map-container">
          <div id="presenceMap" class="map"></div>
          <div v-if="!mapLoaded" class="map-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando mapa...</p>
          </div>
        </div>
        
        <!-- Informações de distância -->
        <div v-if="distanciaCalculada" class="distance-info">
          <div class="distance-item">
            <i class="fas fa-route"></i>
            <span>{{ distanciaCalculada }}m de distância</span>
          </div>
          <div class="distance-item">
            <i class="fas fa-clock"></i>
            <span>{{ tempoEstimado }} min a pé</span>
          </div>
          <div class="distance-item" :class="{ 'valid': dentroDoRaio }">
            <i :class="dentroDoRaio ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
            <span>{{ dentroDoRaio ? 'Dentro do raio permitido' : 'Fora do raio permitido' }}</span>
          </div>
        </div>
      </div>

      <!-- Ações de presença -->
      <div v-if="auditoriaSelected" class="presence-actions">
        <button 
          v-if="statusPresenca === 'ausente'"
          class="presence-btn checkin"
          @click="confirmarPresenca"
          :disabled="!dentroDoRaio || !localizacaoAtiva"
        >
          <i class="fas fa-map-marker-alt"></i>
          <span>Check-in</span>
        </button>
        
        <button 
          v-if="statusPresenca === 'presente'"
          class="presence-btn checkout"
          @click="finalizarPresenca"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span>Check-out</span>
        </button>
        
        <button 
          class="presence-btn location"
          @click="atualizarLocalizacao"
          :disabled="!localizacaoAtiva"
        >
          <i class="fas fa-crosshairs"></i>
          <span>Atualizar Localização</span>
        </button>
      </div>

      <!-- Histórico de presenças -->
      <div class="historico-section">
        <h3 class="section-title">
          <i class="fas fa-history"></i>
          Histórico de Presenças
        </h3>
        <div v-if="historicoPresencas.length === 0" class="empty-historico">
          <i class="fas fa-calendar-check"></i>
          <p>Nenhum registo de presença</p>
        </div>
        <div v-else class="historico-list">
          <div 
            v-for="registro in historicoPresencas.slice(0, 3)" 
            :key="registro.id"
            class="historico-item"
          >
            <div class="historico-icon" :class="registro.tipo">
              <i :class="registro.tipo === 'checkin' ? 'fas fa-sign-in-alt' : 'fas fa-sign-out-alt'"></i>
            </div>
            <div class="historico-content">
              <h4 class="historico-title">{{ registro.auditoria }}</h4>
              <p class="historico-details">
                {{ registro.tipo === 'checkin' ? 'Check-in' : 'Check-out' }} • 
                {{ formatarDataHora(registro.timestamp) }}
              </p>
            </div>
            <div class="historico-status">
              <span class="status-badge success">Confirmado</span>
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
      darkMode: true,
      statusPresenca: 'ausente', // ausente, presente
      localizacaoAtiva: false,
      auditoriaSelected: null,
      auditoriasDisponiveis: [],
      historicoPresencas: [],
      localizacaoAtual: null,
      mapa: null,
      mapLoaded: false,
      marcadorUsuario: null,
      marcadorAuditoria: null,
      distanciaCalculada: null,
      tempoEstimado: null,
      raioPermitido: 100 // metros
    }
  },
  computed: {
    dentroDoRaio() {
      return this.distanciaCalculada && this.distanciaCalculada <= this.raioPermitido
    }
  },
  mounted() {
    this.loadTheme()
    this.loadData()
    this.iniciarGeolocation()
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
      // Carregar auditorias disponíveis
      const auditorias = JSON.parse(localStorage.getItem('auditorias') || '[]')
      this.auditoriasDisponiveis = auditorias.filter(a => {
        const dataAuditoria = new Date(a.data)
        const hoje = new Date()
        const diffDias = Math.ceil((dataAuditoria - hoje) / (1000 * 60 * 60 * 24))
        return diffDias >= 0 && diffDias <= 1 // Auditorias de hoje ou amanhã
      })

      // Carregar histórico de presenças
      const historico = localStorage.getItem('historicoPresencas')
      if (historico) {
        this.historicoPresencas = JSON.parse(historico)
      } else {
        // Dados de exemplo
        this.historicoPresencas = [
          {
            id: 1,
            auditoria: 'Inspeção de Ponte',
            tipo: 'checkin',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            localizacao: { lat: 41.5454, lng: -8.4265 }
          },
          {
            id: 2,
            auditoria: 'Inspeção de Ponte',
            tipo: 'checkout',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
            localizacao: { lat: 41.5454, lng: -8.4265 }
          }
        ]
        localStorage.setItem('historicoPresencas', JSON.stringify(this.historicoPresencas))
      }
    },

    iniciarGeolocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.localizacaoAtual = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            this.localizacaoAtiva = true
            this.calcularDistancias()
            this.atualizarMapa()
          },
          (error) => {
            console.error('Erro ao obter localização:', error)
            this.localizacaoAtiva = false
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )

        // Monitorar mudanças de localização
        navigator.geolocation.watchPosition(
          (position) => {
            this.localizacaoAtual = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            this.calcularDistancias()
            this.atualizarMapa()
          },
          null,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 30000
          }
        )
      }
    },

    async inicializarMapa() {
      try {
        const loader = new Loader({
          apiKey: "AIzaSyBdbfZcG0t6f5c3MI3RVA2Aj07IIdmkL9o",
          version: "weekly"
        })

        await loader.load()
        await this.criarMapa()
      } catch (error) {
        console.error('Erro ao carregar Google Maps:', error)
        this.showMapError()
      }
    },

    async criarMapa() {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps não foi carregado corretamente')
        this.showMapError()
        return
      }

      const center = this.localizacaoAtual || { lat: 41.5454, lng: -8.4265 }

      this.mapa = new window.google.maps.Map(document.getElementById("presenceMap"), {
        center: center,
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
      
      this.mapLoaded = true
      this.atualizarMapa()
    },

    atualizarMapa() {
      if (!this.mapa || !this.auditoriaSelected) return

      // Remover marcadores existentes
      if (this.marcadorUsuario) {
        this.marcadorUsuario.setMap(null)
      }
      if (this.marcadorAuditoria) {
        this.marcadorAuditoria.setMap(null)
      }

      // Adicionar marcador do usuário
      if (this.localizacaoAtual) {
        this.marcadorUsuario = new window.google.maps.Marker({
          position: this.localizacaoAtual,
          map: this.mapa,
          title: 'Sua localização',
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }
        })
      }

      // Adicionar marcador da auditoria
      this.geocodificarAuditoria()
    },

    async geocodificarAuditoria() {
      if (!this.auditoriaSelected?.local) return

      try {
        const endereco = encodeURIComponent(this.auditoriaSelected.local)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${endereco}&format=json`)
        const dados = await response.json()
        
        if (dados.length === 0) return

        const { lat, lon } = dados[0]
        const posicaoAuditoria = { lat: parseFloat(lat), lng: parseFloat(lon) }

        this.marcadorAuditoria = new window.google.maps.Marker({
          position: posicaoAuditoria,
          map: this.mapa,
          title: this.auditoriaSelected.titulo,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
          }
        })

        // Calcular distância
        if (this.localizacaoAtual) {
          const distancia = this.calcularDistanciaEntrePontos(
            this.localizacaoAtual,
            posicaoAuditoria
          )
          this.distanciaCalculada = Math.round(distancia)
          this.tempoEstimado = Math.ceil(distancia / 80) // ~80m/min caminhando
        }

        // Ajustar zoom para mostrar ambos os marcadores
        const bounds = new window.google.maps.LatLngBounds()
        if (this.localizacaoAtual) {
          bounds.extend(this.localizacaoAtual)
        }
        bounds.extend(posicaoAuditoria)
        this.mapa.fitBounds(bounds)
      } catch (error) {
        console.error('Erro ao geocodificar:', error)
      }
    },

    calcularDistanciaEntrePontos(ponto1, ponto2) {
      const R = 6371e3 // Raio da Terra em metros
      const φ1 = ponto1.lat * Math.PI/180
      const φ2 = ponto2.lat * Math.PI/180
      const Δφ = (ponto2.lat-ponto1.lat) * Math.PI/180
      const Δλ = (ponto2.lng-ponto1.lng) * Math.PI/180

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

      return R * c
    },

    calcularDistancias() {
      if (!this.localizacaoAtual) return

      this.auditoriasDisponiveis.forEach(async (auditoria) => {
        if (auditoria.local) {
          try {
            const endereco = encodeURIComponent(auditoria.local)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${endereco}&format=json`)
            const dados = await response.json()
            
            if (dados.length > 0) {
              const { lat, lon } = dados[0]
              const distancia = this.calcularDistanciaEntrePontos(
                this.localizacaoAtual,
                { lat: parseFloat(lat), lng: parseFloat(lon) }
              )
              auditoria.distancia = Math.round(distancia)
            }
          } catch (error) {
            console.error('Erro ao calcular distância:', error)
          }
        }
      })
    },

    selecionarAuditoria(auditoria) {
      this.auditoriaSelected = auditoria
      this.atualizarMapa()
    },

    confirmarPresenca() {
      if (!this.dentroDoRaio || !this.localizacaoAtiva) {
        alert('Você precisa estar próximo ao local da auditoria para fazer check-in')
        return
      }

      this.statusPresenca = 'presente'
      
      // Registrar no histórico
      const registro = {
        id: Date.now(),
        auditoria: this.auditoriaSelected.titulo,
        tipo: 'checkin',
        timestamp: new Date().toISOString(),
        localizacao: { ...this.localizacaoAtual }
      }
      
      this.historicoPresencas.unshift(registro)
      localStorage.setItem('historicoPresencas', JSON.stringify(this.historicoPresencas))
      
      alert('Check-in realizado com sucesso!')
    },

    finalizarPresenca() {
      this.statusPresenca = 'ausente'
      
      // Registrar no histórico
      const registro = {
        id: Date.now(),
        auditoria: this.auditoriaSelected.titulo,
        tipo: 'checkout',
        timestamp: new Date().toISOString(),
        localizacao: { ...this.localizacaoAtual }
      }
      
      this.historicoPresencas.unshift(registro)
      localStorage.setItem('historicoPresencas', JSON.stringify(this.historicoPresencas))
      
      alert('Check-out realizado com sucesso!')
    },

    atualizarLocalizacao() {
      this.iniciarGeolocation()
    },

    getStatusIcon() {
      return this.statusPresenca === 'presente' ? 'fas fa-user-check' : 'fas fa-user-clock'
    },

    getStatusTitle() {
      return this.statusPresenca === 'presente' ? 'Presente na Auditoria' : 'Aguardando Check-in'
    },

    getStatusDescription() {
      return this.statusPresenca === 'presente' 
        ? 'Você está registado como presente na auditoria'
        : 'Selecione uma auditoria e confirme sua presença'
    },

    formatarData(dataStr) {
      const data = new Date(dataStr)
      const dia = data.getDate().toString().padStart(2, '0')
      const mes = data.toLocaleString('pt-PT', { month: 'short' }).toUpperCase()
      return { dia, mes }
    },

    formatarHora(dataStr) {
      const data = new Date(dataStr)
      return `${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`
    },

    formatarDataHora(dataStr) {
      const data = new Date(dataStr)
      return data.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
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
    }
  }
}
</script>

<style scoped>
/* Usar as mesmas variáveis CSS dos arquivos anteriores */
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

/* Background e container - iguais aos anteriores */
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
    radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(39, 122, 255, 0.1) 0%, transparent 50%);
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
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

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
  background: var(--success-primary);
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

.location-status {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 16px;
  transition: all 0.3s ease;
}

.location-status.active {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Status Section */
.status-section {
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

.status-card.presente {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}

.status-card.ausente {
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
  flex-shrink: 0;
}

.status-card.presente .status-icon {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
  color: white;
}

.status-card.ausente .status-icon {
  background: linear-gradient(135deg, var(--warning-primary), var(--warning-secondary));
  color: white;
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
  opacity: 0.8;
}

/* Section Titles */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.section-title i {
  color: var(--success-primary);
  font-size: 14px;
}

/* Auditorias Section */
.auditoria-section {
  margin-bottom: 8px;
}

.empty-auditorias {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
}

.empty-auditorias i {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
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
  border-color: var(--success-primary);
}

.auditoria-item.selected {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success-primary);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.auditoria-date {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
  color: white;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  font-weight: 600;
}

.date-day {
  font-size: 14px;
  line-height: 1;
}

.date-month {
  font-size: 8px;
  text-transform: uppercase;
  margin-top: 1px;
  opacity: 0.9;
}

.auditoria-content {
  flex: 1;
}

.auditoria-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  font-family: 'Poppins', sans-serif;
}

.auditoria-location,
.auditoria-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.8;
}

.auditoria-distance {
  text-align: center;
  flex-shrink: 0;
}

.distance-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--success-primary);
  display: block;
}

.distance-label {
  font-size: 10px;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* Map Section */
.map-section {
  margin-bottom: 8px;
}

.map-container {
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(39, 122, 255, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
}

.map {
  width: 100%;
  height: 100%;
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
  font-size: 20px;
  margin-bottom: 8px;
  color: var(--success-primary);
}

.map-loading p {
  font-size: 12px;
  margin: 0;
}

/* Distance Info */
.distance-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distance-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.distance-item.valid {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-primary);
}

.distance-item i {
  font-size: 12px;
  width: 16px;
}

/* Presence Actions */
.presence-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.presence-btn {
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

.presence-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.presence-btn.checkin {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-primary);
}

.presence-btn.checkin:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--success-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.presence-btn.checkout {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--danger-primary);
}

.presence-btn.checkout:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--danger-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.presence-btn.location {
  background: rgba(39, 122, 255, 0.1);
  border-color: rgba(39, 122, 255, 0.3);
  color: var(--accent-primary);
}

.presence-btn.location:hover:not(:disabled) {
  background: rgba(39, 122, 255, 0.2);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.3);
}

/* Histórico Section */
.historico-section {
  margin-bottom: 8px;
}

.empty-historico {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
}

.empty-historico i {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.historico-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.historico-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.historico-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--success-primary);
}

.historico-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.historico-icon.checkin {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
  color: white;
}

.historico-icon.checkout {
  background: linear-gradient(135deg, var(--danger-primary), var(--danger-secondary));
  color: white;
}

.historico-content {
  flex: 1;
}

.historico-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  font-family: 'Poppins', sans-serif;
}

.historico-details {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.8;
}

.historico-status {
  flex-shrink: 0;
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  text-transform: uppercase;
}

.status-badge.success {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-primary);
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

  .status-card {
    padding: 16px;
  }

  .status-icon {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }

  .map-container {
    height: 180px;
  }

  .presence-btn {
    padding: 14px;
    font-size: 15px;
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
