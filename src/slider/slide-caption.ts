import { Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import type { AppearanceSettings, Slide, TextPosition } from '@/config/types';
import { contrastText } from '@/lib/color';
import { FONTS } from './captions';

const POSITIONS: Record<TextPosition, { wrap: string; inner: string }> = {
  bottomLeft: {
    wrap: 'items-end justify-start text-left pb-24 md:pb-28',
    inner: 'items-start max-w-[min(64rem,80cqw)]',
  },
  middleLeft: {
    wrap: 'items-center justify-start text-left',
    inner: 'items-start max-w-[min(56rem,64cqw)]',
  },
  center: {
    wrap: 'items-center justify-center text-center',
    inner: 'items-center max-w-[min(64rem,82cqw)]',
  },
};

@Component({
  selector: 'div[studioCaption]',
  imports: [LucideDynamicIcon],
  templateUrl: './slide-caption.html',
  host: {
    class: 'absolute inset-0 flex px-6 pt-20 md:px-[5.5cqw]',
    '[class]': 'position().wrap',
  },
})
export class SlideCaption {
  readonly slide = input.required<Slide>();
  readonly appearance = input.required<AppearanceSettings>();
  readonly delay = input.required<number>();
  readonly leaving = input.required<boolean>();
  protected readonly position = computed(() => POSITIONS[this.appearance().textPosition]);
  protected readonly font = computed(() => FONTS[this.appearance().font]);
  protected readonly letters = computed(() => this.appearance().textAnimation === 'letters');
  protected readonly external = computed(() => /^https?:\/\//i.test(this.slide().buttonUrl));
  protected readonly href = computed(() => {
    const url = this.slide().buttonUrl;
    // Match the React version's handling of script URLs in editable links.
    return /^javascript:/i.test(url.replace(/[\t\r\n]/g, '').replace(/^[\u0000-\u0020]+/, ''))
      ? '#'
      : url || '#';
  });
  protected readonly characters = computed(() => {
    let index = 0;
    return this.slide()
      .title.split(' ')
      .map((word) => Array.from(word, (text) => ({ text, index: index++ })));
  });
  protected readonly linkColor = computed(() => contrastText(this.appearance().accent));
}
