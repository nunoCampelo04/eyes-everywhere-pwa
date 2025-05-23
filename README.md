# EyesEverywhere PWA

**EyesEverywhere PWA** é uma aplicação web progressiva desenvolvida em Vue.js para facilitar a monitorização e gestão de auditorias, ocorrências e infraestruturas públicas. O projeto foi desenhado para ser usado em dispositivos móveis e desktop, com funcionamento offline, tornando a gestão de auditorias prática e acessível a qualquer equipa de campo.

## Funcionalidades Principais

- Listagem e detalhe de auditorias (a decorrer e concluídas)
- Adição de ficheiros e gravação de áudio diretamente na auditoria
- Atribuição de especialistas, prioridades e materiais
- Geolocalização integrada com Google Maps
- Gestão de ocorrências e infraestruturas de forma organizada
- Interface moderna e intuitiva
- Suporte offline/localStorage (funciona como PWA)
- Possibilidade de exportação/importação de dados

## Tecnologias Utilizadas

- **Vue.js 3** (Composition API)
- **Bootstrap** e **CSS customizado**
- **Google Maps JavaScript API**
- **LocalStorage** para persistência local dos dados
- **Progressive Web App** (PWA) – funcionamento offline

## Instalação e Arranque

```bash
# 1. Clonar o repositório
git clone https://github.com/teu-username/eyes-everywhere-pwa.git
cd eyes-everywhere-pwa

# 2. Instalar as dependências
npm install

# 3. Arrancar a aplicação
npm run serve
