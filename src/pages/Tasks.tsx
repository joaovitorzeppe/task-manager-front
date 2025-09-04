import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from '../components/DataTable';
import { useAuth } from '../contexts/AuthContext';
import { fetchTasks } from '../services/api';
import type { Task } from '../types/task';

const Tasks: React.FC = () => {
  const { token } = useAuth();

  const { data, isLoading, isError, error } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(token as string),
    enabled: !!token,
  });

  const columns = React.useMemo<ColumnDef<Task, unknown>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Título', accessorKey: 'title' },
      { header: 'Status', accessorKey: 'status', cell: ({row}) => {
          const s = row.original.status;
          const map: Record<Task['status'], string> = {
            todo: 'A Fazer',
            in_progress: 'Em Progresso',
            review: 'Revisão',
            done: 'Concluída',
          };
          return map[s];
        }
      },
      { header: 'Prioridade', accessorKey: 'priority', cell: ({row}) => {
          const p = row.original.priority;
          const map: Record<Task['priority'], string> = {
            low: 'Baixa',
            medium: 'Média',
            high: 'Alta',
            critical: 'Crítica',
          };
          return map[p];
        }
      },
      { header: 'Entrega', accessorKey: 'dueDate', cell: ({ row }) => row.original.dueDate ? new Date(row.original.dueDate).toLocaleDateString() : '-' },
      { header: 'Projeto', accessorKey: 'project.name', cell: ({ row }) => row.original.project?.name ?? '-' },
      { header: 'Responsável', accessorKey: 'assignee.name', cell: ({ row }) => row.original.assignee?.name ?? '-' },
    ],
    []
  );

  if (isLoading) {
    return <div className="rounded-lg bg-white p-6 shadow">Carregando tarefas...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-white p-6 shadow text-red-600">
        Erro ao carregar tarefas: {error?.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
      </div>
      <DataTable columns={columns} data={data ?? []} emptyMessage="Nenhuma tarefa encontrada" />
    </div>
  );
};

export default Tasks;


