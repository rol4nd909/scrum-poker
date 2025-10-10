import { Routes } from '@angular/router';
import { JoinRoom } from '~components/join-room/join-room';
import { Room } from '~components/room/room';
import { roomGuard } from '~guards/room.guard-guard';

export const routes: Routes = [
  { path: '', component: JoinRoom },
  { path: 'room', component: Room, canActivate: [roomGuard] },
];
