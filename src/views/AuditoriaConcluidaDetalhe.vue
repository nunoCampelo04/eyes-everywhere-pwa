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
        <h2 class="page-title">Auditoria Concluída</h2>
        <div class="header-badge">
          <i class="fas fa-check"></i>
        </div>
      </div>

      <!-- Status da auditoria -->
      <div class="status-section">
        <div class="status-badge completed">
          <i class="fas fa-check-circle"></i>
          <span>Concluída</span>
        </div>
        <div class="completion-date">
          <span>Finalizada em {{ formatarDataCompleta(auditoria.dataConclusao) }}</span>
        </div>
      </div>

      <!-- Informações da auditoria -->
      <div class="info-section">
        <div class="info-card">
          <div class="info-header">
            <h3 class="info-title">{{ auditoria.nome }}</h3>
            <span class="info-type completed">{{ auditoria.tipo }}</span>
          </div>
          
          <div class="info-details">
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatarDataCompleta(auditoria.data) }}</span>
            </div>
            
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatarHora(auditoria.data) }}</span>
            </div>
            
            <div v-if="auditoria.local" class="info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ auditoria.local || 'Localização não definida' }}</span>
            </div>

            <!-- Adicionar esta seção do mapa -->
            <div v-if="auditoria.local" class="map-section">
              <h4 class="map-title">
                <i class="fas fa-map"></i>
                Localização no Mapa
              </h4>
              <div id="completedAuditMap" class="map-container"></div>
              <div v-if="!mapLoaded" class="map-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando mapa...</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Prioridade: {{ auditoria.prioridade }}</span>
            </div>

            <div v-if="auditoria.dataInicio" class="info-item">
              <i class="fas fa-play"></i>
              <span>Iniciada em {{ formatarDataCompleta(auditoria.dataInicio) }}</span>
            </div>
          </div>
        </div>

        <div class="description-card">
          <h4 class="description-title">
            <i class="fas fa-align-left"></i>
            Descrição
          </h4>
          <p class="description-text">{{ auditoria.descricao || 'Sem descrição disponível' }}</p>
        </div>

        <!-- Especialistas envolvidos -->
        <div v-if="especialistasEnvolvidos.length > 0" class="detail-card">
          <h4 class="detail-title">
            <i class="fas fa-users"></i>
            Especialistas Envolvidos
          </h4>
          <div class="especialistas-list">
            <div 
              v-for="especialista in especialistasEnvolvidos" 
              :key="especialista.id"
              class="especialista-item readonly"
            >
              <img :src="especialista.avatar" :alt="especialista.nome" class="especialista-avatar">
              <div class="especialista-info">
                <span class="especialista-nome">{{ especialista.nome }}</span>
                <span class="especialista-area">{{ especialista.area }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="auditoria.materiais" class="detail-card">
          <h4 class="detail-title">
            <i class="fas fa-tools"></i>
            Materiais
          </h4>
          <p class="detail-text">{{ auditoria.materiais }}</p>
        </div>

        <!-- Documentos anexados -->
        <div v-if="documentosAnexados.length > 0" class="detail-card">
          <h4 class="detail-title">
            <i class="fas fa-file-alt"></i>
            Documentos Anexados
          </h4>
          <div class="documentos-list">
            <div 
              v-for="(doc, index) in documentosAnexados" 
              :key="index"
              class="documento-item readonly"
              @click="visualizarDocumento(doc)"
            >
              <i :class="getDocumentIcon(doc.type)" class="documento-icon"></i>
              <div class="documento-info">
                <span class="documento-nome">{{ doc.name }}</span>
                <span class="documento-size">{{ formatFileSize(doc.size) }}</span>
              </div>
              <button class="ver-documento">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Gravações de áudio -->
        <div v-if="audioGravacoes.length > 0" class="detail-card">
          <h4 class="detail-title">
            <i class="fas fa-microphone"></i>
            Gravações de Áudio
          </h4>
          <div class="audio-list">
            <div 
              v-for="(audio, index) in audioGravacoes" 
              :key="index"
              class="audio-item readonly"
            >
              <div class="audio-info">
                <i class="fas fa-volume-up"></i>
                <span>Gravação {{ index + 1 }}</span>
                <span class="audio-duration">{{ formatarDuracao(audio.duration) }}</span>
              </div>
              <div class="audio-controls">
                <button @click="reproduzirAudio(audio)" class="audio-control-btn">
                  <i :class="audioAtual === audio && audioTocando ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <button @click="downloadAudio(audio)" class="audio-control-btn">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="auditoria.origem" class="detail-card">
          <h4 class="detail-title">
            <i class="fas fa-info-circle"></i>
            Origem
          </h4>
          <p class="detail-text">{{ auditoria.origem }}</p>
        </div>

        <!-- Resumo da conclusão -->
        <div class="summary-card">
          <h4 class="summary-title">
            <i class="fas fa-clipboard-check"></i>
            Resumo da Conclusão
          </h4>
          <div class="summary-stats">
            <div class="summary-item">
              <span class="summary-label">Duração</span>
              <span class="summary-value">{{ calcularDuracao() }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Status</span>
              <span class="summary-value success">Finalizada com Sucesso</span>
            </div>
            <div v-if="documentosAnexados.length > 0" class="summary-item">
              <span class="summary-label">Documentos</span>
              <span class="summary-value">{{ documentosAnexados.length }} anexado(s)</span>
            </div>
            <div v-if="audioGravacoes.length > 0" class="summary-item">
              <span class="summary-label">Gravações</span>
              <span class="summary-value">{{ audioGravacoes.length }} áudio(s)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="actions-section">
        <button class="action-btn export" @click="exportarRelatorio">
          <i class="fas fa-download"></i>
          <span>Exportar Relatório</span>
        </button>
        
        <button class="action-btn archive" @click="arquivarAuditoria">
          <i class="fas fa-archive"></i>
          <span>Arquivar</span>
        </button>
      </div>
    </div>

    <!-- Modal de visualização de documento -->
    <div v-if="documentoVisualizando" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-container" :class="{ 'modal-large': isLargeContent }">
        <div class="modal-header">
          <div class="modal-title-section">
            <h3 class="modal-title">{{ documentoVisualizando.name }}</h3>
            <span class="modal-subtitle">{{ formatFileSize(documentoVisualizando.size) }}</span>
          </div>
          <div class="modal-controls">
            <button v-if="documentosAnexados.length > 1" class="modal-nav-btn" @click="documentoAnterior" :disabled="currentDocIndex === 0">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span v-if="documentosAnexados.length > 1" class="modal-counter">
              {{ currentDocIndex + 1 }} / {{ documentosAnexados.length }}
            </span>
            <button v-if="documentosAnexados.length > 1" class="modal-nav-btn" @click="proximoDocumento" :disabled="currentDocIndex === documentosAnexados.length - 1">
              <i class="fas fa-chevron-right"></i>
            </button>
            <button class="modal-action-btn download" @click="downloadDocumento(documentoVisualizando)" title="Download">
              <i class="fas fa-download"></i>
            </button>
            <button class="modal-action-btn close" @click="fecharModal" title="Fechar">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="modal-content">
          <div class="document-viewer">
            <!-- Visualização de Imagens -->
            <div v-if="isImageFile(documentoVisualizando)" class="image-viewer">
              <img 
                :src="documentoVisualizando.data" 
                :alt="documentoVisualizando.name"
                class="document-image"
                @load="onImageLoad"
              />
              <div class="image-controls">
                <button class="image-control-btn" @click="zoomIn" title="Zoom In">
                  <i class="fas fa-search-plus"></i>
                </button>
                <button class="image-control-btn" @click="zoomOut" title="Zoom Out">
                  <i class="fas fa-search-minus"></i>
                </button>
                <button class="image-control-btn" @click="resetZoom" title="Tamanho Original">
                  <i class="fas fa-expand-arrows-alt"></i>
                </button>
              </div>
            </div>
            
            <!-- Visualização de PDFs -->
            <div v-else-if="isPDFFile(documentoVisualizando)" class="pdf-viewer">
              <iframe 
                :src="documentoVisualizando.data" 
                class="pdf-frame"
                title="Visualizador de PDF"
              ></iframe>
              <div class="pdf-fallback">
                <i class="fas fa-file-pdf"></i>
                <p>Visualizador de PDF</p>
                <small>Se o PDF não carregar, use o botão de download</small>
              </div>
            </div>
            
            <!-- Visualização de Documentos de Texto -->
            <div v-else-if="isTextFile(documentoVisualizando)" class="text-viewer">
              <div class="text-content" v-html="documentContent"></div>
            </div>
            
            <!-- Outros tipos de arquivo -->
            <div v-else class="file-preview">
              <div class="file-icon-large">
                <i :class="getDocumentIcon(documentoVisualizando.type)"></i>
              </div>
              <div class="file-info">
                <h4>{{ documentoVisualizando.name }}</h4>
                <p class="file-type">{{ getFileTypeDescription(documentoVisualizando.type) }}</p>
                <p class="file-size">{{ formatFileSize(documentoVisualizando.size) }}</p>
              </div>
              <button class="preview-download-btn" @click="downloadDocumento(documentoVisualizando)">
                <i class="fas fa-download"></i>
                <span>Baixar Arquivo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Player de áudio oculto -->
    <audio ref="audioPlayer" @ended="audioTocando = false"></audio>

    <!-- Bottom Navigation Component -->
    <BottomNav />
  </div>
</template>

<script>
import BottomNav from '../components/BottomNav.vue'
import { Loader } from "@googlemaps/js-api-loader"

export default {
  name: 'AuditoriaConcluidaDetalhe',
  components: { BottomNav },
  data() {
    return {
      auditoria: {
        id: null,
        titulo: '',
        tipo: '',
        data: '',
        local: '',
        descricao: '',
        prioridade: '',
        especialistas: '',
        materiais: '',
        documentos: '',
        origem: '',
        dataInicio: '',
        dataConclusao: ''
      },
      darkMode: true,
      especialistasEnvolvidos: [],
      documentosAnexados: [],
      audioGravacoes: [],
      documentoVisualizando: null,
      audioAtual: null,
      audioTocando: false,
      currentDocIndex: 0,
      documentContent: '',
      imageZoom: 1,
      mapa: null,
      mapLoaded: false,
      marcador: null
    }
  },
  mounted() {
    this.loadTheme()
    this.carregarAuditoria()
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      this.inicializarMapa()
    }, 100)
  },
  computed: {
    isLargeContent() {
      if (!this.documentoVisualizando) return false
      return this.isImageFile(this.documentoVisualizando) || this.isPDFFile(this.documentoVisualizando)
    }
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
      const auditorias = JSON.parse(localStorage.getItem('auditoriasConcluidas') || '[]')
      const auditoria = auditorias.find(a => a.id == id)
      
      if (auditoria) {
        this.auditoria = { ...auditoria }
        
        // Carregar dados anexados se existirem
        if (auditoria.especialistasSelecionados) {
          this.especialistasEnvolvidos = auditoria.especialistasSelecionados
        }
        
        if (auditoria.documentosAnexados) {
          this.documentosAnexados = auditoria.documentosAnexados
        }
        
        if (auditoria.audioGravacoes) {
          this.audioGravacoes = auditoria.audioGravacoes
        }
      } else {
        this.$router.back()
      }
    },

    formatarDataCompleta(dataStr) {
      if (!dataStr) return 'Data não disponível'
      const data = new Date(dataStr)
      return data.toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },

    formatarHora(dataStr) {
      if (!dataStr) return '--:--'
      const data = new Date(dataStr)
      return `${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`
    },

    calcularDuracao() {
      if (!this.auditoria.dataInicio || !this.auditoria.dataConclusao) {
        return 'Não calculável'
      }
      
      const inicio = new Date(this.auditoria.dataInicio)
      const fim = new Date(this.auditoria.dataConclusao)
      const diffMs = fim - inicio
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDias === 0) {
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
        return diffHoras > 0 ? `${diffHoras} horas` : 'Menos de 1 hora'
      } else if (diffDias === 1) {
        return '1 dia'
      } else {
        return `${diffDias} dias`
      }
    },

    exportarRelatorio() {
      // Simular exportação
      const dados = {
        titulo: this.auditoria.nome,
        tipo: this.auditoria.tipo,
        data: this.formatarDataCompleta(this.auditoria.data),
        local: this.auditoria.local,
        descricao: this.auditoria.descricao,
        prioridade: this.auditoria.prioridade,
        duracao: this.calcularDuracao(),
        dataConclusao: this.formatarDataCompleta(this.auditoria.dataConclusao),
        especialistas: this.especialistasEnvolvidos.length,
        documentos: this.documentosAnexados.length,
        audios: this.audioGravacoes.length
      }
      
      console.log('Exportando relatório:', dados)
      alert('Relatório exportado com sucesso! (Funcionalidade simulada)')
    },

    arquivarAuditoria() {
      if (confirm('Arquivar esta auditoria? Ela será movida para o arquivo.')) {
        // Simular arquivamento
        alert('Auditoria arquivada com sucesso! (Funcionalidade simulada)')
      }
    },

    // Métodos para documentos
    getDocumentIcon(type) {
      if (type.includes('pdf')) return 'fas fa-file-pdf'
      if (type.includes('image')) return 'fas fa-file-image'
      if (type.includes('word')) return 'fas fa-file-word'
      return 'fas fa-file'
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    visualizarDocumento(doc) {
      this.documentoVisualizando = doc
      this.currentDocIndex = this.documentosAnexados.findIndex(documento => documento === doc)
      this.imageZoom = 1
      
      // Se for arquivo de texto, carregar conteúdo
      if (this.isTextFile(doc)) {
        this.loadTextContent(doc)
      }
    },

    fecharModal() {
      this.documentoVisualizando = null
      this.documentContent = ''
      this.imageZoom = 1
    },

    documentoAnterior() {
      if (this.currentDocIndex > 0) {
        this.currentDocIndex--
        this.visualizarDocumento(this.documentosAnexados[this.currentDocIndex])
      }
    },

    proximoDocumento() {
      if (this.currentDocIndex < this.documentosAnexados.length - 1) {
        this.currentDocIndex++
        this.visualizarDocumento(this.documentosAnexados[this.currentDocIndex])
      }
    },

    isPDFFile(doc) {
      return doc.type === 'application/pdf'
    },

    isTextFile(doc) {
      return doc.type.startsWith('text/') || 
             doc.type === 'application/json' ||
             doc.name.endsWith('.txt') ||
             doc.name.endsWith('.md')
    },

    getFileTypeDescription(type) {
      const types = {
        'application/pdf': 'Documento PDF',
        'application/msword': 'Documento Word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Documento Word',
        'application/vnd.ms-excel': 'Planilha Excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Planilha Excel',
        'text/plain': 'Arquivo de Texto',
        'application/json': 'Arquivo JSON'
      }
      
      if (type.startsWith('image/')) return 'Imagem'
      if (type.startsWith('video/')) return 'Vídeo'
      if (type.startsWith('audio/')) return 'Áudio'
      
      return types[type] || 'Arquivo'
    },

    loadTextContent(doc) {
      // Para arquivos de texto, extrair o conteúdo
      if (doc.data.startsWith('data:text/')) {
        const base64Data = doc.data.split(',')[1]
        try {
          this.documentContent = atob(base64Data)
        } catch (error) {
          this.documentContent = 'Erro ao carregar conteúdo do arquivo'
        }
      }
    },

    // Controles de zoom para imagens
    zoomIn() {
      this.imageZoom = Math.min(this.imageZoom * 1.2, 3)
      this.applyZoom()
    },

    zoomOut() {
      this.imageZoom = Math.max(this.imageZoom / 1.2, 0.5)
      this.applyZoom()
    },

    resetZoom() {
      this.imageZoom = 1
      this.applyZoom()
    },

    applyZoom() {
      const img = document.querySelector('.document-image')
      if (img) {
        img.style.transform = `scale(${this.imageZoom})`
      }
    },

    onImageLoad() {
      this.resetZoom()
    },

    downloadDocumento(doc) {
      const link = document.createElement('a')
      link.href = doc.data
      link.download = doc.name
      link.click()
    },

    // Métodos para áudio
    formatarDuracao(ms) {
      if (!ms) return '0:00'
      const segundos = Math.floor(ms / 1000)
      const minutos = Math.floor(segundos / 60)
      const segs = segundos % 60
      return `${minutos}:${segs.toString().padStart(2, '0')}`
    },

    reproduzirAudio(audio) {
      if (this.audioAtual === audio && this.audioTocando) {
        this.$refs.audioPlayer.pause()
        this.audioTocando = false
      } else {
        this.$refs.audioPlayer.src = audio.url
        this.$refs.audioPlayer.play()
        this.audioAtual = audio
        this.audioTocando = true
      }
    },

    downloadAudio(audio) {
      const link = document.createElement('a')
      link.href = audio.url
      link.download = `gravacao_${Date.now()}.wav`
      link.click()
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

      const map = new window.google.maps.Map(document.getElementById("completedAuditMap"), {
        center: { lat: 41.5454, lng: -8.4265 },
        zoom: 15,
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
      
      if (this.auditoria.local) {
        await this.adicionarMarcador()
      }
    },

    async adicionarMarcador() {
      if (this.marcador) {
        this.marcador.setMap(null)
      }

      if (!this.auditoria.local) return

      try {
        const endereco = encodeURIComponent(this.auditoria.local)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${endereco}&format=json`)
        const dados = await response.json()
        
        if (dados.length === 0) return

        const { lat, lon } = dados[0]

        const iconeVerde = {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }

        this.marcador = new window.google.maps.Marker({
          position: { lat: parseFloat(lat), lng: parseFloat(lon) },
          map: this.mapa,
          title: this.auditoria.nome,
          icon: iconeVerde
        })

        const contentString = `
          <div style="color: black; padding: 10px; font-family: 'Poppins', sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${this.auditoria.nome}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Tipo:</strong> ${this.auditoria.tipo}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Localização:</strong> ${this.auditoria.local}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Status:</strong> Concluída</p>
          </div>
        `
        
        const info = new window.google.maps.InfoWindow({
          content: contentString
        })

        this.marcador.addListener("click", () => {
          info.open(this.mapa, this.marcador)
        })

        this.mapa.setCenter({ lat: parseFloat(lat), lng: parseFloat(lon) })
        this.mapa.setZoom(16)
      } catch (error) {
        console.error('Erro ao geocodificar endereço:', this.auditoria.local, error)
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
      const mapElement = document.getElementById('completedAuditMap')
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
  --info-primary: #3b82f6;
  --info-secondary: #1d4ed8;
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
  --info-primary: #3b82f6;
  --info-secondary: #1d4ed8;
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
    radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(39, 122, 255, 0.1) 0%, transparent 50%);
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

.header-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

/* Status Section */
.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-badge {
  background: linear-gradient(135deg, var(--success-primary), var(--success-secondary));
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.completion-date {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.info-header {
  margin-bottom: 16px;
}

.info-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-family: 'Poppins', sans-serif;
}

.info-type {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-primary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
}

.info-item i {
  width: 16px;
  color: var(--success-primary);
  font-size: 12px;
}

.description-card,
.detail-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.description-title,
.detail-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.description-title i,
.detail-title i {
  color: var(--success-primary);
  font-size: 12px;
}

.description-text,
.detail-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Especialistas List */
.especialistas-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.especialista-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.especialista-item.readonly {
  cursor: default;
  border-color: rgba(16, 185, 129, 0.2);
}

.especialista-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.especialista-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.especialista-nome {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.especialista-area {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* Documentos List */
.documentos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.documento-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.documento-item.readonly {
  cursor: pointer;
  border-color: rgba(59, 130, 246, 0.2);
}

.documento-item.readonly:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--info-primary);
}

.documento-icon {
  font-size: 20px;
  color: var(--info-primary);
  width: 24px;
}

.documento-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.documento-nome {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.documento-size {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.8;
}

.ver-documento {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(59, 130, 246, 0.2);
  color: var(--info-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.ver-documento:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

/* Audio List */
.audio-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.audio-item.readonly {
  border-color: rgba(16, 185, 129, 0.2);
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
}

.audio-info i {
  font-size: 18px;
  color: var(--success-primary);
}

.audio-duration {
  color: var(--text-secondary);
  font-size: 13px;
  margin-left: 8px;
}

.audio-controls {
  display: flex;
  gap: 8px;
}

.audio-control-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.audio-control-btn:first-child {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-primary);
}

.audio-control-btn:first-child:hover {
  background: rgba(16, 185, 129, 0.3);
  transform: scale(1.05);
}

.audio-control-btn:last-child {
  background: rgba(59, 130, 246, 0.2);
  color: var(--info-primary);
}

.audio-control-btn:last-child:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

/* Summary Card */
.summary-card {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.summary-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--success-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.summary-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-value.success {
  color: var(--success-primary);
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

.action-btn.export {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--info-primary);
}

.action-btn.export:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--info-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.archive {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-secondary);
}

.action-btn.archive:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--text-primary);
  color: var(--text-primary);
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-container.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.modal-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  transform: scale(1.1);
}

.modal-content {
  overflow-y: auto;
  flex: 1;
}

/* Document Viewer */
.document-viewer {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.document-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 8px;
}

.document-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
  text-align: center;
  padding: 40px;
}

.document-placeholder i {
  font-size: 64px;
  color: var(--info-primary);
}

.document-placeholder p {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.download-btn {
  background: linear-gradient(135deg, var(--info-primary), var(--info-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.download-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
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

  .info-title {
    font-size: 16px;
  }

  .info-card,
  .description-card,
  .detail-card,
  .summary-card {
    padding: 14px;
  }

  .action-btn {
    padding: 14px;
    font-size: 15px;
  }

  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    width: 95%;
    padding: 16px;
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

/* Modal Styles Atualizados */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 20px;
}

.modal-container {
  background: var(--bg-secondary);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

.modal-container.modal-large {
  max-width: 90vw;
  max-height: 90vh;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  font-family: 'Poppins', sans-serif;
}

.modal-subtitle {
  color: var(--text-secondary);
  font-size: 12px;
  opacity: 0.8;
}

.modal-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-nav-btn,
.modal-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.modal-nav-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.modal-nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.modal-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.modal-action-btn.download {
  background: rgba(39, 122, 255, 0.2);
  color: var(--accent-primary);
}

.modal-action-btn.download:hover {
  background: rgba(39, 122, 255, 0.3);
}

.modal-action-btn.close {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger-primary);
}

.modal-action-btn.close:hover {
  background: rgba(239, 68, 68, 0.3);
}

.modal-counter {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  padding: 0 8px;
}

.modal-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.document-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Image Viewer */
.image-viewer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  position: relative;
  overflow: auto;
}

.document-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  cursor: grab;
}

.document-image:active {
  cursor: grabbing;
}

.image-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px;
  border-radius: 8px;
}

.image-control-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.image-control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* PDF Viewer */
.pdf-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.pdf-fallback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-secondary);
  pointer-events: none;
}

.pdf-fallback i {
  font-size: 48px;
  color: var(--danger-primary);
  margin-bottom: 16px;
}

/* Text Viewer */
.text-viewer {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.text-content {
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* File Preview */
.file-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.file-icon-large {
  font-size: 64px;
  color: var(--accent-primary);
  margin-bottom: 20px;
}

.file-info h4 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  font-family: 'Poppins', sans-serif;
}

.file-type {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 4px 0;
}

.file-size {
  color: var(--text-secondary);
  font-size: 12px;
  margin: 0 0 20px 0;
  opacity: 0.8;
}

.preview-download-btn {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.preview-download-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.4);
}

/* Responsividade do Modal */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    width: 95%;
    max-height: 85vh;
  }
  
  .modal-container.modal-large {
    max-width: 95vw;
    max-height: 85vh;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-title {
    font-size: 16px;
  }
  
  .modal-controls {
    gap: 6px;
  }
  
  .modal-nav-btn,
  .modal-action-btn {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .image-controls {
    bottom: 10px;
    padding: 6px;
    gap: 6px;
  }
  
  .image-control-btn {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
}

/* Map Section */
.map-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  color: var(--success-primary);
  font-size: 12px;
}

.map-container {
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(39, 122, 255, 0.1));
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
  font-size: 20px;
  margin-bottom: 8px;
  color: var(--success-primary);
}

.map-loading p {
  font-size: 12px;
  margin: 0;
}
</style>
