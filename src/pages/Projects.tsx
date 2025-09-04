import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef, Row } from '@tanstack/react-table';
import DataTable from '../components/DataTable';
import { useAuth } from '../contexts/AuthContext';
import { fetchProjects, deleteProject } from '../services/projects';
import type { Project } from '../types/project';
import { useNavigate } from 'react-router-dom';
import PencilIcon from '../assets/svgs/pencil-svgrepo-com.svg';
import TrashIcon from '../assets/svgs/trash-svgrepo-com.svg';

const Projects: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(token as string),
    enabled: !!token,
  });

  const removeMutation = useMutation<void, Error, number>({
    mutationFn: (id) => deleteProject(token as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const columns = React.useMemo<ColumnDef<Project, unknown>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Nome', accessorKey: 'name' },
      { header: 'Status', accessorKey: 'status', cell: ({row}: {row: Row<Project>}) => {
          const s = row.original.status;
          const map: Record<Project['status'], string> = {
            planned: 'Planejado',
            active: 'Ativo',
            completed: 'Concluído',
            cancelled: 'Cancelado',
          };
          return map[s];
        }
      },
      { header: 'Início', accessorKey: 'startDate', cell: ({ row }: { row: Row<Project> }) => new Date(row.original.startDate).toLocaleDateString(), sortingFn: 'datetime' },
      { header: 'Término', accessorKey: 'endDate', cell: ({ row }: { row: Row<Project> }) => row.original.endDate ? new Date(row.original.endDate).toLocaleDateString() : '-', sortingFn: 'datetime' },
      { header: 'Gerente', accessorKey: 'manager.name', cell: ({ row }: { row: Row<Project> }) => row.original.manager?.name ?? '-' },
      user?.role !== 'developer' ? {
        header: 'Ações',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }: { row: Row<Project> }) => (
          <div className="flex items-center gap-2">
            <button
              title="Editar"
              className="rounded p-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/dashboard/projects/form/${row.original.id}`)}
            >
              <img src={PencilIcon} alt="Editar" className="h-5 w-5" />
            </button>
            <button
              title="Excluir"
              className="rounded p-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                if (confirm(`Deseja excluir o projeto ${row.original.name}?`)) {
                  removeMutation.mutate(row.original.id);
                }
              }}
              disabled={removeMutation.isPending}
            >
              <img src={TrashIcon} alt="Excluir" className="h-5 w-5" />
            </button>
          </div>
        ),
      } : null,
    ].filter(Boolean) as ColumnDef<Project, unknown>[],
    [user]
  );

  if (isLoading) {
    return <div className="rounded-lg bg-white p-6 shadow">Carregando projetos...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-white p-6 shadow text-red-600">
        Erro ao carregar projetos: {error?.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        {user?.role !== 'developer' ? (
          <button
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => navigate('/dashboard/projects/form')}
          >
            Novo Projeto
          </button>
        ) : null}
      </div>
      <DataTable columns={columns} data={data ?? []} emptyMessage="Nenhum projeto encontrado" />
    </div>
  );
};

export default Projects;


