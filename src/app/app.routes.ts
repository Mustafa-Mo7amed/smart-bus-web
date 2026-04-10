import { Routes } from '@angular/router';
import { RoutesComponent } from './routes/routes.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'routes',
  },
  {
    path: 'routes',
    pathMatch: 'prefix',
    component: RoutesComponent,
  },
  // {
  //   path: 'auth',
  //   children: [
  //     {
  //       path: 'login',
  //     },
  //     {
  //       path: 'login-confirmation',
  //     },
  //   ],
  // },
  // {
  //   path: 'dashboard',
  // },
  // {
  //   path: 'buses',
  // },
  // {
  //   path: 'drivers',
  // },
  // {
  //   path: 'stations',
  // },
  // {
  //   path: 'queues',
  // },
  // {
  //   path: 'trips',
  // },
  // {
  //   path: 'reports',
  // },
  // {
  //   path: 'settings',
  // },
];
