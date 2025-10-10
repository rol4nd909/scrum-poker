import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roomGuard: CanActivateFn = () => {
  const router = inject(Router);
  const participant = localStorage.getItem('participant');

  // ✅ Allow access only if a participant exists
  if (participant) {
    return true;
  }

  // 🚫 Redirect to join screen
  router.navigate(['/']);
  return false;
};
