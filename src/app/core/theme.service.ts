import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
const THEME_STORAGE_KEY = 'etic-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly modeSignal = signal<ThemeMode>(this.initialMode());
  readonly mode = this.modeSignal.asReadonly();

  constructor() { this.apply(this.modeSignal()); }

  toggle(): void {
    const mode: ThemeMode = this.modeSignal() === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    this.modeSignal.set(mode);
    this.apply(mode);
  }

  private initialMode(): ThemeMode {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  private apply(mode: ThemeMode): void {
    this.document.documentElement.classList.toggle('app-dark', mode === 'dark');
    this.document.documentElement.style.colorScheme = mode;
  }
}
