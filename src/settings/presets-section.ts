import { Component, inject, signal } from '@angular/core';
import { createId } from '@/config/defaults';
import { BUILT_IN_PRESETS } from '@/config/presets';
import { loadPresets, pickSettings, savePresets } from '@/config/storage';
import { Studio } from '@/config/studio';
import type { Preset } from '@/config/types';
import { EFFECTS } from '@/webgl/effects';
import { IconButton, Section, StudioButton } from './controls';

@Component({
  selector: 'studio-presets',
  imports: [IconButton, Section, StudioButton],
  templateUrl: './presets-section.html',
  host: { style: 'display: contents' },
})
export class PresetsSection {
  private readonly studio = inject(Studio);
  protected readonly custom = signal(loadPresets());
  protected readonly name = signal('');
  protected readonly presets = BUILT_IN_PRESETS;
  protected readonly effects = EFFECTS;

  protected apply(preset: Preset) {
    this.studio.dispatch({ type: 'applyPreset', settings: preset.settings });
    this.studio.notify(`Preset “${preset.name}” applied`);
  }

  protected remove(id: string) {
    this.persist(this.custom().filter((preset) => preset.id !== id));
  }

  protected save(event: SubmitEvent) {
    event.preventDefault();
    const preset = {
      id: createId(),
      name: this.name().trim() || `My preset ${this.custom().length + 1}`,
      settings: pickSettings(this.studio.config()),
    };
    this.persist([...this.custom(), preset]);
    this.name.set('');
    this.studio.notify(`Preset “${preset.name}” saved`);
  }

  private persist(list: Preset[]) {
    this.custom.set(list);
    if (!savePresets(list)) this.studio.notify('Could not save the preset', 'error');
  }
}
