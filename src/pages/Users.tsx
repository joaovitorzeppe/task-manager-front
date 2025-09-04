import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from '../components/DataTable';
import { useAuth } from '../contexts/AuthContext';
import { fetchUsers } from '../services/api';
import type { User } from '../types/user';

const Users: React.FC = () => {
  const { token } = useAuth();

  const { data, isLoading, isError, error } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: () => fetchUsers(token as string),
    enabled: !!token,
  });

  const columns = React.useMemo<ColumnDef<User, unknown>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Nome', accessorKey: 'name' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Papel', accessorKey: 'role', cell: ({row}) => row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1) },
    ],
    []
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
        <div className="text-sm text-gray-500">{data?.length ?? 0} usuários</div>
      </div>
      <DataTable columns={columns} data={data ?? []} emptyMessage="Nenhum usuário encontrado" />
    </div>
  );
};

export default Users;


