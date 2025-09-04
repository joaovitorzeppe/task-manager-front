import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import InputField from '../components/InputField';
import Button from '../components/Button';
import FieldInfo from '../components/FieldInfo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, fetchUserById, updateUser } from '../services/users';
import { type User, type CreateUserPayload, type UpdateUserPayload } from '../types/user';

const UserForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: userData, isLoading: isFetchingUser } = useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(token as string, Number(id)),
    enabled: !!token && !!id,
  });

  const createMutation = useMutation<User, Error, CreateUserPayload>({
    mutationFn: (payload) => createUser(token as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/dashboard/users');
    },
  });

  const updateMutation = useMutation<User, Error, { id: number; payload: UpdateUserPayload }>({
    mutationFn: ({ id, payload }) => updateUser(token as string, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/dashboard/users');
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'developer' as User['role'],
    },
    onSubmit: ({ value }) => {
      if (isEdit) {
        const payload: UpdateUserPayload = {
          name: value.name,
          email: value.email,
          role: value.role,
          ...(value.password ? { password: value.password } : {}),
        };
        updateMutation.mutate({ id: Number(id), payload });
      } else {
        const payload: CreateUserPayload = {
          name: value.name,
          email: value.email,
          password: value.password,
          role: value.role,
        };
        createMutation.mutate(payload);
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
        email: z.email('Email deve ser válido').min(1, 'Email é obrigatório'),
        password: isEdit
          ? z.union([z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'), z.literal('')])
          : z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
        role: z.enum(['admin', 'manager', 'developer']),
      }),
    },
  });

  React.useEffect(() => {
    if (userData) {
      form.setFieldValue('name', userData.name);
      form.setFieldValue('email', userData.email);
      form.setFieldValue('role', userData.role);
    }
  }, [userData]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h1>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        {isFetchingUser && isEdit ? (
          <div>Carregando dados do usuário...</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="space-y-4">
            <form.Field name="name" children={(field) => (
              <>
                <InputField type="text" label="Nome" name="name" required={true} value={field.state.value} onChange={(value) => field.handleChange(value)} />
                <FieldInfo field={field} />
              </>
            )} />

            <form.Field name="email" children={(field) => (
              <>
                <InputField type="email" label="Email" name="email" required={true} value={field.state.value} onChange={(value) => field.handleChange(value)} />
                <FieldInfo field={field} />
              </>
            )} />

            <form.Field name="password" children={(field) => (
              <>
                <InputField type="password" label={isEdit ? 'Senha (opcional)' : 'Senha'} name="password" required={!isEdit} value={field.state.value ?? ''} onChange={(value) => field.handleChange(value)} />
                <FieldInfo field={field} />
              </>
            )} />

            <form.Field name="role" children={(field) => (
              <div>
                <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900">Papel</label>
                <select id="role" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={field.state.value} onChange={(e) => field.handleChange(e.target.value as User['role'])}>
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="developer">Desenvolvedor</option>
                </select>
                <FieldInfo field={field} />
              </div>
            )} />

            <div className="flex items-center gap-2">
              <Button label={isEdit ? 'Salvar' : 'Criar'} onClick={() => form.handleSubmit()} type="submit" disabled={isSubmitting} loading={isSubmitting} />
              <button type="button" className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => navigate('/dashboard/users')}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserForm;


