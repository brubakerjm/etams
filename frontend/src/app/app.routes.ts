import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
                canActivate: [AdminGuard]
            },
            {
                path: 'tasks',
                loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent),
                canActivate: [AuthGuard]
            },
            {
                path: 'employees',
                loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent),
                canActivate: [AdminGuard]
            },
            {
                path: 'reports',
                loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent),
                canActivate: [AuthGuard]
            }
        ],
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];