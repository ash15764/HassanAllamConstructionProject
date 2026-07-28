import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/UserService';

export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.IsLoggedIn()) {
    return true;
  }

  router.navigate(['/sign-in'], {
    queryParams: { sessionExpired: 'true' }
  });
  return false;
};