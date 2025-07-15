import { Routes } from '@angular/router';

export const Main_Layout_Routes: Routes = [
  {
    path: '',
    // canActivate: [authGuard],
    loadComponent: () =>
      import('../main-layout').then(
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
          import('../../school-creation-folder/school-creation/school-creation').then(
            (m) => m.SchoolCreation
          ),
      },
    ],
  },
];
