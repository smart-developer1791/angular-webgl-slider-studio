import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { Studio } from '@/config/studio';
import { Renderer } from '@/webgl/Renderer';
import type { CaptionState } from './captions';
import { SliderEngine } from './engine';
import { SlideCaption } from './slide-caption';

@Component({
  selector: 'div[studioSlider]',
  imports: [LucideDynamicIcon, SlideCaption],
  templateUrl: './slider-stage.html',
  host: {
    class: 'slider-root relative h-full w-full overflow-hidden bg-[#0b0b0d] select-none',
    style: 'touch-action: pan-y; container-type: inline-size',
    'aria-roledescription': 'carousel',
    '[attr.data-drag]': 'drag()',
    '[attr.data-cursor-on]': 'config().fx.cursor',
  },
})
export class SliderStage {
  protected readonly studio = inject(Studio);
  protected readonly config = this.studio.config;
  protected readonly count = computed(() => this.config().slides.length);
  protected readonly drag = computed(() => this.config().interaction.drag && this.count() > 1);
  protected readonly look = computed(() => this.config().appearance);
  protected readonly autoplay = computed(() => this.config().autoplay.enabled);
  protected readonly slideNumbers = computed(() =>
    Array.from({ length: this.count() }, (_, i) => i + 1),
  );
  protected readonly captions = signal<(CaptionState & { leaving: boolean })[]>([
    { index: 0, key: 0, delay: 250, leaving: false },
  ]);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly root = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private captionTimer = 0;

  protected readonly overlay = computed(() => {
    const appearance = this.look();
    const k = (value: number) => `rgba(0,0,0,${(appearance.overlay * value).toFixed(3)})`;
    switch (appearance.textPosition) {
      case 'bottomLeft':
        return `linear-gradient(to top, ${k(0.9)} 0%, ${k(0.35)} 45%, ${k(0.12)} 100%)`;
      case 'middleLeft':
        return `linear-gradient(to right, ${k(0.85)} 0%, ${k(0.25)} 60%, ${k(0.05)} 100%)`;
      case 'center':
        return `radial-gradient(ellipse at center, ${k(0.7)} 0%, ${k(0.3)} 75%)`;
    }
  });

  protected readonly arrows = [
    {
      label: 'Previous slide',
      icon: 'arrow-left',
      enabled: computed(
        () => this.count() > 1 && (this.config().interaction.loop || this.studio.active() > 0),
      ),
      run: () => this.studio.engine()?.prev(),
    },
    {
      label: 'Next slide',
      icon: 'arrow-right',
      enabled: computed(
        () =>
          this.count() > 1 &&
          (this.config().interaction.loop || this.studio.active() < this.count() - 1),
      ),
      run: () => this.studio.engine()?.next(),
    },
  ];

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const renderer = Renderer.create(this.canvas().nativeElement);
      this.studio.webgl.set(!!renderer);
      if (renderer) {
        renderer.onTextureStatus = (url, status) => {
          this.studio.statuses.update((statuses) => ({ ...statuses, [url]: status }));
        };
      }
      const engine = new SliderEngine(renderer, this.config(), {
        onIndex: (index) => {
          this.studio.active.set(index);
          if (this.captions().at(-1)?.index !== index) this.showCaption(index, 0);
        },
        onTransitionStart: (index, duration) =>
          this.showCaption(index, Math.round(duration * 0.42)),
      });
      const updateMotion = () => {
        engine.reducedMotion = this.motion.matches;
      };
      updateMotion();
      this.motion.addEventListener('change', updateMotion);
      engine.attach(this.root.nativeElement);
      this.studio.engine.set(engine);
      destroyRef.onDestroy(() => {
        window.clearTimeout(this.captionTimer);
        this.motion.removeEventListener('change', updateMotion);
        engine.destroy();
        this.studio.engine.set(null);
      });
    });
    effect(() => {
      const urls = this.studio.urls();
      const engine = this.studio.engine();
      untracked(() => engine?.setUrls(urls));
    });
  }

  protected pad(value: number) {
    return String(value).padStart(2, '0');
  }

  private showCaption(index: number, delay: number) {
    this.captions.update((items) => {
      const current = items[items.length - 1];
      return [
        { ...current, leaving: true },
        { index, key: current.key + 1, delay, leaving: false },
      ];
    });
    window.clearTimeout(this.captionTimer);
    this.captionTimer = window.setTimeout(() => {
      this.captions.update((items) => items.filter((item) => !item.leaving));
    }, 650);
  }
}
