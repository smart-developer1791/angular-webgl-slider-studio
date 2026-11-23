import { Component, computed, inject } from '@angular/core';
import { Studio } from '@/config/studio';
import { RangeField, Section, Toggle } from './controls';
import { percent, seconds } from './formats';

@Component({
  selector: 'studio-playback',
  imports: [RangeField, Section, Toggle],
  templateUrl: './playback-sections.html',
  host: { style: 'display: contents' },
})
export class PlaybackSections {
  protected readonly studio = inject(Studio);
  protected readonly fx = computed(() => this.studio.config().fx);
  protected readonly interaction = computed(() => this.studio.config().interaction);
  protected readonly autoplay = computed(() => this.studio.config().autoplay);
  protected readonly percent = percent;
  protected readonly seconds = seconds;
  protected readonly decimal = (value: number) => value.toFixed(2);
  protected readonly multiplier = (value: number) => `×${value.toFixed(2)}`;
}
