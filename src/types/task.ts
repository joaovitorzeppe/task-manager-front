export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: string | null; // ISO string
  projectId: number;
  assigneeId: number;
  project?: {
    id: number;
    name: string;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
};
