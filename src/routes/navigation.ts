type NavItem = {
  label: string;
  path: string;
  roles?: Array<"admin" | "manager" | "developer">;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navigation: NavGroup[] = [
  {
    label: "Dashboards",
    items: [
      {
        label: "Kanban",
        path: "/dashboard/kanban",
        roles: ["admin", "manager", "developer"],
      },
    ],
  },
  {
    label: "Cadastros",
    items: [
      {
        label: "Usuários",
        path: "/dashboard/users",
        roles: ["admin", "manager"],
      },
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
    ],
  },
];

export type { NavItem, NavGroup };
export default navigation;
