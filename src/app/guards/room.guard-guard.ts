import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ParticipantService } from '~services/participants/participant.service';

export const roomGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(ParticipantService);

  // ✅ Allow access only if a participant exists in the store
  if (store.participant()) {
    return true;
  }

  // 🚫 Redirect to join screen
  router.navigate(['/']);
  return false;
};
