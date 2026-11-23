import { Component, inject, input, output } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { Studio } from '@/config/studio';
import { AppearanceSection } from './appearance-section';
import { DataSection } from './data-section';
import { PlaybackSections } from './playback-sections';
import { PresetsSection } from './presets-section';
import { SlidesSection } from './slides-section';
import { TransitionSection } from './transition-section';

@Component({
  selector: 'aside[studioSettings]',
  imports: [
    AppearanceSection,
    DataSection,
    LucideDynamicIcon,
    PlaybackSections,
    PresetsSection,
    SlidesSection,
    TransitionSection,
  ],
  templateUrl: './settings-panel.html',
  host: {
    'aria-label': 'Slider settings',
    '[attr.aria-hidden]': '!open()',
    '[inert]': '!open()',
    class:
      'fixed inset-x-0 bottom-0 z-30 h-[66dvh] overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#0e0e11]/95 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:static md:h-full md:shrink-0 md:rounded-none md:border-t-0 md:shadow-none md:transition-[width]',
    '[class]':
      "open() ? 'translate-y-0 md:w-[380px] md:border-l' : 'translate-y-full md:w-0 md:translate-y-0'",
  },
})
export class SettingsPanel {
  readonly open = input.required<boolean>();
  readonly close = output<void>();
  protected readonly studio = inject(Studio);
}
