import { Component, computed, inject } from '@angular/core';
import { Studio } from '@/config/studio';
import { EASING_IDS, EFFECT_IDS, type EffectId } from '@/config/types';
import { EASING_LABELS } from '@/webgl/easing';
import { EFFECTS } from '@/webgl/effects';
import {
  ColorField,
  RangeField,
  Section,
  Segmented,
  SelectField,
  StudioButton,
  Toggle,
} from './controls';
import { percent, seconds } from './formats';

@Component({
  selector: 'studio-transition',
  imports: [ColorField, RangeField, Section, Segmented, SelectField, StudioButton, Toggle],
  templateUrl: './transition-section.html',
  host: { style: 'display: contents' },
})
export class TransitionSection {
  protected readonly studio = inject(Studio);
  protected readonly transition = computed(() => this.studio.config().transition);
  protected readonly effect = computed(() => EFFECTS[this.transition().effect]);
  protected readonly params = computed(
    () => this.studio.config().effectParams[this.transition().effect],
  );
  protected readonly fields = computed(() =>
    this.effect().params.map((param) => ({
      ...param,
      choices: param.options?.map((label, value) => ({ label, value })),
      format: (value: number) =>
        param.step >= 1 ? String(value) : value.toFixed(param.step >= 0.01 ? 2 : 3),
    })),
  );
  protected readonly effects = EFFECTS;
  protected readonly effectIds = EFFECT_IDS;
  protected readonly easingOptions = EASING_IDS.map((id) => ({
    value: id,
    label: EASING_LABELS[id],
  }));
  protected readonly seconds = seconds;
  protected readonly percent = percent;

  protected chooseEffect(id: EffectId) {
    this.studio.patch('transition', { effect: id });
    requestAnimationFrame(() => this.studio.engine()?.replay());
  }

  protected setParam(index: number, value: number) {
    this.studio.dispatch({ type: 'effectParam', effect: this.transition().effect, index, value });
  }

  protected resetParams() {
    this.effect().params.forEach((param, index) => this.setParam(index, param.default));
  }
}
