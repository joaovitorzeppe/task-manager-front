export type Project = {
  id: number;
  name: string;
  description?: string | null;
  status: "planned" | "active" | "completed" | "cancelled";
  startDate: string;
  endDate?: string | null;
  managerId: number;
  manager?: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "manager" | "developer";
  };
};
