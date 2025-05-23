<template>
    <div class="page">
        <div class="top-bar">
            <i class="fas fa-arrow-left" @click="$router.back()"></i>
            <h3>Mapa de Auditorias</h3>
        </div>
        <div id="map" class="map-container"></div>
        <NavBar />
    </div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader"
import NavBar from '../components/NavBar.vue'

export default {
    name: "MapaAuditorias",
    components: { NavBar },
    data() {
        return {
            mapa: null,
            auditorias: []
        }
    },
    mounted() {
        const armazenadas = JSON.parse(localStorage.getItem("auditorias") || "[]")
        const concluidas = JSON.parse(localStorage.getItem("auditoriasConcluidas") || "[]")
        this.auditorias = [...armazenadas, ...concluidas]

        const loader = new Loader({
            apiKey: "AIzaSyBdbfZcG0t6f5c3MI3RVA2Aj07IIdmkL9o",
            version: "weekly"
        })

        loader.load().then(() => {
            this.iniciarMapa()
        })
    },
    methods: {
        async iniciarMapa() {
            const map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 41.5454, lng: -8.4265 },
                zoom: 12,
                mapId: "DEMO_MAP_ID" // opcional
            })
            this.mapa = map

            // Ícones para os marcadores
            const iconeVerde = {
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            }

            const iconeAmarelo = {
                url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            }

            for (const auditoria of this.auditorias) {
                if (!auditoria.local) continue

                const endereco = encodeURIComponent(auditoria.local)
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${endereco}&format=json`)
                const dados = await response.json()
                if (dados.length === 0) continue

                const { lat, lon } = dados[0]

                // Verificar se a auditoria está concluída
                const auditoriasConcluidas = JSON.parse(localStorage.getItem('auditoriasConcluidas') || '[]')
                const isConcluida = auditoriasConcluidas.some(a => a.id === auditoria.id)

                const marcador = new google.maps.Marker({
                    position: { lat: parseFloat(lat), lng: parseFloat(lon) },
                    map,
                    title: auditoria.titulo,
                    icon: isConcluida ? iconeVerde : iconeAmarelo
                })

                const contentString = `
      <div style="color: black; padding: 5px;">
        <h3>${auditoria.titulo}</h3>
        <p><strong>Tipo:</strong> ${auditoria.tipo}</p>
        <p><strong>Localização:</strong> ${auditoria.local}</p>
      </div>
    `
                const info = new google.maps.InfoWindow({
                    content: contentString
                })

                marcador.addListener("click", () => {
                    info.open(map, marcador)
                })
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

.top-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 1rem;
}

.top-bar i {
    cursor: pointer;
}

.map-container {
    flex: 1;
    height: calc(100vh - 120px);
    width: 100%;
}
</style>
