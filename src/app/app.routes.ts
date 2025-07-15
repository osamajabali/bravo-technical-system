import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./features/authentication/login/login.component').then(
                (m) => m.LoginComponent
            ),
    },
    {
        path: 'features',
        loadChildren: () => import('./features/main-layout/layout-route/main-layout.routes').then(m => m.Main_Layout_Routes)
    },
];
