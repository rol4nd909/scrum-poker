import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  styleUrls: ['./app.css'],
  template: `
    <app-header />
    <main class="wrapper">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class App {
  protected readonly title = signal('bld-scrum-poker aap');
}
