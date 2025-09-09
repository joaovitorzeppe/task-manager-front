import React, { useEffect, useState } from 'react';
import { DefaultEditor } from 'react-simple-wysiwyg';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import InputField from '../components/InputField';
import Button from '../components/Button';
import FieldInfo from '../components/FieldInfo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, fetchTaskById, updateTask, fetchTaskComments, createTaskComment } from '../services/tasks';
import { fetchProjects } from '../services/projects';
import { fetchUsers } from '../services/users';
import { type Task, type CreateTaskPayload, type UpdateTaskPayload, statuses, priorities, type TaskComment } from '../types/task';
import DOMPurify from 'dompurify';
import type { Project } from '../types/project';
import { type User, roles } from '../types/user';
import { listTaskAttachments, uploadTaskAttachment, listTaskCommentAttachments, uploadTaskCommentAttachment, toAbsoluteUrl, type Attachment, deleteTaskAttachment, deleteTaskCommentAttachment } from '../services/attachments';
import DownloadIcon from '../assets/svgs/download-svgrepo-com.svg';
import TrashIcon from '../assets/svgs/trash-svgrepo-com.svg';
import UploadButton from '../components/UploadButton';

const CommentAttachments: React.FC<{ taskId: number; commentId: number; token: string }> = ({ taskId, commentId, token }) => {
  const { data: commentAttachments = [], refetch } = useQuery<Attachment[], Error>({
    queryKey: ['task', taskId, 'comments', commentId, 'attachments'],
    queryFn: () => listTaskCommentAttachments(token, taskId, commentId),
    enabled: !!token && !!taskId && !!commentId,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <UploadButton
          accept='image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          onFile={async (file) => {
            await uploadTaskCommentAttachment(token, taskId, commentId, file);
            refetch();
          }}
        />
      </div>
      {(commentAttachments ?? []).length === 0 ? (
        <div className="text-xs text-gray-500">Sem anexos.</div>
      ) : (
        <ul className="space-y-1">
          {commentAttachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded border p-2">
              <span className="text-sm text-gray-800 truncate mr-3">{a.filename}</span>
              <div className="flex items-center gap-2">
                <a title="Baixar" href={toAbsoluteUrl(a.url)} target="_blank" rel="noreferrer" className="rounded p-1 hover:bg-gray-100">
                  <img src={DownloadIcon} alt="Baixar" className="h-5 w-5" />
                </a>
                <button title="Excluir" className="rounded p-1 hover:bg-gray-100" onClick={async () => {
                  if (!confirm('Excluir anexo?')) return;
                  await deleteTaskCommentAttachment(token, taskId, commentId, a.id);
                  refetch();
                }}>
                  <img src={TrashIcon} alt="Excluir" className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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

  const { data: commentsData, refetch: refetchComments, isFetching: isFetchingComments } = useQuery<TaskComment[], Error>({
    queryKey: ['task', id, 'comments'],
    queryFn: () => fetchTaskComments(token as string, Number(id)),
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

  const addCommentMutation = useMutation<TaskComment, Error, { id: number; content: string }>({
    mutationFn: ({ id, content }) => createTaskComment(token as string, id, content),
    onSuccess: () => {
      refetchComments();
      setNewComment('');
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
        title: z.string().min(2, 'Título é obrigatório').max(255, 'Título deve ter no máximo 255 caracteres'),
        description: z.string(),
        status: z.enum(['todo', 'in_progress', 'review', 'done']),
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        dueDate: z.string(),
        projectId: z.string().min(1, 'Projeto é obrigatório'),
        assigneeId: z.string(),
      }),
    },
  });

  const [newComment, setNewComment] = useState<string>('');

  useEffect(() => {
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

  const { data: taskAttachments = [], refetch: refetchTaskAttachments } = useQuery<Attachment[], Error>({
    queryKey: ['task', id, 'attachments'],
    queryFn: () => listTaskAttachments(token as string, Number(id)),
    enabled: !!token && !!id,
  });

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
              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Descrição</label>
                  <DefaultEditor value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
                <FieldInfo field={field} />
              </div>
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
      {isEdit && (
        <div className="rounded-lg bg-white p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Anexos da Tarefa</h2>
          <UploadButton
            accept='image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            onFile={async (file) => {
              await uploadTaskAttachment(token as string, Number(id), file);
              refetchTaskAttachments();
            }}
          />
          {(taskAttachments ?? []).length === 0 ? (
            <div className="text-sm text-gray-500">Nenhum anexo.</div>
          ) : (
            <ul className="space-y-2">
              {taskAttachments.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded border p-2">
                  <span className="text-sm text-gray-800 truncate mr-3">{a.filename}</span>
                  <div className="flex items-center gap-2">
                    <a title="Baixar" href={toAbsoluteUrl(a.url)} target="_blank" rel="noreferrer" className="rounded p-1 hover:bg-gray-100">
                      <img src={DownloadIcon} alt="Baixar" className="h-5 w-5" />
                    </a>
                    <button title="Excluir" className="rounded p-1 hover:bg-gray-100" onClick={async () => {
                      if (!confirm('Excluir anexo?')) return;
                      await deleteTaskAttachment(token as string, Number(id), a.id);
                      refetchTaskAttachments();
                    }}>
                      <img src={TrashIcon} alt="Excluir" className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h2 className="text-xl font-semibold text-gray-900">Comentários</h2>
          <div className="space-y-3">
            {isFetchingComments ? (
              <div>Carregando comentários...</div>
            ) : (
              (commentsData ?? []).length === 0 ? (
                <div className="text-sm text-gray-500">Sem comentários ainda.</div>
              ) : (
                <ul className="space-y-3">
                  {(commentsData ?? []).map((c) => (
                    <li key={c.id} className="border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">{c.author?.name ?? `Usuário #${c.authorId}`}</span>
                        <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="prose max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.content) }} />
                      <CommentAttachments taskId={Number(id)} commentId={c.id} token={token as string} />
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Novo comentário</label>
              <DefaultEditor value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              label={addCommentMutation.isPending ? 'Adicionando...' : 'Adicionar comentário'}
              onClick={() => addCommentMutation.mutate({ id: Number(id), content: newComment })}
              type="button"
              disabled={addCommentMutation.isPending || !newComment.trim()}
              loading={addCommentMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskForm;