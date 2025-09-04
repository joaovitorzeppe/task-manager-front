import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from '../components/DataTable';
import { useAuth } from '../contexts/AuthContext';
import { fetchProjects } from '../services/projects';
import type { Project } from '../types/project';

const Projects: React.FC = () => {
  const { token } = useAuth();

  const { data, isLoading, isError, error } = useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(token as string),
    enabled: !!token,
  });

  const columns = React.useMemo<ColumnDef<Project, unknown>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Nome', accessorKey: 'name' },
      { header: 'Status', accessorKey: 'status', cell: ({row}) => {
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
      { header: 'Início', accessorKey: 'startDate', cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(), sortingFn: 'datetime' },
      { header: 'Término', accessorKey: 'endDate', cell: ({ row }) => row.original.endDate ? new Date(row.original.endDate).toLocaleDateString() : '-', sortingFn: 'datetime' },
      { header: 'Gerente', accessorKey: 'manager.name', cell: ({ row }) => row.original.manager?.name ?? '-' },
    ],
    []
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
      </div>
      <DataTable columns={columns} data={data ?? []} emptyMessage="Nenhum projeto encontrado" />
    </div>
  );
};

export default Projects;


