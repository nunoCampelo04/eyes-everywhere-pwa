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
        <h2 class="page-title">Detalhes da Auditoria</h2>
        <button class="save-btn" @click="guardarAlteracoes" :disabled="!alteracoesPendentes">
          <i class="fas fa-save"></i>
        </button>
      </div>

      <!-- Status da auditoria -->
      <div class="status-section">
        <div class="status-badge active">
          <i class="fas fa-play"></i>
          <span>Em Progresso</span>
        </div>
      </div>

      <!-- Tabs de categorias -->
      <div class="tabs" ref="tabsBar">
        <button v-for="(tab, i) in tabs" :key="i" :class="{ active: activeTab === i }" @click="setActiveTab(i)"
          ref="tabBtns">
          <i :class="tab.icon"></i> {{ tab.label }}
        </button>
      </div>

      <!-- Formulário dividido por categorias -->
      <div class="form-section">
        <!-- GERAL -->
        <div v-show="activeTab === 0">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-heading"></i>
              Título
            </label>
            <input type="text" v-model="auditoria.titulo" class="form-input" @input="marcarAlteracoes" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-tag"></i>
              Tipo
            </label>
            <select v-model="auditoria.tipo" class="form-select" @change="marcarAlteracoes">
              <option value="Segurança Rodoviária">Segurança Rodoviária</option>
              <option value="Infraestruturas">Infraestruturas</option>
              <option value="Ambiente">Ambiente</option>
              <option value="Urbanismo">Urbanismo</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-calendar"></i>
              Data e Hora
            </label>
            <input type="datetime-local" v-model="dataFormatada" class="form-input" @input="marcarAlteracoes" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-exclamation-triangle"></i>
              Prioridade
            </label>
            <select v-model="auditoria.prioridade" class="form-select" @change="marcarAlteracoes">
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-align-left"></i>
              Descrição
            </label>
            <textarea v-model="auditoria.descricao" class="form-textarea" rows="4"
              placeholder="Descreva os detalhes da auditoria..." @input="marcarAlteracoes"></textarea>
          </div>
        </div>

        <!-- LOCALIZAÇÃO -->
        <div v-show="activeTab === 1">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-map-marker-alt"></i>
              Localização
            </label>
            <input type="text" v-model="auditoria.local" class="form-input" placeholder="Endereço ou coordenadas"
              @input="marcarAlteracoes" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-map"></i>
              Mapa da Localização
            </label>
            <div class="map-section">
              <div id="detailMap" class="map-container"></div>
              <div v-if="!mapLoaded" class="map-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando mapa...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- RECURSOS -->
        <div v-show="activeTab === 2">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-users"></i>
              Especialistas
            </label>
            <div class="especialistas-selector">
              <div class="especialistas-disponiveis">
                <h5>Disponíveis:</h5>
                <div class="especialista-list">
                  <div v-for="esp in especialistasDisponiveis" :key="esp.id" class="especialista-item"
                    @click="adicionarEspecialista(esp)">
                    <img :src="esp.avatar" :alt="esp.nome" class="especialista-avatar">
                    <span>{{ esp.nome }}</span>
                    <i class="fas fa-plus"></i>
                  </div>
                </div>
              </div>
              <div class="especialistas-selecionados">
                <h5>Selecionados:</h5>
                <div class="especialista-list">
                  <div v-for="esp in especialistasSelecionados" :key="esp.id" class="especialista-item selected"
                    @click="removerEspecialista(esp)">
                    <img :src="esp.avatar" :alt="esp.nome" class="especialista-avatar">
                    <span>{{ esp.nome }}</span>
                    <i class="fas fa-times"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-tools"></i>
              Materiais
            </label>
            <input type="text" v-model="auditoria.materiais" class="form-input" placeholder="Materiais necessários"
              @input="marcarAlteracoes" />
          </div>
        </div>

        <!-- ANEXOS -->
        <div v-show="activeTab === 3">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-file-alt"></i>
              Documentos
            </label>
            <div class="documentos-section">
              <input type="file" ref="fileInput" @change="anexarDocumento" multiple accept=".pdf,.doc,.docx,.jpg,.png"
                style="display: none">
              <button class="anexar-btn" @click="$refs.fileInput.click()">
                <i class="fas fa-paperclip"></i>
                <span>Anexar Documento</span>
              </button>
              <div v-if="documentosAnexados.length" class="documentos-anexados">
                <div v-for="(doc, index) in documentosAnexados" :key="index" class="documento-item">
                  <i :class="getDocumentIcon(doc.type)"></i>
                  <span class="documento-nome">{{ doc.name }}</span>
                  <button class="ver-documento" @click="visualizarDocumento(doc)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="remover-documento" @click="removerDocumento(index)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-microphone"></i>
              Gravação de Áudio
            </label>
            <div class="audio-section">
              <div class="audio-controls">
                <button class="audio-btn record" :class="{ recording: gravandoAudio }" @click="toggleGravacao">
                  <i :class="gravandoAudio ? 'fas fa-stop' : 'fas fa-microphone'"></i>
                  <span>{{ gravandoAudio ? 'Parar' : 'Gravar' }}</span>
                </button>
                <button v-if="audioGravado" class="audio-btn play" @click="reproduzirAudio">
                  <i class="fas fa-play"></i>
                  <span>Reproduzir</span>
                </button>
                <button v-if="audioGravado" class="audio-btn delete" @click="removerAudio">
                  <i class="fas fa-trash"></i>
                  <span>Remover</span>
                </button>
              </div>
              <div v-if="audioGravado" class="audio-info">
                <i class="fas fa-volume-up"></i>
                <span>Áudio gravado ({{ formatarDuracao(audioGravado.duration) }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation Component -->
      <BottomNav />
    </div>
  </div>
</template>

<script>
import BottomNav from '../components/BottomNav.vue'
import { Loader } from "@googlemaps/js-api-loader"

export default {
  name: 'DetalheAuditoria',
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
        documentos: ''
      },
      alteracoesPendentes: false,
      darkMode: true,
      especialistasDisponiveis: [],
      especialistasSelecionados: [],
      documentosAnexados: [],
      audioGravado: null,
      gravandoAudio: false,
      mediaRecorder: null,
      mapa: null,
      mapLoaded: false,
      marcador: null,
      documentoVisualizando: null,
      currentDocIndex: 0,
      documentContent: '',
      imageZoom: 1,

      tabs: [
        { label: 'Geral', icon: 'fas fa-info-circle' },
        { label: 'Localização', icon: 'fas fa-map-marker-alt' },
        { label: 'Recursos', icon: 'fas fa-users' },
        { label: 'Anexos', icon: 'fas fa-file-alt' },
      ],
      activeTab: 0,
    }
  },
  computed: {
    dataFormatada: {
      get() {
        if (!this.auditoria.data) return ''
        const data = new Date(this.auditoria.data)
        return data.toISOString().slice(0, 16)
      },
      set(value) {
        this.auditoria.data = new Date(value).toISOString()
      }
    },
    isLargeContent() {
      if (!this.documentoVisualizando) return false
      return this.isImageFile(this.documentoVisualizando) || this.isPDFFile(this.documentoVisualizando)
    }
  },
  mounted() {
    this.loadTheme()
    this.carregarAuditoria()
    this.loadData()
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
      const auditorias = JSON.parse(localStorage.getItem('auditorias') || '[]')
      const auditoria = auditorias.find(a => a.id == id)

      if (auditoria) {
        this.auditoria = { ...auditoria }
      } else {
        this.$router.back()
      }
    },

    marcarAlteracoes() {
      this.alteracoesPendentes = true
      // Se a localização mudou, atualizar o mapa
      if (this.mapa) {
        setTimeout(() => {
          this.atualizarMapa()
        }, 500) // Pequeno delay para permitir que o usuário termine de digitar
      }
    },

    guardarAlteracoes() {
      const auditorias = JSON.parse(localStorage.getItem('auditorias') || '[]')
      const index = auditorias.findIndex(a => a.id == this.auditoria.id)

      if (index !== -1) {
        auditorias[index] = { ...this.auditoria }
        localStorage.setItem('auditorias', JSON.stringify(auditorias))
        this.alteracoesPendentes = false

        // Feedback visual
        const btn = document.querySelector('.save-btn')
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)'
        setTimeout(() => {
          btn.style.background = ''
        }, 1000)
      }
    },

    concluirAuditoria() {
      if (confirm('Tem certeza que deseja marcar esta auditoria como concluída?')) {
        // Remover das auditorias ativas
        let auditorias = JSON.parse(localStorage.getItem('auditorias') || '[]')
        auditorias = auditorias.filter(a => a.id != this.auditoria.id)
        localStorage.setItem('auditorias', JSON.stringify(auditorias))

        // Adicionar às concluídas
        const concluidas = JSON.parse(localStorage.getItem('auditoriasConcluidas') || '[]')
        concluidas.push({
          ...this.auditoria,
          dataConclusao: new Date().toISOString()
        })
        localStorage.setItem('auditoriasConcluidas', JSON.stringify(concluidas))

        this.$router.push('/auditorias/concluidas')
      }
    },

    eliminarAuditoria() {
      if (confirm('Tem certeza que deseja eliminar esta auditoria? Esta ação não pode ser desfeita.')) {
        let auditorias = JSON.parse(localStorage.getItem('auditorias') || '[]')
        auditorias = auditorias.filter(a => a.id != this.auditoria.id)
        localStorage.setItem('auditorias', JSON.stringify(auditorias))

        this.$router.back()
      }
    },

    loadData() {
      // Carregar especialistas disponíveis
      this.especialistasDisponiveis = JSON.parse(localStorage.getItem('especialistas') || '[]')
      // ... resto do método
    },

    adicionarEspecialista(especialista) {
      if (!this.especialistasSelecionados.find(e => e.id === especialista.id)) {
        this.especialistasSelecionados.push(especialista)
        this.marcarAlteracoes()
      }
    },

    removerEspecialista(especialista) {
      this.especialistasSelecionados = this.especialistasSelecionados.filter(e => e.id !== especialista.id)
      this.marcarAlteracoes()
    },

    setActiveTab(i) {
      this.activeTab = i
      this.$nextTick(() => {
        this.scrollToActiveTab()
      })
    },
    scrollToActiveTab() {
      const tabsBar = this.$refs.tabsBar
      const tabBtns = this.$refs.tabBtns
      if (!tabsBar || !tabBtns || !tabBtns[this.activeTab]) return
      const activeBtn = tabBtns[this.activeTab]
      const barRect = tabsBar.getBoundingClientRect()
      const btnRect = activeBtn.getBoundingClientRect()
      // Se o botão ativo não está totalmente visível, faz scroll
      if (btnRect.left < barRect.left || btnRect.right > barRect.right) {
        tabsBar.scrollTo({
          left: activeBtn.offsetLeft - tabsBar.offsetWidth / 2 + activeBtn.offsetWidth / 2,
          behavior: 'smooth'
        })
      }
    },

    anexarDocumento(event) {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.documentosAnexados.push({
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target.result
          })
          this.marcarAlteracoes()
        }
        reader.readAsDataURL(file)
      })
    },

    visualizarDocumento(documento) {
      this.documentoVisualizando = documento
      this.currentDocIndex = this.documentosAnexados.findIndex(doc => doc === documento)
      this.imageZoom = 1

      // Se for arquivo de texto, carregar conteúdo
      if (this.isTextFile(documento)) {
        this.loadTextContent(documento)
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

    downloadDocumento(doc) {
      const link = document.createElement('a')
      link.href = doc.data
      link.download = doc.name
      link.click()
    },

    isImageFile(doc) {
      return doc.type.startsWith('image/')
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

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

    getDocumentIcon(type) {
      if (type.includes('pdf')) return 'fas fa-file-pdf'
      if (type.includes('image')) return 'fas fa-file-image'
      if (type.includes('word')) return 'fas fa-file-word'
      return 'fas fa-file'
    },

    async toggleGravacao() {
      if (this.gravandoAudio) {
        this.pararGravacao()
      } else {
        await this.iniciarGravacao()
      }
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

      const map = new window.google.maps.Map(document.getElementById("detailMap"), {
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

        const iconeAzul = {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }

        this.marcador = new window.google.maps.Marker({
          position: { lat: parseFloat(lat), lng: parseFloat(lon) },
          map: this.mapa,
          title: this.auditoria.titulo,
          icon: iconeAzul
        })

        const contentString = `
          <div style="color: black; padding: 10px; font-family: 'Poppins', sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${this.auditoria.titulo}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Tipo:</strong> ${this.auditoria.tipo}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Localização:</strong> ${this.auditoria.local}</p>
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
      const mapElement = document.getElementById('detailMap')
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

    async atualizarMapa() {
      if (this.mapa && this.auditoria.local) {
        await this.adicionarMarcador()
      }
    },

    async iniciarGravacao() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(stream)

        const chunks = []
        this.mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data)
        }

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' })
          const url = URL.createObjectURL(blob)
          this.audioGravado = {
            url: url,
            blob: blob,
            duration: Date.now() - this.inicioGravacao
          }
          this.marcarAlteracoes()
        }

        this.mediaRecorder.start()
        this.gravandoAudio = true
        this.inicioGravacao = Date.now()
      } catch (error) {
        console.error('Erro ao acessar microfone:', error)
        alert('Erro ao acessar o microfone. Verifique as permissões.')
      }
    },

    pararGravacao() {
      if (this.mediaRecorder && this.gravandoAudio) {
        this.mediaRecorder.stop()
        this.gravandoAudio = false

        // Parar todas as tracks do stream
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
    },

    reproduzirAudio() {
      if (this.audioGravado) {
        const audio = new Audio(this.audioGravado.url)
        audio.play()
      }
    },

    removerAudio() {
      if (confirm('Remover gravação de áudio?')) {
        if (this.audioGravado) {
          URL.revokeObjectURL(this.audioGravado.url)
        }
        this.audioGravado = null
        this.marcarAlteracoes()
      }
    },

    formatarDuracao(ms) {
      const segundos = Math.floor(ms / 1000)
      const minutos = Math.floor(segundos / 60)
      const segs = segundos % 60
      return `${minutos}:${segs.toString().padStart(2, '0')}`
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
  --danger-primary: #ef4444;
  --danger-secondary: #dc2626;
}

/* Background principal - IGUAL AO LOGIN */
.login-bg {
  background: var(--bg-primary);
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch; /* <-- IMPORTANTE! */
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  transition: all 0.5s ease;
  padding: 10px;
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
  margin-bottom: 80px; 
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.back-btn,
.save-btn {
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
  background: var(--accent-primary);
  color: white;
  transform: scale(1.05);
}

.save-btn:hover:not(:disabled) {
  background: var(--success-primary);
  color: white;
  transform: scale(1.05);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.tabs button {
  flex: 1;
  padding: 10px 8px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 90px;
}

.tabs button.active {
  color: var(--accent-primary);
  border-bottom: 2px solid var(--accent-primary);
  background: rgba(39, 122, 255, 0.05);
}

/* Status Section */
.status-section {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.status-badge {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(39, 122, 255, 0.3);
}

.status-badge.active {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

/* Form Section */
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
.form-select,
.form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  resize: none;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(39, 122, 255, 0.1);
}

.form-select {
  cursor: pointer;
}

.form-textarea {
  min-height: 80px;
  line-height: 1.5;
}

/* Especialistas Selector */
.especialistas-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.especialistas-disponiveis h5,
.especialistas-selecionados h5 {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.especialista-list {
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.especialista-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-primary);
}

.especialista-item.selected {
  background: rgba(39, 122, 255, 0.1);
  border-color: var(--accent-primary);
}

.especialista-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

/* Documentos Section */
.documentos-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.anexar-btn {
  background: rgba(39, 122, 255, 0.1);
  border: 1px solid rgba(39, 122, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: var(--accent-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
}

.anexar-btn:hover {
  background: rgba(39, 122, 255, 0.2);
  border-color: var(--accent-primary);
}

.documentos-anexados {
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
}

.documento-nome {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
}

.ver-documento,
.remover-documento {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.ver-documento {
  background: rgba(39, 122, 255, 0.2);
  color: var(--accent-primary);
}

.remover-documento {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger-primary);
}

/* Audio Section */
.audio-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audio-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.audio-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.audio-btn.record {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--danger-primary);
}

.audio-btn.record.recording {
  background: var(--danger-primary);
  color: white;
  animation: pulse 1s infinite;
}

.audio-btn.play {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-primary);
}

.audio-btn.delete {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--danger-primary);
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
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

.action-btn.complete {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-primary);
}

.action-btn.complete:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--success-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--danger-primary);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--danger-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Responsividade */
@media (max-width: 480px) {
  .login-bg {
    padding: 5px; 
  }
  .page-container {
    padding: 16px 8px; 
    border-radius: 16px;
    max-width: 100%;
    margin-top: 10px;
    margin-bottom: 70px; 
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

  .form-input,
  .form-select,
  .form-textarea {
    padding: 10px 14px;
  }

  .action-btn {
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

/* Map Section */
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
  border-radius: 12px;
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
  color: var(--accent-primary);
}

.map-loading p {
  font-size: 12px;
  margin: 0;
}

/* Modal Styles */
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
</style>
