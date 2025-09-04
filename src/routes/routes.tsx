import type { ReactNode } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import HomeRedirect from '../components/HomeRedirect';
import Login from '../pages/Login';
import Users from '../pages/Users';
import Projects from '../pages/Projects';
import Tasks from '../pages/Tasks';
import UserForm from '../pages/UserForm';
import type { User } from '../types/user';

export type AppRoute = {
  path: string;
  element: ReactNode;
  children?: AppRoute[];
  roles?: Array<User['role']>;
};

const routes: AppRoute[] = [
  { path: '/', element: <HomeRedirect /> },
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: '/dashboard/users', element: <Users />, roles: ['admin']},
      { path: '/dashboard/users/form', element: <UserForm />, roles: ['admin'] },
      { path: '/dashboard/users/form/:id', element: <UserForm />, roles: ['admin'] },
      { path: '/dashboard/projects', element: <Projects />, roles: ['admin', 'manager'] },
      { path: '/dashboard/tasks', element: <Tasks /> },
    ],
  },
];

export default routes;


