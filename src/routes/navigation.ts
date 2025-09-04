type NavItem = {
  label: string;
  path: string;
  roles?: Array<"admin" | "manager" | "developer">;
};

const navigation: NavItem[] = [
  { label: "Usuários", path: "/dashboard/users", roles: ["admin", "manager"] },
  {
    label: "Projetos",
    path: "/dashboard/projects",
    roles: ["admin", "manager"],
  },
  {
    label: "Tarefas",
    path: "/dashboard/tasks",
    roles: ["admin", "manager", "developer"],
  },
];

export type { NavItem };
export default navigation;
