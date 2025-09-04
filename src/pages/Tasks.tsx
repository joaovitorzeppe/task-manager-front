import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef, Row } from '@tanstack/react-table';
import DataTable from '../components/DataTable';
import { useAuth } from '../contexts/AuthContext';
import { deleteTask, fetchTasks } from '../services/tasks';
import { priorities, statuses, type Task } from '../types/task';
import { useNavigate } from 'react-router-dom';
import PencilIcon from '../assets/svgs/pencil-svgrepo-com.svg';
import TrashIcon from '../assets/svgs/trash-svgrepo-com.svg';

const Tasks: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(token as string),
    enabled: !!token,
  });

  const removeMutation = useMutation<void, Error, number>({
    mutationFn: (id) => deleteTask(token as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const columns = React.useMemo<ColumnDef<Task, unknown>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Título', accessorKey: 'title' },
      { header: 'Status', accessorKey: 'status', cell: ({row}) => statuses[row.original.status] },
      { header: 'Prioridade', accessorKey: 'priority', cell: ({row}) => priorities[row.original.priority] },
      { header: 'Entrega', accessorKey: 'dueDate', cell: ({ row }) => row.original.dueDate ? new Date(row.original.dueDate).toLocaleDateString() : '-', sortingFn: 'datetime' },
      { header: 'Projeto', accessorKey: 'project.name', cell: ({ row }) => row.original.project?.name ?? '-' },
      { header: 'Responsável', accessorKey: 'assignee.name', cell: ({ row }) => row.original.assignee?.name ?? '-' },
      {
        header: 'Ações',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }: { row: Row<Task> }) => (
          <div className="flex items-center gap-2">
            <button
              title="Editar"
              className="rounded p-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/dashboard/tasks/form/${row.original.id}`)}
            >
              <img src={PencilIcon} alt="Editar" className="h-5 w-5" />
            </button>
            <button
              title="Excluir"
              className="rounded p-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                if (confirm(`Deseja excluir a tarefa ${row.original.title}?`)) {
                  removeMutation.mutate(row.original.id);
                }
              }}
              disabled={removeMutation.isPending}
            >
              <img src={TrashIcon} alt="Excluir" className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    [user]
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
        {user?.role !== 'developer' ? (
          <button
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => navigate('/dashboard/tasks/form')}
          >
            Nova Tarefa
          </button>
        ) : null}
      </div>
      <DataTable columns={columns} data={data ?? []} emptyMessage="Nenhuma tarefa encontrada" />
    </div>
  );
};

export default Tasks;


