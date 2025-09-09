# Frontend Optidata (React + TypeScript + Vite)

Aplicação frontend em React com Vite, TanStack Query, TanStack Table e Tailwind.

## Rodando localmente

```bash
cd front
npm install
npm run dev
```

Variáveis de ambiente:

- `VITE_API_URL` (ex.: `http://localhost:8080`)

## Funcionalidades

- Autenticação com Context API
- Kanban com DnD
- Dashboard de gráficos (Chart.js) com filtros de projeto e data
- Atualização em tempo real (Socket.IO) invalidando queries
- Upload e download de anexos (projeto, tarefa, comentário)

## Estrutura de pastas

- `src/pages`: telas (Tasks, Projects, Users, Kanban, Charts, Forms)
- `src/components`: componentes compartilhados (`UploadButton`, `DataTable` etc.)
- `src/services`: comunicação com a API (`api.ts`, `attachments.ts` etc.)
