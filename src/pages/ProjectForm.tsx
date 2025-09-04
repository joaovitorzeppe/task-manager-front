import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import InputField from '../components/InputField';
import Button from '../components/Button';
import FieldInfo from '../components/FieldInfo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProject, fetchProjectById, updateProject } from '../services/projects';
import { fetchUsers } from '../services/users';
import { statuses, type Project, type CreateProjectPayload, type UpdateProjectPayload } from '../types/project';
import { type User, roles } from '../types/user';

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: projectData, isLoading: isFetchingProject } = useQuery<Project, Error>({
    queryKey: ['project', id],
    queryFn: () => fetchProjectById(token as string, Number(id)),
    enabled: !!token && !!id,
  });

  const { data: usersData } = useQuery<User[], Error>({
    queryKey: ['users', 'managers'],
    queryFn: () => fetchUsers(token as string),
    enabled: !!token,
  });

  const managers = (usersData ?? []).filter((u) => ['admin', 'manager'].includes(u.role));

  const createMutation = useMutation<Project, Error, CreateProjectPayload>({
    mutationFn: (payload) => createProject(token as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/dashboard/projects');
    },
  });

  const updateMutation = useMutation<Project, Error, { id: number; payload: UpdateProjectPayload }>({
    mutationFn: ({ id, payload }) => updateProject(token as string, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/dashboard/projects');
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      status: 'planned' as Project['status'],
      startDate: '',
      endDate: '',
      managerId: '',
    },
    onSubmit: ({ value }) => {
      const payloadBase = {
        name: value.name,
        description: value.description || undefined,
        status: value.status,
        startDate: value.startDate,
        endDate: value.endDate || undefined,
        managerId: Number(value.managerId),
      } as CreateProjectPayload;

      if (isEdit) {
        const payload: UpdateProjectPayload = { ...payloadBase };
        updateMutation.mutate({ id: Number(id), payload });
      } else {
        createMutation.mutate(payloadBase);
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, 'Nome é obrigatório'),
        description: z.string(),
        status: z.enum(['planned', 'active', 'completed', 'cancelled']),
        startDate: z.string().min(1, 'Data de início é obrigatória'),
        endDate: z.string(),
        managerId: z.string().min(1, 'Gerente é obrigatório'),
      }),
    },
  });

  React.useEffect(() => {
    if (projectData) {
      form.setFieldValue('name', projectData.name);
      form.setFieldValue('description', projectData.description ?? '');
      form.setFieldValue('status', projectData.status);
      form.setFieldValue('startDate', projectData.startDate ? new Date(projectData.startDate).toISOString().slice(0, 10) : '');
      form.setFieldValue('endDate', projectData.endDate ? new Date(projectData.endDate).toISOString().slice(0, 10) : '');
      form.setFieldValue('managerId', String(projectData.managerId));
    }
  }, [projectData]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</h1>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        {isFetchingProject && isEdit ? (
          <div>Carregando dados do projeto...</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="space-y-4">
            <form.Field name="name" children={(field) => (
              <>
                <InputField type="text" label="Nome" name="name" required={true} value={field.state.value} onChange={(value) => field.handleChange(value)} />
                <FieldInfo field={field} />
              </>
            )} />

            <form.Field name="description" children={(field) => (
              <>
                <InputField type="text" label="Descrição" name="description" required={false} value={field.state.value ?? ''} onChange={(value) => field.handleChange(value)} />
                <FieldInfo field={field} />
              </>
            )} />

            <form.Field name="status" children={(field) => (
              <div>
                <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
                <select id="status" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={field.state.value} onChange={(e) => field.handleChange(e.target.value as Project['status'])}>
                  <option value="planned">{statuses.planned}</option>
                  <option value="active">{statuses.active}</option>
                  <option value="completed">{statuses.completed}</option>
                  <option value="cancelled">{statuses.cancelled}</option>
                </select>
                <FieldInfo field={field} />
              </div>
            )} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="startDate" children={(field) => (
                <>
                  <InputField type="date" label="Início" name="startDate" required={true} value={field.state.value} onChange={(value) => field.handleChange(value)} />
                  <FieldInfo field={field} />
                </>
              )} />
              <form.Field name="endDate" children={(field) => (
                <>
                  <InputField type="date" label="Término" name="endDate" required={false} value={field.state.value ?? ''} onChange={(value) => field.handleChange(value)} />
                  <FieldInfo field={field} />
                </>
              )} />
            </div>

            <form.Field name="managerId" children={(field) => (
              <div>
                <label htmlFor="managerId" className="block mb-2 text-sm font-medium text-gray-900">Gerente</label>
                <select id="managerId" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={String(field.state.value ?? '')} onChange={(e) => field.handleChange(e.target.value)}>
                  <option value="">Selecione...</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({roles[m.role]})</option>
                  ))}
                </select>
                <FieldInfo field={field} />
              </div>
            )} />

            <div className="flex items-center gap-2">
              <Button label={isEdit ? 'Salvar' : 'Criar'} onClick={() => form.handleSubmit()} type="submit" disabled={isSubmitting} loading={isSubmitting} />
              <button type="button" className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => navigate('/dashboard/projects')}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProjectForm;


