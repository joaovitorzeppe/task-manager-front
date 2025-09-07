import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import type { Task } from '../types/task';
import { fetchTasks } from '../services/tasks';
import { fetchProjects } from '../services/projects';
import type { Project } from '../types/project';

const Kanban: React.FC = () => {
  const { token } = useAuth();
  const [projectId, setProjectId] = React.useState<number | 'all'>('all');

  const { data: tasks, isLoading, isError, error } = useQuery<Task[], Error>({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(token as string, projectId === 'all' ? undefined : { projectId: projectId as number }),
    enabled: !!token,
  });

  const { data: projects } = useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(token as string),
    enabled: !!token,
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Kanban</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Projeto:</label>
          <select
            className="rounded border bg-white px-3 py-2 text-sm text-gray-800"
            value={projectId}
            onChange={(e) => {
              const v = e.target.value;
              setProjectId(v === 'all' ? 'all' : Number(v));
            }}
          >
            <option value="all">Todos</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>
      <KanbanBoard tasks={tasks ?? []} />
    </div>
  );
};

export default Kanban;


