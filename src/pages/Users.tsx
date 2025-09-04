import React, { useMemo} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef, Row } from '@tanstack/react-table';
import DataTable from '../components/DataTable';
import { useAuth } from '../contexts/AuthContext';
import { fetchUsers, deleteUser } from '../services/users';
import type { User } from '../types/user';
import { useNavigate } from 'react-router-dom';
import PencilIcon from '../assets/svgs/pencil-svgrepo-com.svg';
import TrashIcon from '../assets/svgs/trash-svgrepo-com.svg';

const Users: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const removeMutation = useMutation<void, Error, number>({
    mutationFn: (id) => deleteUser(token as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const { data, isLoading, isError, error } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: () => fetchUsers(token as string),
    enabled: !!token,
  });

  const columns = useMemo<ColumnDef<User, unknown>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Nome', accessorKey: 'name' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Papel', accessorKey: 'role', cell: ({row}: {row: Row<User>}) => {
        const s = row.original.role;
          const map: Record<User['role'], string> = {
            admin: 'Administrador',
            manager: 'Gerente',
            developer: 'Desenvolvedor',
          };
          return map[s as User['role']];
      } },
      user?.role === 'admin' ? {
        header: 'Ações',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }: { row: Row<User> }) => (
          <div className="flex items-center gap-2">
            <button
              title="Editar"
              className="rounded p-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/dashboard/users/form/${row.original.id}`)}
            >
              <img src={PencilIcon} alt="Editar" className="h-5 w-5" />
            </button>
            <button
              title="Excluir"
              className="rounded p-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                if (confirm(`Deseja excluir o usuário ${row.original.name}?`)) {
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
    ].filter(Boolean) as ColumnDef<User, unknown>[],
    [user]
  );

  if (isLoading) {
    return <div className="rounded-lg bg-white p-6 shadow">Carregando usuários...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-white p-6 shadow text-red-600">
        Erro ao carregar usuários: {error?.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <button
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => navigate('/dashboard/users/form')}
        >
          Novo Usuário
        </button>
      </div>
      <DataTable columns={columns} data={data ?? []} emptyMessage="Nenhum usuário encontrado" />
    </div>
  );
};

export default Users;


