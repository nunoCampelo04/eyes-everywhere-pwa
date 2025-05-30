<template>
  <div class="app-wrapper">
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App',
  mounted() {
    this.importarDadosModelo()
  },
  methods: {
    importarDadosModelo() {
      const auditoriasDecorrer = [
        {
          id: 1,
          titulo: "Auditoria a Sinal de Trânsito",
          tipo: "Infraestrutura",
          data: new Date().toISOString(),
          local: "Rua das Oliveiras, Porto",
          descricao: "Verificação do sinal caído e obstrução do passeio.",
          documentos: "RelatórioSinal.pdf",
          prioridade: "Alta",
          especialistas: ["João Silva"],
          materiais: "Sinal novo, ferramentas de fixação",
          origem: "Reclamação por app"
        },
        {
          id: 2,
          titulo: "Auditoria de Passadeira",
          tipo: "Segurança Rodoviária",
          data: new Date(new Date().getTime() - 86400000 * 2).toISOString(), // 2 dias atrás
          local: "Rua do Comércio, Braga",
          descricao: "Verificação da pintura da passadeira e visibilidade.",
          documentos: "",
          prioridade: "Média",
          especialistas: ["Marta Lopes"],
          materiais: "Tinta, fita refletora",
          origem: "Pedido da Câmara"
        },
        {
          id: 3,
          titulo: "Auditoria de Iluminação Pública",
          tipo: "Infraestrutura Urbana",
          data: new Date(new Date().getTime() - 86400000 * 5).toISOString(), // 5 dias atrás
          local: "Avenida dos Aliados, Porto",
          descricao: "Revisão do sistema de iluminação após reclamações.",
          documentos: "RelatórioIluminação.pdf",
          prioridade: "Alta",
          especialistas: ["Ana Costa"],
          materiais: "Equipamento elétrico, medidor de tensão",
          origem: "Reclamação Cidadão"
        }
      ]

      const auditoriasConcluidas = [
        {
          id: 101,
          titulo: "Inspeção de Passadeira",
          tipo: "Segurança Rodoviária",
          data: "2025-05-10T23:06:41.769137",
          local: "Rua de São Lázaro, Braga",
          descricao: "Verificação da visibilidade da passadeira e necessidade de repintura.",
          documentos: "Relatório_2024_Passadeira.pdf",
          prioridade: "Média",
          especialistas: ["João Silva", "Marta Lopes"],
          materiais: "Tinta, Sinalização Temporária",
          origem: "Reclamação Cidadão"
        },
        {
          id: 102,
          titulo: "Verificação de Iluminação Pública",
          tipo: "Infraestrutura Urbana",
          data: "2025-05-13T23:06:41.769153",
          local: "Avenida Central, Guimarães",
          descricao: "Auditoria para validar reparações após apagões constantes.",
          documentos: "CheckList_Luzes_Avenida.pdf",
          prioridade: "Alta",
          especialistas: ["Ana Costa"],
          materiais: "Equipamentos de Medição de Tensão",
          origem: "Pedido da Câmara Municipal"
        },
        {
          id: 103,
          titulo: "Inspeção de Calçada",
          tipo: "Infraestrutura Urbana",
          data: "2025-04-20T10:30:00.000Z",
          local: "Rua das Flores, Braga",
          descricao: "Verificação de calçada danificada e segurança do pedestre.",
          documentos: "",
          prioridade: "Baixa",
          especialistas: ["João Silva"],
          materiais: "Ferramentas de reparo",
          origem: "Reclamação Cidadão"
        }
      ]

      const auditoriasNovas = [
        {
          id: 201,
          titulo: "Queda de Árvore",
          tipo: "Infraestrutura",
          data: new Date().toISOString(),
          local: "Parque da Cidade, Porto",
          descricao: "Árvore caída obstruindo passeio público.",
          documentos: "",
          prioridade: "Alta",
          especialistas: [],
          materiais: "",
          origem: "Reclamação por app"
        },
        {
          id: 202,
          titulo: "Buraco na Rua",
          tipo: "Infraestrutura",
          data: new Date().toISOString(),
          local: "Rua da Liberdade, Braga",
          descricao: "Buraco grande no meio da via causando riscos.",
          documentos: "",
          prioridade: "Média",
          especialistas: [],
          materiais: "",
          origem: "Reclamação Cidadão"
        },
        {
          id: 203,
          titulo: "Falta de Sinalização",
          tipo: "Segurança Rodoviária",
          data: new Date().toISOString(),
          local: "Rotunda Central, Guimarães",
          descricao: "Sinalização apagada ou inexistente na rotunda.",
          documentos: "",
          prioridade: "Alta",
          especialistas: [],
          materiais: "",
          origem: "Pedido da Câmara"
        }
      ]

      const especialistas = [
        {
          id: 1,
          nome: "João Silva",
          email: "joao.silva@especialista.com",
          password: "123456",
          telefone: "912345678",
          morada: "Rua das Flores, 123, Braga",
          dataNascimento: "1985-03-15",
          especialidade: "Infraestruturas",
          localidade: "Braga",
          avatar: "joao.jpg"
        },
        {
          id: 2,
          nome: "Marta Lopes",
          email: "marta.lopes@especialista.com",
          password: "123456",
          telefone: "923456789",
          morada: "Avenida Central, 456, Guimarães",
          dataNascimento: "1990-07-22",
          especialidade: "Segurança Rodoviária",
          localidade: "Guimarães",
          imagem: "marta.jpg"
        },
        {
          id: 3,
          nome: "Ana Costa",
          email: "ana.costa@especialista.com",
          password: "123456",
          telefone: "934567890",
          morada: "Praça da República, 789, Porto",
          dataNascimento: "1988-11-08",
          especialidade: "Iluminação Pública",
          localidade: "Porto",
          imagem: "ana.jpg"
        }
      ]

      const utilizadores = [
        {
          id: 1,
          email: "nuno@mail.com",
          password: "1234",
          name: "Nuno Campelo",
          avatar: "nuno.jpg",
          numero: "912345678",
          local: "Rua do Sol, 45, Porto",
        },
        {
          id: 2,
          email: "ana@mail.com",
          password: "abcd",
          name: "Ana Silva",
          avatar: "user-icon.png"
        }
      ]

      localStorage.setItem('utilizadores', JSON.stringify(utilizadores))
      localStorage.setItem('auditorias', JSON.stringify(auditoriasDecorrer))
      localStorage.setItem('auditoriasConcluidas', JSON.stringify(auditoriasConcluidas))
      localStorage.setItem('auditoriasNovas', JSON.stringify(auditoriasNovas))
      localStorage.setItem('especialistas', JSON.stringify(especialistas))
    }
  }
}
</script>

<style>
.app-wrapper {
  height: 100dvh;
  min-height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #0C1425;
  color: #DCE4F7;
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;

  overflow: hidden;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
