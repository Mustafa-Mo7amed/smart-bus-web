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
    loadComponent: () => import('../app/routes/routes.component').then((m) => m.RoutesComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../app/routes/routes-list/routes-list.component').then(
            (m) => m.RoutesListComponent,
          ),
      },
      {
        path: 'details/:routeId',
        loadComponent: () =>
          import('../app/routes/route-details/route-details.component').then(
            (m) => m.RouteDetailsComponent,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../app/routes/route-details/station-queue/station-queue.component').then(
                (m) => m.StationQueueComponent,
              ),
          },
        ],
      },
    ],
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
