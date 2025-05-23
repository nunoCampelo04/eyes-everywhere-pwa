<template>
  <div class="page">
    <div class="content">
      <input type="text" v-model="pesquisa" placeholder="🔍 Procurar..." class="search" />

      <h2>Ocorrências Novas</h2>
      <img src="../assets/auditoria-header.png" alt="Auditorias" class="header-img" />

      <div class="auditorias-list">
        <div class="card" v-for="aud in auditoriasFiltradas" :key="aud.id" @click="$router.push(`/auditoriasnovas/${aud.id}`)"
>
          <div class="data">
            <span class="dia">{{ formatarData(aud.data).dia }}</span>
            <span class="mes">{{ formatarData(aud.data).mes }}</span>
          </div>
          <div class="conteudo">
            <h3>{{ aud.titulo }}</h3>
            <p><strong>Horário:</strong> {{ formatarHora(aud.data) }}</p>
            <p><strong>Localização:</strong> {{ aud.local || '---' }}</p>
            <span class="tipo">{{ aud.tipo }}</span>
          </div>
          <i class="fas fa-chevron-right seta"></i>
        </div>
      </div>
    </div>
    <NavBar />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'

export default {
  name: 'OcorrenciasNovas',
  components: { NavBar },
  data() {
    return {
      auditorias: [],
      pesquisa: ''
    }
  },
  computed: {
    auditoriasFiltradas() {
      return this.auditorias.filter((a) =>
        a.titulo.toLowerCase().includes(this.pesquisa.toLowerCase())
      )
    }
  },
  mounted() {
    const armazenadas = localStorage.getItem('auditoriasNovas')
    let lista = armazenadas ? JSON.parse(armazenadas) : []

    if (!lista.length) {
      lista = [
        {
          id: 1,
          titulo: "Inspeção de Sinalização",
          tipo: "Segurança Rodoviária",
          data: new Date().toISOString(),
          local: "Rua de Santo António, Braga",
          descricao: "Verificar placas e marcações no cruzamento.",
          documentos: "",
          prioridade: "Alta",
          especialistas: [],
          materiais: "",
          origem: "Pedido da Câmara"
        }
      ]
      localStorage.setItem('auditorias', JSON.stringify(lista))
    }

    this.auditorias = lista
  },
  methods: {
    formatarData(dataStr) {
      const data = new Date(dataStr)
      const dia = data.getDate().toString().padStart(2, '0')
      const mes = data.toLocaleString('pt-PT', { month: 'short' }).toUpperCase()
      return { dia, mes }
    },
    formatarHora(dataStr) {
      const data = new Date(dataStr)
      return `${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`
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

.content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.search {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  margin: 16px 0;
  font-size: 14px;
  background-color: #ffffff;
  color: #333;
}

h2 {
  font-size: 18px;
  margin: 0 0 0.5rem 0;
}

.header-img {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.auditorias-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
}

.card {
  background-color: #1c2e4a;
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  position: relative;
  min-height: 80px;
}

.data {
  background-color: #277aff;
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.dia {
  font-size: 16px;
  line-height: 1;
}

.mes {
  font-size: 10px;
  text-transform: uppercase;
  margin-top: 2px;
}

.conteudo {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.conteudo h3 {
  margin: 0 0 4px;
  font-size: 15px;
  color: white;
}

.conteudo p {
  margin: 2px 0;
  font-size: 13px;
  color: #dce4f7;
}

.tipo {
  font-size: 11px;
  background-color: #0f203f;
  padding: 3px 10px;
  border-radius: 8px;
  display: inline-block;
  margin-top: 6px;
  width: fit-content;
  font-weight: 500;
  color: white;
}

.seta {
  color: white;
  font-size: 16px;
  margin-left: auto;
  align-self: center;
}
</style>
