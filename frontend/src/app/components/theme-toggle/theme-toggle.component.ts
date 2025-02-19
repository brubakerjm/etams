import { Component, effect, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ClrIconModule } from "@clr/angular";

@Component({
  selector: 'app-theme-toggle',
  imports: [
    NgIf,
    ClrIconModule,
  ],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css'
})
export class ThemeToggleComponent {
  theme = signal<string>(localStorage.getItem('cds-theme') || 'light');

  constructor() {
    document.body.setAttribute('cds-theme', this.theme());

    effect(() => {
      document.body.setAttribute('cds-theme', this.theme());
      localStorage.setItem('cds-theme', this.theme());
    });
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }
}