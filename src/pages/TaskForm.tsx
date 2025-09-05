import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import InputField from '../components/InputField';
import Button from '../components/Button';
import FieldInfo from '../components/FieldInfo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, fetchTaskById, updateTask } from '../services/tasks';
import { fetchProjects } from '../services/projects';
import { fetchUsers } from '../services/users';
import { type Task, type CreateTaskPayload, type UpdateTaskPayload, statuses, priorities } from '../types/task';
import type { Project } from '../types/project';
import { type User, roles } from '../types/user';

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: taskData, isLoading: isFetchingTask } = useQuery<Task, Error>({
    queryKey: ['task', id],
    queryFn: () => fetchTaskById(token as string, Number(id)),
    enabled: !!token && !!id,
  });

  const { data: projectsData } = useQuery<Project[], Error>({
    queryKey: ['projects', 'options'],
    queryFn: () => fetchProjects(token as string),
    enabled: !!token,
  });

  const { data: usersData } = useQuery<User[], Error>({
    queryKey: ['users', 'assignees'],
    queryFn: () => fetchUsers(token as string),
    enabled: !!token,
  });

  const createMutation = useMutation<Task, Error, CreateTaskPayload>({
    mutationFn: (payload) => createTask(token as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/dashboard/tasks');
    },
  });

  const updateMutation = useMutation<Task, Error, { id: number; payload: UpdateTaskPayload }>({
    mutationFn: ({ id, payload }) => updateTask(token as string, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/dashboard/tasks');
    },
  });

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: 'todo' as Task['status'],
      priority: 'medium' as Task['priority'],
      dueDate: '',
      projectId: '',
      assigneeId: '',
    },
    onSubmit: ({ value }) => {
      const payloadBase: CreateTaskPayload = {
        title: value.title,
        description: value.description || undefined,
        status: value.status,
        priority: value.priority,
        dueDate: value.dueDate || undefined,
        projectId: Number(value.projectId),
        ...(value.assigneeId ? { assigneeId: Number(value.assigneeId) } : {}),
      };

      if (isEdit) {
        const payload: UpdateTaskPayload = { ...payloadBase };
        updateMutation.mutate({ id: Number(id), payload });
      } else {
        createMutation.mutate(payloadBase);
      }
    },
    validators: {
      onSubmit: z.object({
        title: z.string().min(2, 'Título é obrigatório'),
        description: z.string(),
        status: z.enum(['todo', 'in_progress', 'review', 'done']),
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        dueDate: z.string(),
        projectId: z.string().min(1, 'Projeto é obrigatório'),
        assigneeId: z.string(),
      }),
    },
  });

  React.useEffect(() => {
    if (taskData) {
      form.setFieldValue('title', taskData.title);
      form.setFieldValue('description', taskData.description ?? '');
      form.setFieldValue('status', taskData.status);
      form.setFieldValue('priority', taskData.priority);
      form.setFieldValue('dueDate', taskData.dueDate ? new Date(taskData.dueDate).toISOString().slice(0, 10) : '');
      form.setFieldValue('projectId', String(taskData.projectId));
      form.setFieldValue('assigneeId', taskData.assigneeId ? String(taskData.assigneeId) : '');
    }
  }, [taskData]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h1>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        {isFetchingTask && isEdit ? (
          <div>Carregando dados da tarefa...</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="space-y-4">
            <form.Field name="title" children={(field) => (
              <>
                <InputField type="text" label="Título" name="title" required={true} value={field.state.value} onChange={(value) => field.handleChange(value)} />
                <FieldInfo field={field} />
              </>
            )} />

            <form.Field name="description" children={(field) => (
              <>
                <InputField type="text" label="Descrição" name="description" required={false} value={field.state.value ?? ''} onChange={(value) => field.handleChange(value)} />
                <FieldInfo field={field} />
              </>
            )} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field name="status" children={(field) => (
                <div>
                  <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
                  <select id="status" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={field.state.value} onChange={(e) => field.handleChange(e.target.value as Task['status'])}>
                    {Object.entries(statuses).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  <FieldInfo field={field} />
                </div>
              )} />

              <form.Field name="priority" children={(field) => (
                <div>
                  <label htmlFor="priority" className="block mb-2 text-sm font-medium text-gray-900">Prioridade</label>
                  <select id="priority" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={field.state.value} onChange={(e) => field.handleChange(e.target.value as Task['priority'])}>
                    {Object.entries(priorities).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  <FieldInfo field={field} />
                </div>
              )} />

              <form.Field name="dueDate" children={(field) => (
                <>
                  <InputField type="date" label="Entrega" name="dueDate" required={false} value={field.state.value ?? ''} onChange={(value) => field.handleChange(value)} />
                  <FieldInfo field={field} />
                </>
              )} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="projectId" children={(field) => (
                <div>
                  <label htmlFor="projectId" className="block mb-2 text-sm font-medium text-gray-900">Projeto</label>
                  <select id="projectId" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={String(field.state.value ?? '')} onChange={(e) => field.handleChange(e.target.value)}>
                    <option value="">Selecione...</option>
                    {(projectsData ?? []).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <FieldInfo field={field} />
                </div>
              )} />

              <form.Field name="assigneeId" children={(field) => (
                <div>
                  <label htmlFor="assigneeId" className="block mb-2 text-sm font-medium text-gray-900">Responsável (opcional)</label>
                  <select id="assigneeId" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={String(field.state.value ?? '')} onChange={(e) => field.handleChange(e.target.value)}>
                    <option value="">Sem responsável</option>
                    {(usersData ?? []).map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({roles[u.role]})</option>
                    ))}
                  </select>
                  <FieldInfo field={field} />
                </div>
              )} />
            </div>

            <div className="flex items-center gap-2">
              <Button label={isEdit ? 'Salvar' : 'Criar'} onClick={() => form.handleSubmit()} type="submit" disabled={isSubmitting} loading={isSubmitting} />
              <button type="button" className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => navigate('/dashboard/tasks')}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TaskForm;


