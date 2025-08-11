import { Routes } from '@angular/router';
import { AuthGuard } from '../../shared/guards/auth.guard';

export const Main_Layout_Routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./main-layout').then(
        (m) => m.MainLayout
      ),
    children: [
      {
        path: '',
        redirectTo: 'school-creation',
        pathMatch: 'full',
    },
      {
        path: 'school-creation',
        loadComponent: () =>
          import('../school-creation-folder/school-creation/school-creation').then(
            (m) => m.SchoolCreation
          ),
      },
      {
        path: 'new-year',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../new-year/ended-schools-year/ended-schools-year').then(
                (m) => m.EndedSchoolsYear
              ),
          },
          {
            path: 'start',
            loadComponent: () =>
              import('../new-year/start-new-year/start-new-year').then(
                (m) => m.StartNewYearComponent
              ),
          },
        ],
      },
    ],
  },
];
