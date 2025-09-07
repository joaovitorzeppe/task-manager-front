import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '../types/task';
import { statuses } from '../types/task';
import { updateTask } from '../services/tasks';

type KanbanBoardProps = {
  tasks: Task[];
};

const statusOrder: Array<Task['status']> = ['todo', 'in_progress', 'review', 'done'];

const statusBg: Record<Task['status'], string> = {
  todo: 'bg-gray-50',
  in_progress: 'bg-blue-50',
  review: 'bg-yellow-50',
  done: 'bg-green-50',
};

const priorityDot: Record<Task['priority'], string> = {
  low: 'bg-gray-300',
  medium: 'bg-blue-400',
  high: 'bg-orange-500',
  critical: 'bg-red-600',
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [draggingId, setDraggingId] = React.useState<number | null>(null);
  const [overStatus, setOverStatus] = React.useState<Task['status'] | null>(null);

  const mutation = useMutation({
    mutationFn: async (params: { id: number; status: Task['status'] }) => {
      return updateTask(token as string, params.id, { status: params.status });
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, status } : t))
      );
      return { previous } as { previous?: Task[] };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const grouped = React.useMemo(() => {
    const map: Record<Task['status'], Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const t of tasks) {
      map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  const handleDrop = (status: Task['status'], e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setOverStatus(null);
    setDraggingId(null);
    const id = Number(e.dataTransfer.getData('text/plain'));
    if (!id || Number.isNaN(id)) return;
    const current = tasks.find((t) => t.id === id);
    if (!current || current.status === status) return;
    mutation.mutate({ id, status });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statusOrder.map((status) => {
        const statusLabel = statuses[status];
        const isOver = overStatus === status;
        return (
          <div key={status} className="flex h-[80vh] flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">{statusLabel}</h2>
              <span className="text-xs text-gray-500">{grouped[status].length}</span>
            </div>
            <div
              className={`flex-1 rounded-lg border ${statusBg[status]} p-3 transition-colors ${
                isOver ? 'ring-2 ring-blue-400 ring-offset-2' : 'ring-0'
              } overflow-y-scroll`}
              onDragOver={(e) => {
                e.preventDefault();
                if (overStatus !== status) setOverStatus(status);
              }}
              onDragLeave={() => {
                if (overStatus === status) setOverStatus(null);
              }}
              onDrop={(e) => handleDrop(status, e)}
            >
              <div className="flex flex-col gap-3">
                {grouped[status].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(task.id));
                      setDraggingId(task.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    className={`rounded-md border bg-white p-3 shadow-sm hover:shadow ${
                      draggingId === task.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</div>
                      <span className={`mt-1 inline-block h-2 w-2 rounded-full ${priorityDot[task.priority]}`} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                      {task.project?.name ? (
                        <span className="truncate max-w-[12rem]">{task.project.name}</span>
                      ) : null}
                      <span>•</span>
                      {task.assignee?.name ? (
                        <span className="truncate max-w-[10rem]">{task.assignee.name}</span>
                      ) : (
                        <span className="text-gray-400">Sem responsável</span>
                      )}
                      <span>•</span>
                      <span>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sem prazo'}
                      </span>
                    </div>
                  </div>
                ))}
                {grouped[status].length === 0 ? (
                  <div className="rounded border border-dashed p-4 text-center text-xs text-gray-500">
                    Arraste tarefas aqui
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;


