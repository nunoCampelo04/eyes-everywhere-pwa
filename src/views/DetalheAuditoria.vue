<template>
  <div class="login-bg" :class="{ 'light-mode': !darkMode }">
    <!-- Toggle de tema -->
    <button class="theme-toggle" @click="toggleTheme">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>

    <div class="detail-container">
      <!-- Cabeçalho -->
      <div class="detail-header">
        <button class="back-btn" @click="$router.back()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2 class="detail-title">Detalhes da Auditoria</h2>
        <div class="header-actions">
          <button class="header-btn save-btn" @click="guardarAlteracoes" :disabled="!alteracoesPendentes">
            <i class="fas fa-save"></i>
          </button>
          <button v-if="auditoria.estado !== 'Concluída'" class="header-btn concluir-btn" @click="concluirAuditoria" title="Concluir Auditoria">
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>

      <!-- Status -->
      <div class="status-section">
        <div class="status-badge">
          <i class="fas fa-play"></i>
          <span>Em Progresso</span>
        </div>
      </div>

      <!-- Tabs de categorias -->
      <div class="tabs" ref="tabsBar">
        <button
          v-for="(tab, i) in tabs"
          :key="i"
          :class="{ active: activeTab === i }"
          @click="setActiveTab(i)"
          ref="tabBtns"
        >
          <i :class="tab.icon"></i> {{ tab.label }}
        </button>
      </div>

      <!-- Formulário -->
      <div class="form-section">
        <!-- GERAL -->
        <div v-show="activeTab === 0">
          <div class="form-group">
            <label class="form-label"><i class="fas fa-heading"></i> Título</label>
            <input type="text" v-model="auditoria.nome" class="form-input" @input="marcarAlteracoes" />
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fas fa-tag"></i> Tipo</label>
            <select v-model="auditoria.tipo" class="form-select" @change="marcarAlteracoes">
              <option>Segurança Rodoviária</option>
              <option>Infraestruturas</option>
              <option>Ambiente</option>
              <option>Urbanismo</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fas fa-calendar"></i> Data e Hora</label>
            <input type="datetime-local" v-model="dataFormatada" class="form-input" @input="marcarAlteracoes" />
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fas fa-exclamation-triangle"></i> Prioridade</label>
            <select v-model="auditoria.prioridade" class="form-select" @change="marcarAlteracoes">
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fas fa-align-left"></i> Descrição</label>
            <textarea v-model="auditoria.descricao" class="form-textarea" rows="4" placeholder="Descreva os detalhes da auditoria..." @input="marcarAlteracoes"></textarea>
          </div>
        </div>

        <!-- LOCALIZAÇÃO -->
        <div v-show="activeTab === 1">
          <div class="form-group">
            <label class="form-label"><i class="fas fa-map-marker-alt"></i> Localização</label>
            <input type="text" v-model="auditoria.local" class="form-input" placeholder="Endereço ou coordenadas" @input="marcarAlteracoes" />
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fas fa-map"></i> Mapa da Localização</label>
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
            <label class="form-label"><i class="fas fa-users"></i> Especialistas</label>
            <div class="especialistas-selector">
              <div class="especialistas-disponiveis">
                <h5>Disponíveis:</h5>
                <div class="especialista-list">
                  <div v-for="esp in especialistasDisponiveis" :key="esp.id" class="especialista-item" @click="adicionarEspecialista(esp)">
                    <img :src="esp.avatar" :alt="esp.nome" class="especialista-avatar" />
                    <span>{{ esp.nome }}</span>
                    <i class="fas fa-plus"></i>
                  </div>
                </div>
              </div>
              <div class="especialistas-selecionados">
                <h5>Selecionados:</h5>
                <div class="especialista-list">
                  <div v-for="esp in especialistasSelecionados" :key="esp.id" class="especialista-item selected" @click="removerEspecialista(esp)">
                    <img :src="esp.avatar" :alt="esp.nome" class="especialista-avatar" />
                    <span>{{ esp.nome }}</span>
                    <i class="fas fa-times"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fas fa-tools"></i> Materiais</label>
            <input type="text" v-model="auditoria.materiais" class="form-input" placeholder="Materiais necessários" @input="marcarAlteracoes" />
          </div>
        </div>

        <!-- ANEXOS -->
        <div v-show="activeTab === 3">
          <div class="form-group">
            <label class="form-label"><i class="fas fa-file-alt"></i> Documentos</label>
            <div class="documentos-section">
              <input type="file" ref="fileInput" @change="anexarDocumento" multiple accept=".pdf,.doc,.docx,.jpg,.png" style="display: none">
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
            <label class="form-label"><i class="fas fa-microphone"></i> Gravação de Áudio</label>
            <div class="audio-section">
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
          </div>
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
      const auditorias = JSON.parse(localStorage.getItem('auditoriasADECORRER') || '[]')
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
      const auditorias = JSON.parse(localStorage.getItem('auditoriasADECORRER') || '[]')
      const index = auditorias.findIndex(a => a.id == this.auditoria.id)

      if (index !== -1) {
        auditorias[index] = { ...this.auditoria }
        localStorage.setItem('auditoriasADECORRER', JSON.stringify(auditorias))
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
        let auditorias = JSON.parse(localStorage.getItem('auditoriasADECORRER') || '[]')
        auditorias = auditorias.filter(a => a.id != this.auditoria.id)
        localStorage.setItem('auditoriasADECORRER', JSON.stringify(auditorias))

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
:root {
  --bg-primary: #0a0f1a;
  --bg-secondary: #132340;
  --text-primary: #ffffff;
  --text-secondary: #aad1ff;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
  --input-bg: #dce4f7;
  --input-text: #333;
}
.light-mode {
  --bg-primary: #ffffff;
  --bg-secondary: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent-primary: #277AFF;
  --accent-secondary: #00aaff;
  --input-bg: #f8f9fa;
  --input-text: #333;
}

/* Container principal */
.login-bg {
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;
  padding-bottom: 80px;
  position: relative;
  transition: all 0.5s ease;
}
.login-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: none;
  pointer-events: none;
}

