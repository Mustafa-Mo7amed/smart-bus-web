import { Routes } from '@angular/router';
import { nonAuthGuard } from './core/guards/non-auth.guard';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [nonAuthGuard],
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
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
            path: 'register-route',
            loadComponent: () =>
              import('../app/routes/add-route/add-route.component').then((m) => m.AddRouteComponent),
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
      {
        path: 'buses',
        loadComponent: () => import('../app/buses/buses.component').then((m) => m.BusesComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../app/buses/buses-list/buses-list.component').then((m) => m.BusesListComponent),
          },
          {
            path: 'register-bus',
            loadComponent: () =>
              import('../app/buses/add-bus/add-bus.component').then((m) => m.AddBusComponent),
          },
        ],
      },
      {
        path: 'drivers',
        loadComponent: () => import('../app/drivers/drivers.component').then((m) => m.DriversComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../app/drivers/drivers-list/drivers-list.component').then(
                (m) => m.DriversListComponent,
              ),
          },
          {
            path: 'register-driver',
            loadComponent: () =>
              import('../app/drivers/add-driver/add-driver.component').then((m) => m.AddDriverComponent),
          },
        ],
      },
      {
        path: 'assignments',
        loadComponent: () => import('../app/assignments/assignments.component').then((m) => m.AssignmentsComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../app/assignments/assignments-list/assignments-list.component').then(
                (m) => m.AssignmentsListComponent,
              ),
          },
          {
            path: 'assign-bus',
            loadComponent: () =>
              import('../app/assignments/assign-bus/assign-bus.component').then((m) => m.AssignBusComponent),
          },
        ],
      },
    ],
  },
];
