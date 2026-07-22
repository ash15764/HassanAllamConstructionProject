import { Routes } from '@angular/router';
import { LogIn } from './log-in/log-in';
import { SignUp } from './sign-up/sign-up';
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
    }
];
