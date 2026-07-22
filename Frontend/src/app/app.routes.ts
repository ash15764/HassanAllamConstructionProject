import { Routes } from '@angular/router';
import { LogIn } from './log-in/log-in';
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'log-in',
        pathMatch: 'full'
    },{
        path: 'log-in',
        component: LogIn
    }
];
