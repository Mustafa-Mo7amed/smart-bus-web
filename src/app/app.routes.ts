import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
      },
      {
        path: 'login-confirmation',
      },
    ],
  },
  {
    path: 'dashboard',
  },
  {
    path: 'buses',
  },
  {
    path: 'drivers',
  },
  {
    path: 'stations',
  },
  {
    path: 'queues',
  },
  {
    path: 'trips',
  },
  {
    path: 'reports',
  },
  {
    path: 'settings',
  },
];
