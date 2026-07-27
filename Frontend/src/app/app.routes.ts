import { Routes } from '@angular/router';
import { LogIn } from './log-in/log-in';
import { SignUp } from './sign-up/sign-up';
import { HomePage } from './home-page/home-page';
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'log-in',
        pathMatch: 'full'
    },{
        path: 'log-in',
        component: LogIn
    },
    {
        path: 'sign-up',
        component: SignUp
    },
    {
        path: 'home',
        component: HomePage
    }
];
