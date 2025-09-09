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
import { createProject, fetchProjectById, updateProject } from '../services/projects';
import { fetchUsers } from '../services/users';
import { statuses, type Project, type CreateProjectPayload, type UpdateProjectPayload } from '../types/project';
import { type User, roles } from '../types/user';
import { listProjectAttachments, uploadProjectAttachment, toAbsoluteUrl, type Attachment, deleteProjectAttachment } from '../services/attachments';
import DownloadIcon from '../assets/svgs/download-svgrepo-com.svg';
import TrashIcon from '../assets/svgs/trash-svgrepo-com.svg';
import UploadButton from '../components/UploadButton';
import dayjs from 'dayjs';

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

  const [members, setMembers] = useState<Array<{ userId: number; role: 'viewer' | 'contributor' | 'maintainer'; manager?: boolean }>>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');

  const addSelectedMember = () => {
    if (!selectedToAdd) return;
    const userId = Number(selectedToAdd);
    setMembers((prev) => (prev.find((m) => m.userId === userId) ? prev : [...prev, { userId, role: 'contributor' }]));
    setSelectedToAdd('');
  };

  const createMutation = useMutation<Project, Error, CreateProjectPayload>({
    mutationFn: (payload) => createProject(token as string, payload),
    mutationKey: ['project', 'create'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/dashboard/projects');
    },
  });

  const updateMutation = useMutation<Project, Error, { id: number; payload: UpdateProjectPayload }>({
    mutationFn: ({ id, payload }) => updateProject(token as string, id, payload),
    mutationKey: ['project', 'update'],
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
        members: members.length > 0 ? members.map((m) => ({ userId: m.userId, role: m.role })) : undefined,
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
        name: z.string().min(2, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
        description: z.string(),
        status: z.enum(['planned', 'active', 'completed', 'cancelled']),
        startDate: z.string().min(1, 'Data de início é obrigatória'),
        endDate: z.string(),
        managerId: z.string().min(1, 'Gerente é obrigatório'),
      }),
    }
  });

  const changeRole = (userId: number, role: 'viewer' | 'contributor' | 'maintainer') => {
    setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, role } : m)));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const { data: attachments = [], refetch: refetchAttachments } = useQuery<Attachment[], Error>({
    queryKey: ['project', id, 'attachments'],
    queryFn: () => listProjectAttachments(token as string, Number(id)),
    enabled: !!token && !!id,
  });

  useEffect(() => {
    if (!projectData) return;

    form.setFieldValue('name', projectData.name);
    form.setFieldValue('description', projectData.description ?? '');
    form.setFieldValue('status', projectData.status);
    form.setFieldValue('startDate', dayjs(projectData.startDate).format('YYYY-MM-DD'));
    form.setFieldValue('endDate', projectData.endDate ? dayjs(projectData.endDate).format('YYYY-MM-DD') : '');
    form.setFieldValue('managerId', String(projectData.managerId));

    if (projectData.members) {
      setMembers(projectData.members.map((m) => ({ userId: m.userId, role: m.role })));
    }
  }, [projectData]);

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
              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Descrição</label>
                <DefaultEditor value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
                <FieldInfo field={field} />
              </div>
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
                <select
                  id="managerId"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={String(field.state.value ?? '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.handleChange(val);
                    const newManagerId = Number(val);
                    if (newManagerId) {
                      setMembers((prev) => {
                        const exists = prev.find((m) => m.userId === newManagerId);
                        const oldManager = prev.find((m) => m.manager);
                        if (exists) {
                          if (oldManager && oldManager?.userId !== newManagerId) {
                            prev = prev.map((m) => (m.userId === oldManager.userId ? { ...m, role: 'contributor', manager: false } : m));
                          }
                          if (exists.role !== 'maintainer') {
                            return prev.map((m) => (m.userId === newManagerId ? { ...m, role: 'maintainer', manager: true } : m));
                          }
                          return prev;
                        }
                        if (oldManager && oldManager?.userId !== newManagerId) {
                          prev = prev.map((m) => (m.userId === oldManager.userId ? { ...m, role: 'contributor', manager: false } : m));
                        }
                        return [...prev, { userId: newManagerId, role: 'maintainer', manager: true }];
                      });
                    } else {
                      setMembers((prev) => prev.filter((m) => !m.manager));
                    }
                  }}
                >
                  <option value="">Selecione...</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({roles[m.role]})</option>
                  ))}
                </select>
                <FieldInfo field={field} />
              </div>
            )} />

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Adicionar membro</label>
              <div className="flex items-center gap-2">
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
                  value={selectedToAdd}
                  onChange={(e) => setSelectedToAdd(e.target.value)}
                >
                  <option value="">Selecione usuário...</option>
                  {(usersData ?? [])
                    .filter((u) => !members.find((m) => m.userId === u.id))
                    .filter((u) => String(u.id) !== String(form.state.values.managerId ?? ''))
                    .map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({roles[u.role]})</option>
                    ))}
                </select>
                <Button label="Adicionar" onClick={addSelectedMember} type="button" disabled={false} loading={false} />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Membros selecionados</label>
              <div className="space-y-2">
                {members.map((m) => {
                  const user = (usersData ?? []).find((u) => u.id === m.userId);
                  const isManagerMember = String(m.userId) === String(form.state.values.managerId ?? '');
                  return (
                    <div key={m.userId} className="flex items-center gap-3">
                      <span className="flex-1 text-sm text-gray-900">{user ? `${user.name} (${roles[user.role]})` : `Usuário #${m.userId}`}</span>
                      <select
                        disabled={isManagerMember}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-1"
                        value={m.role}
                        onChange={(e) => changeRole(m.userId, e.target.value as any)}
                      >
                        <option value="viewer">Visualizador</option>
                        <option value="contributor">Contribuidor</option>
                        <option value="maintainer">Mantenedor</option>
                      </select>
                      {!isManagerMember && (
                        <button
                          type="button"
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          onClick={() => setMembers((prev) => prev.filter((x) => x.userId !== m.userId))}
                        >
                          Remover
                        </button>
                      )}
                      {isManagerMember && (
                        <span className="text-xs text-gray-500">Gerente (fixo)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button label={isEdit ? 'Salvar' : 'Criar'} onClick={() => form.handleSubmit()} type="submit" disabled={isSubmitting} loading={isSubmitting} />
              <button type="button" className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => navigate('/dashboard/projects')}>Cancelar</button>
            </div>
          </form>
        )}
      </div>

      {isEdit && (
        <div className="rounded-lg bg-white p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Anexos</h2>
          <UploadButton
            accept='image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            onFile={async (file) => {
              await uploadProjectAttachment(token as string, Number(id), file);
              refetchAttachments();
            }}
          />
          {(attachments ?? []).length === 0 ? (
            <div className="text-sm text-gray-500">Nenhum anexo enviado.</div>
          ) : (
            <ul className="space-y-2">
              {attachments.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded border p-2">
                  <span className="text-sm text-gray-800 truncate mr-3">{a.filename}</span>
                  <div className="flex items-center gap-2">
                    <a title="Baixar" href={toAbsoluteUrl(a.url)} target="_blank" rel="noreferrer" className="rounded p-1 hover:bg-gray-100">
                      <img src={DownloadIcon} alt="Baixar" className="h-5 w-5" />
                    </a>
                    <button title="Excluir" className="rounded p-1 hover:bg-gray-100" onClick={async () => {
                      if (!confirm('Excluir anexo?')) return;
                      await deleteProjectAttachment(token as string, Number(id), a.id);
                      refetchAttachments();
                    }}>
                      <img src={TrashIcon} alt="Excluir" className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectForm;


