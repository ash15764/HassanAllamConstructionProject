import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout';
import { HomePage } from './home-page/home-page';
import { ProjectsPage } from './projects-page/projects-page';
import { LogIn } from '../app/log-in/log-in';
import { SignUp } from './sign-up/sign-up';

export const routes: Routes = [
  { path: 'sign-in', component: LogIn },
  { path: 'sign-up', component: SignUp },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomePage },
      { path: 'projects', component: ProjectsPage },
      // { path: 'projects/add', component: AddProjectComponent }, etc.
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'sign-in' },
];