import { computed, effect, Injectable, signal, untracked } from '@angular/core';
import type { SliderEngine } from '@/slider/engine';
import type { TextureStatus } from '@/webgl/Renderer';
import { reducer, type Action, type SectionKey } from './reducer';
import { loadConfig, resolveImage, resolveSync, saveConfig } from './storage';
import type { SliderConfig } from './types';

type ToastKind = 'success' | 'error';

function sameUrls(a: string[], b: string[]) {
  return a.length === b.length && a.every((url, i) => url === b[i]);
}

@Injectable({ providedIn: 'root' })
export class Studio {
  private readonly settings = signal(loadConfig());
  readonly config = this.settings.asReadonly();
  readonly engine = signal<SliderEngine | null>(null);
  readonly active = signal(0);
  readonly webgl = signal(true);
  readonly statuses = signal<Record<string, TextureStatus>>({});
  readonly toast = signal<{ message: string; kind: ToastKind; key: number } | null>(null);
  readonly urls = signal<string[]>([], { equal: sameUrls });
  private readonly sources = computed(() => this.config().slides.map((slide) => slide.image), {
    equal: sameUrls,
  });

  constructor() {
    effect((onCleanup) => {
      const current = this.config();
      untracked(() => this.engine()?.setConfig(current));
      const timer = window.setTimeout(() => {
        if (!saveConfig(current))
          this.notify('Browser storage is full — settings were not saved', 'error');
      }, 300);
      onCleanup(() => window.clearTimeout(timer));
    });

    effect((onCleanup) => {
      const sources = this.sources();
      const sync = sources.map(resolveSync);
      this.urls.set(sync.map((url) => url ?? ''));
      if (sync.some((url) => url === null)) {
        let cancelled = false;
        void Promise.all(sources.map(resolveImage)).then((urls) => {
          if (!cancelled) this.urls.set(urls);
        });
        onCleanup(() => {
          cancelled = true;
        });
      }
    });

    effect((onCleanup) => {
      if (!this.toast()) return;
      const timer = window.setTimeout(() => this.toast.set(null), 3200);
      onCleanup(() => window.clearTimeout(timer));
    });
  }

  dispatch(action: Action) {
    this.settings.update((current) => reducer(current, action));
  }

  patch<K extends SectionKey>(section: K, value: Partial<SliderConfig[K]>) {
    this.dispatch({ type: 'patch', section, value });
  }

  notify(message: string, kind: ToastKind = 'success') {
    this.toast.set({ message, kind, key: Date.now() });
  }
}
