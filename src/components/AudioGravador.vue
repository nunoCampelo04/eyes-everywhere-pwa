<template>
  <div class="audio-clean-box" :class="{ dark: darkMode }">
    <div class="audio-controls">
      <!-- Só mostra o botão de gravar se não estiver em modo readonly -->
      <button 
        v-if="!readonly"
        class="audio-mic-btn"
        :class="{ gravando }"
        @click="toggleGravacao"
        title="Gravar áudio"
      >
        <i :class="gravando ? 'fas fa-stop' : 'fas fa-microphone'" />
        <span v-if="gravando" class="audio-dot"></span>
      </button>
    </div>

    <transition name="fade">
      <div v-if="gravando" class="gravacao-status">
        <i class="fas fa-circle-notch fa-spin"></i>
        <span>A gravar...</span>
      </div>
    </transition>

    <div v-if="audio" class="audio-player-wrapper">
      <button class="audio-play-btn" @click="togglePlay">
        <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'" />
      </button>
      <div class="audio-time">{{ formattedTime }}</div>
      <input
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        v-model="currentTime"
        class="audio-slider"
        @input="seekAudio"
      />
      <!-- Botão eliminar só aparece se não for readonly -->
      <button
        v-if="!readonly"
        class="audio-trash-btn"
        @click="apagarAudio"
        title="Eliminar áudio"
      >
        <i class="fas fa-trash-alt"></i>
      </button>
      <audio
        ref="audioEl"
        :src="audio"
        @timeupdate="updateTime"
        @loadedmetadata="initAudio"
        @ended="isPlaying = false"
        hidden
      />
    </div>

    <div v-if="gravando" class="tempo-label">{{ segundos }}s</div>
  </div>
</template>


<script>
export default {
    name: 'AudioGravador',
    props: {
        audio: String,
        readonly: {
            type: Boolean,
            default: false
        },
    darkMode: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            gravando: false,
            mediaRecorder: null,
            chunks: [],
            tempoGravado: 0,
            tempoInterval: null,
            segundos: 0,
            isPlaying: false,
            currentTime: 0,
            duration: 0
        }
    },
    computed: {
        formattedTime() {
            const min = Math.floor(this.currentTime / 60).toString().padStart(1, '0')
            const sec = Math.floor(this.currentTime % 60).toString().padStart(2, '0')
            return `${min}:${sec}`
        }
    },
    methods: {
        async toggleGravacao() {
            if (this.gravando) {
                this.mediaRecorder.stop()
                this.gravando = false
                clearInterval(this.tempoInterval)
            } else {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                    this.mediaRecorder = new MediaRecorder(stream)
                    this.chunks = []
                    this.tempoGravado = 0
                    this.segundos = 0

                    this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data)
                    this.mediaRecorder.onstop = () => {
                        const blob = new Blob(this.chunks, { type: 'audio/webm' })
                        const reader = new FileReader()
                        reader.onloadend = () => {
                            this.$emit('update-audio', reader.result)
                        }
                        reader.readAsDataURL(blob)
                    }

                    this.mediaRecorder.start()
                    this.gravando = true

                    this.tempoInterval = setInterval(() => {
                        this.tempoGravado += 1
                        this.segundos += 1
                    }, 1000)

                } catch (e) {
                    alert('Permissão de microfone negada ou erro: ' + e)
                }
            }
        },
        apagarAudio() {
            this.$emit('update-audio', null)
            this.isPlaying = false
        },
        togglePlay() {
            const audio = this.$refs.audioEl
            if (!audio) return
            this.isPlaying = !this.isPlaying
            this.isPlaying ? audio.play() : audio.pause()
        },
        updateTime() {
            const audio = this.$refs.audioEl
            this.currentTime = audio.currentTime
        },
        seekAudio() {
            const audio = this.$refs.audioEl
            audio.currentTime = this.currentTime
        },
        initAudio() {
            const audio = this.$refs.audioEl
            this.duration = audio.duration
        }
    }
}
</script>

<style scoped>
.audio-clean-box {
    background-color: #112240;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.audio-controls {
    display: flex;
    justify-content: center;
    width: 100%;
}

.audio-mic-btn {
    background: #277aff;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 20px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    cursor: pointer;
    position: relative;
}

.audio-mic-btn.gravando {
    background: #d33;
    animation: pulse-mic 1.2s infinite;
}

.audio-dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ff3737;
    animation: blink-dot 0.8s infinite;
}

.gravacao-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #aad1ff;
    font-size: 14px;
    font-weight: 500;
}

.audio-player-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    flex-wrap: wrap;
}

.audio-play-btn,
.audio-trash-btn {
    background: transparent;
    border: none;
    color: #aad1ff;
    cursor: pointer;
    font-size: 18px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
}

.audio-play-btn:hover,
.audio-trash-btn:hover {
    background: #1a2e4a;
}

.audio-time {
    color: #ffffffcc;
    font-size: 14px;
    min-width: 40px;
    text-align: center;
}

.audio-slider {
    flex-grow: 1;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    background: #aad1ff40;
    outline: none;
}

.audio-slider::-webkit-slider-thumb {
    appearance: none;
    width: 10px;
    height: 10px;
    background: #aad1ff;
    border-radius: 50%;
    cursor: pointer;
}

.audio-slider::-moz-range-thumb {
    width: 10px;
    height: 10px;
    background: #aad1ff;
    border-radius: 50%;
    cursor: pointer;
}

.tempo-label {
    font-size: 12px;
    font-weight: 500;
    color: #aad1ff;
}

@keyframes blink-dot {
    from {
        opacity: 1;
    }

    to {
        opacity: 0.3;
    }
}

@keyframes pulse-mic {
    0% {
        box-shadow: 0 0 0 0 rgba(255, 55, 55, 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(255, 55, 55, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(255, 55, 55, 0);
    }
}
</style>
