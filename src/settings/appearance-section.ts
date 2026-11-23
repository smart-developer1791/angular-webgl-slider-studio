import { Component, computed, inject } from '@angular/core';
import { Studio } from '@/config/studio';
import { FONT_IDS } from '@/config/types';
import { FONTS } from '@/slider/captions';
import { ColorField, RangeField, Section, Segmented, Toggle } from './controls';
import { percent } from './formats';

@Component({
  selector: 'studio-appearance',
  imports: [ColorField, RangeField, Section, Segmented, Toggle],
  templateUrl: './appearance-section.html',
  host: { style: 'display: contents' },
})
export class AppearanceSection {
  protected readonly studio = inject(Studio);
  protected readonly look = computed(() => this.studio.config().appearance);
  protected readonly percent = percent;
  protected readonly fonts = FONT_IDS.map((id) => ({ value: id, label: FONTS[id].label }));
  protected readonly animations = [
    { value: 'letters', label: 'Letters' },
    { value: 'fadeUp', label: 'Fade up' },
    { value: 'blurIn', label: 'Blur in' },
  ] as const;
  protected readonly positions = [
    { value: 'bottomLeft', label: 'Bottom' },
    { value: 'middleLeft', label: 'Left' },
    { value: 'center', label: 'Center' },
  ] as const;
  protected readonly indicators = [
    { value: 'progress', label: 'Progress' },
    { value: 'dots', label: 'Dots' },
    { value: 'none', label: 'None' },
  ] as const;
}
