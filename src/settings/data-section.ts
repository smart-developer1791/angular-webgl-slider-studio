import { Component, inject, signal } from '@angular/core';
import { defaultConfig } from '@/config/defaults';
import { exportConfig, importConfig } from '@/config/storage';
import { Studio } from '@/config/studio';
import { Section, StudioButton } from './controls';

@Component({
  selector: 'studio-data',
  imports: [Section, StudioButton],
  templateUrl: './data-section.html',
  host: { style: 'display: contents' },
})
export class DataSection {
  private readonly studio = inject(Studio);
  protected readonly busy = signal(false);

  protected async doExport() {
    this.busy.set(true);
    try {
      const blob = await exportConfig(this.studio.config());
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = 'webgl-slider.json';
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
    } catch {
      this.studio.notify('Could not export the configuration', 'error');
    } finally {
      this.busy.set(false);
    }
  }

  protected async doImport(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.busy.set(true);
    try {
      this.studio.dispatch({ type: 'replace', config: await importConfig(await file.text()) });
      this.studio.notify('Configuration imported');
    } catch (error) {
      this.studio.notify(
        error instanceof SyntaxError
          ? 'The file is not valid JSON'
          : error instanceof Error
            ? error.message
            : 'Import failed',
        'error',
      );
    } finally {
      this.busy.set(false);
    }
  }

  protected reset() {
    if (window.confirm('Reset all settings and slides to their defaults?')) {
      this.studio.dispatch({ type: 'replace', config: defaultConfig() });
      this.studio.notify('Settings reset');
    }
  }
}
