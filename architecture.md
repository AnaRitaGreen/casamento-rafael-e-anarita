🏗️ Arquitetura do Sistema

[ Frontend: Astro + React ] (Hospedado na Vercel)
          │
          ▼ (Chamadas de API seguras / HTTPS)
[ Backend API ] (Go)
          │
          ▼ (Conexão Segura / Docker)
[ Banco de Dados: PostgreSQL ]

1. Frontend: Astro + React
Páginas Públicas (Home): Renderizadas puramente em Astro (HTML estático super leve).
Formulários e Dashboard: Componentes React injetados usando a diretiva client:load do Astro, carregando JavaScript apenas quando e onde for necessário.

2. Backend (API)
Como o foco é performance: Abordagem Tradicional: Uma API minimalista em Go rodando em uma VPS.

3. Banco de Dados & Infraestrutura
PostgreSQL rodando em um container Docker na sua máquina de desenvolvimento e replicado em produção.

📂 Frontend - Estrutura de Páginas e Componentes

Estilizar com Tailwind

🌐 Área Pública (Convidados)
A página inicial precisa ser acolhedora e direta. A confirmação de presença (RSVP) usará uma busca inteligente.

Página Inicial (src/pages/index.astro):
Seção Hero: Foto do casal, contador regressivo e botão principal "Confirmar Presença".
História & Detalhes: Texto e fotos (HTML estático).
Componente RSVP (src/components/RSVPForm.jsx - Componente React):
O convidado digita o nome.
O componente faz uma busca na API e retorna o grupo familiar dele (ex: "Maria + 1 acompanhante").
Interface para selecionar quem vai, restrições alimentares e mensagem aos noivos.

🔒 Área Restrita (Dashboard dos Noivos)
Esta área precisa de autenticação simples e segura (ex: JWT ou Cookie baseado em senha forte).
Página de Login (src/pages/admin/login.astro)
Dashboard (src/pages/admin/dashboard.astro - Protegido por Middleware):
Métricas Rápidas: Total de convidados convidados vs. Confirmados vs. Recusados.
Gerenciador de Convidados (src/components/GuestList.jsx - React): Tabela com busca, paginação e opção de adicionar/editar/excluir convidados e definir quantos acompanhantes cada um tem direito.
Exportador: Botão para puxar a lista em formato CSV (útil para enviar ao cerimonial).