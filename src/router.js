import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import HomeView from './views/HomeView.vue'
import AuditoriasAdecorrer from './views/AuditoriasAdecorrer.vue'
import AuditoriasConcluidas from './views/AuditoriasConcluidas.vue'
import NovaAuditoria from './views/NovaAuditoria.vue'
import GerirEspecialistas from './views/GerirEspecialistas.vue'
import Mapa from './views/MapaAuditorias.vue'
import Pedidos from './views/Pedidos.vue'
import Perfil from './views/Perfil.vue'
import DetalheAuditoria from './views/DetalheAuditoria.vue'
import AuditoriaConcluidaDetalhe from './views/AuditoriaConcluidaDetalhe.vue'
import MapaAuditorias from './views/MapaAuditorias.vue'
import DetalheNovaAuditoria from './views/DetalheNovaAuditoria.vue'
import Definicoes from './views/Definicoes.vue'
import EspecialistaDashboard from './views/Especialista/EspecialistaDasboard.vue'
import EspecialistaHome from './views/Especialista/EspecialistaHome.vue'
import Home from './views/Especialista/Home.vue'
import Detalhe from './views/Especialista/Detalhe.vue'

const routes = [
  { path: '/', component: LoginView },
  { path: '/home', component: HomeView },
  { path: '/auditorias/adecorrer', component: AuditoriasAdecorrer },
  { path: '/auditorias/concluidas', component: AuditoriasConcluidas },
  { path: '/auditorias/nova', component: NovaAuditoria },
  { path: '/especialistas', component: GerirEspecialistas },
  { path: '/mapa', component: MapaAuditorias },
  { path: '/pedidos', component: Pedidos },
  { path: '/perfil', component: Perfil },
  { path: '/auditoria/:id', component: DetalheAuditoria },
  { path: '/auditoriasconcluidas/:id',component: AuditoriaConcluidaDetalhe },
  { path: '/aDecorrer', component: AuditoriasAdecorrer },
  { path: '/novas', component: NovaAuditoria },
  { path: '/auditoriasnovas/:id', component: DetalheNovaAuditoria },
  { path: '/definicoes', component: Definicoes },
  { path: '/especialista/dashboard', component: EspecialistaDashboard },
  {path: '/especialista/home', component: EspecialistaHome },
  {path: '/home/especialista', component: Home },
  {path:'/detalhe/especialista/:id', component: Detalhe }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
