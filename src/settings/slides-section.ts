import { Component, computed, inject, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { newSlide } from '@/config/defaults';
import { deleteImage, putImage } from '@/config/storage';
import { Studio } from '@/config/studio';
import { EFFECT_IDS, type Slide, type SlideEffect } from '@/config/types';
import { EFFECTS } from '@/webgl/effects';
import { IconButton, Section, SelectField, StudioButton, TextField } from './controls';

@Component({
  selector: 'studio-slides',
  imports: [IconButton, LucideDynamicIcon, Section, SelectField, StudioButton, TextField],
  templateUrl: './slides-section.html',
  host: { style: 'display: contents' },
})
export class SlidesSection {
  protected readonly studio = inject(Studio);
  protected readonly expanded = signal<string | null>(null);
  protected readonly dragFrom = signal<number | null>(null);
  protected readonly dropOver = signal(false);
  protected readonly url = signal('');
  protected readonly slides = computed(() => this.studio.config().slides);
  protected readonly effects = EFFECTS;
  protected readonly effectOptions: { value: SlideEffect; label: string }[] = [
    { value: 'inherit', label: 'Use transition settings' },
    ...EFFECT_IDS.map((id) => ({ value: id, label: EFFECTS[id].name })),
  ];

  protected status(index: number) {
    const source = this.studio.urls()[index];
    return source ? this.studio.statuses()[source] : 'error';
  }

  private async addFiles(files: FileList | null | undefined) {
    const images = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));
    if (!images.length) return;
    try {
      const added = await Promise.all(
        images.map(async (file) => ({
          ...newSlide(await putImage(file)),
          title: file.name.replace(/\.[^.]+$/, ''),
        })),
      );
      this.studio.dispatch({ type: 'addSlides', slides: added });
      this.studio.notify(added.length > 1 ? `Slides added: ${added.length}` : 'Slide added');
    } catch {
      this.studio.notify('Could not save the image in this browser', 'error');
    }
  }

  protected onFiles(input: HTMLInputElement) {
    void this.addFiles(input.files);
    input.value = '';
  }

  protected addUrl(event: SubmitEvent) {
    event.preventDefault();
    const image = this.url().trim();
    if (!/^https?:\/\/\S+$/i.test(image)) {
      this.studio.notify('Enter a URL starting with http:// or https://', 'error');
      return;
    }
    this.studio.dispatch({ type: 'addSlides', slides: [newSlide(image)] });
    this.url.set('');
  }

  protected remove(slide: Slide) {
    this.studio.dispatch({ type: 'removeSlide', id: slide.id });
    if (!this.slides().some((item) => item.image === slide.image)) void deleteImage(slide.image);
  }

  protected toggleSlide(id: string) {
    this.expanded.update((current) => (current === id ? null : id));
  }

  protected updateSlide(id: string, value: Partial<Slide>) {
    this.studio.dispatch({ type: 'updateSlide', id, value });
  }

  protected move(from: number, to: number) {
    this.studio.dispatch({ type: 'moveSlide', from, to });
  }

  protected startDrag(event: DragEvent, index: number) {
    this.dragFrom.set(index);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  protected dropSlide(event: DragEvent, to: number) {
    event.preventDefault();
    const from = this.dragFrom();
    if (from !== null) this.move(from, to);
    this.dragFrom.set(null);
  }

  protected hoverFiles(event: DragEvent) {
    if (event.dataTransfer?.types.includes('Files')) {
      event.preventDefault();
      this.dropOver.set(true);
    }
  }

  protected dropFiles(event: DragEvent) {
    event.preventDefault();
    this.dropOver.set(false);
    void this.addFiles(event.dataTransfer?.files);
  }
}
