import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout';
import { HomePage } from './home-page/home-page';
import { ProjectsPage } from './projects-page/projects-page';
import { LogIn } from '../app/log-in/log-in';
import { SignUp } from './sign-up/sign-up';
import { AddProject } from './add-project/add-project';
import { authGuard } from './guards/auth-guard';
import { StatisticsPage } from './statistics-page/statistics-page';
export const routes: Routes = [
  { path: 'sign-in', component: LogIn },
  { path: 'sign-up', component: SignUp },
  { path: 'projects/add', component: AddProject },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomePage },
      { path: 'projects', component: ProjectsPage },
      { path: 'statistics', component: StatisticsPage },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'sign-in' },
];