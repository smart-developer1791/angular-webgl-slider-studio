import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { Studio } from '@/config/studio';
import { contrastText } from '@/lib/color';
import { SettingsPanel } from '@/settings/settings-panel';
import { SliderStage } from '@/slider/slider-stage';

@Component({
  selector: '[appRoot]',
  imports: [LucideDynamicIcon, SettingsPanel, SliderStage],
  templateUrl: './app.html',
  host: {
    '(window:keydown)': 'onKey($event)',
    '(document:fullscreenchange)': 'updateFullscreen()',
  },
})
export class App {
  protected readonly studio = inject(Studio);
  protected readonly fullscreen = signal(false);
  protected readonly panelOpen = signal(window.matchMedia('(min-width: 768px)').matches);
  protected readonly accent = computed(() => this.studio.config().appearance.accent);
  protected readonly accentText = computed(() => contrastText(this.accent()));
  protected readonly toasts = computed(() => {
    const toast = this.studio.toast();
    return toast ? [toast] : [];
  });
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }
    const element = this.main().nativeElement;
    if (!element.requestFullscreen || !document.fullscreenEnabled) {
      this.studio.notify(
        'Fullscreen is unavailable in this window — open the preview in a separate tab',
        'error',
      );
      return;
    }
    void element
      .requestFullscreen()
      .catch(() => this.studio.notify('The browser blocked fullscreen mode', 'error'));
  }

  protected updateFullscreen() {
    this.fullscreen.set(document.fullscreenElement === this.main().nativeElement);
  }

  protected onKey(event: KeyboardEvent) {
    if (
      (event.code !== 'KeyH' && event.code !== 'KeyF') ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    )
      return;
    if (
      (event.target as HTMLElement | null)?.closest?.(
        'input, textarea, select, [contenteditable="true"]',
      )
    )
      return;
    if (event.code === 'KeyF') this.toggleFullscreen();
    else this.panelOpen.update((open) => !open);
  }
}
