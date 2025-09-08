import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProjects } from '../services/projects';
import { fetchTasks } from '../services/tasks';
import type { Project } from '../types/project';
import type { Task } from '../types/task';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function monthBounds() {
  const start = dayjs().startOf('month');
  const end = dayjs().endOf('month');
  return { start, end };
}

function toDateInput(d: Dayjs) {
  return d.format('YYYY-MM-DD');
}

function isoStartOfDay(dateStr?: string) {
  if (!dateStr) return undefined;
  const d = dayjs(dateStr);
  if (!d.isValid()) return undefined;
  return d.startOf('day').format('YYYY-MM-DD');
}
function isoEndOfDay(dateStr?: string) {
  if (!dateStr) return undefined;
  const d = dayjs(dateStr);
  if (!d.isValid()) return undefined;
  return d.endOf('day').format('YYYY-MM-DD');
}

const Charts: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);

  const { start, end } = useMemo(() => monthBounds(), []);
  const [startDate, setStartDate] = useState<string>(toDateInput(start));
  const [endDate, setEndDate] = useState<string>(toDateInput(end));

  useEffect(() => {
    if (!token) return;
    fetchProjects(token).then(setProjects).catch(() => setProjects([]));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const filters: any = {};
    const fromISO = isoStartOfDay(startDate);
    const toISO = isoEndOfDay(endDate);
    if (fromISO) filters.dueDateFrom = fromISO;
    if (toISO) filters.dueDateTo = toISO;
    if (projectId) filters.projectId = projectId;
    fetchTasks(token, filters).then(setTasks).catch(() => setTasks([]));
  }, [token, projectId, startDate, endDate]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0 };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return {
      labels: ['A Fazer', 'Em Progresso', 'Revisão', 'Concluída'],
      datasets: [
        {
          label: 'Tarefas',
          data: [counts.todo, counts.in_progress, counts.review, counts.done],
          backgroundColor: ['#93c5fd', '#fbbf24', '#f472b6', '#34d399'],
        },
      ],
    };
  }, [tasks]);

  const barData = useMemo(() => {
    const grouped: Record<string, number> = {};
    tasks.forEach((t) => {
      const name = t.assignee?.name || 'Sem responsável';
      grouped[name] = (grouped[name] || 0) + 1;
    });
    const labels = Object.keys(grouped).sort((a, b) => {
      if (a === 'Sem responsável') return -1;
      if (b === 'Sem responsável') return 1;
      return a.localeCompare(b);
    });
    const data = labels.map((l) => grouped[l]);
    return {
      labels,
      datasets: [
        {
          label: 'Tarefas',
          data,
          backgroundColor: '#60a5fa',
        },
      ],
    };
  }, [tasks]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md bg-white p-4 shadow">
        <div className="mb-3 text-lg font-semibold text-gray-800">Filtros</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Projeto</label>
            <select
              value={projectId ?? ''}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : undefined)}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring"
            >
              <option value="">Todos</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-md bg-white p-4 shadow">
          <div className="mb-3 text-base font-semibold text-gray-800">Tarefas por Status</div>
          <Pie data={pieData} />
        </div>

        <div className="rounded-md bg-white p-4 shadow">
          <div className="mb-3 text-base font-semibold text-gray-800">Tarefas por Responsável</div>
          <Bar
            data={barData}
            options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
          />
        </div>
      </div>
    </div>
  );
};

export default Charts;