/* Toggle de tema */
.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  color: var(--text-primary);
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: 10;
}
.theme-toggle:hover {
  background: rgba(255,255,255,0.2);
  transform: scale(1.1);
}

/* Container detalhes */
.detail-container {
  background: var(--bg-secondary);
  padding: 24px 20px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05);
  animation: slideUp 0.6s ease-out;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Cabeçalho */
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.detail-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.back-btn, .header-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.3s ease;
}
.back-btn:hover, .header-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}
.header-actions {
  display: flex;
  gap: 8px;
}

/* Status */
.status-section {
  text-align: center;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-primary);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 500;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}
.tabs button {
  background: var(--input-bg);
  color: var(--text-secondary);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  white-space: nowrap;
  transition: all 0.2s;
}
.tabs button.active {
  background: var(--accent-primary);
  color: var(--text-primary);
}

/* Formulário */
.form-group {
  margin-bottom: 16px;
}
.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  background: var(--input-bg);
  color: var(--input-text);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  transition: box-shadow 0.2s;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(39,122,255,0.2);
}

/* Map Section */
.map-section {
  position: relative;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
}
.map-loading {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

/* Especialistas */
.especialista-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.especialista-item {
  background: var(tex);
  border: 1px solid rgba(0, 0, 0, 0.984);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.especialista-item:hover {
  box-shadow: 0 2px 8px solid rgba(0, 0, 0, 0.984);
}
.especialista-avatar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
}
.especialista-item span {
  color: var(--text-primary); 
}
.especialista-item i.fa-plus {
  color: black;  
}
h5 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

/* Anexos */
.anexar-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}
.anexar-btn:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-1px);
}

/* Responsividade */
@media (max-width: 480px) {
  .detail-container {
    padding: 16px;
    border-radius: 16px;
    max-width: 100%;
  }
  .theme-toggle {
    width: 35px;
    height: 35px;
    top: 10px;
    right: 10px;
  }
  .tabs button {
    padding: 6px 10px;
    font-size: 13px;
  }
}
</style>
