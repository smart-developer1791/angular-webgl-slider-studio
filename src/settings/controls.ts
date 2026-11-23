import {
  booleanAttribute,
  Component,
  computed,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'section[studioSection]',
  imports: [LucideDynamicIcon],
  host: { class: 'border-b border-white/[0.06]' },
  template: `
    <button
      type="button"
      [attr.aria-expanded]="open()"
      class="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.025]"
      (click)="open.update(toggle)"
    >
      <svg [lucideIcon]="icon()" class="size-4 text-white/45" [strokeWidth]="1.75"></svg>
      <span class="flex-1 text-[13px] font-semibold tracking-tight text-white/90">{{
        heading()
      }}</span>
      @if (aside() !== undefined) {
        <span class="font-mono text-[11px] text-white/35">{{ aside() }}</span>
      }
      <svg
        lucideIcon="chevron-down"
        class="size-4 text-white/35 transition-transform duration-300"
        [class.rotate-180]="open()"
      ></svg>
    </button>
    @if (open()) {
      <div class="space-y-5 px-5 pt-1 pb-6"><ng-content /></div>
    }
  `,
})
export class Section implements OnInit {
  readonly icon = input.required<string>();
  readonly heading = input.required<string>();
  readonly aside = input<string | number>();
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  protected readonly open = signal(false);
  protected readonly toggle = (open: boolean) => !open;

  ngOnInit() {
    this.open.set(this.defaultOpen());
  }
}

const BUTTON_VARIANTS = {
  primary: 'bg-[var(--ui-accent)] text-[var(--ui-on-accent)] hover:brightness-110',
  ghost: 'bg-white/[0.06] text-white/85 hover:bg-white/[0.1]',
  danger: 'bg-[#ff5a5a]/10 text-[#ff8c8c] hover:bg-[#ff5a5a]/20',
};

@Component({
  selector: 'button[studioButton]',
  imports: [LucideDynamicIcon],
  host: {
    type: 'button',
    class:
      'inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[12.5px] font-semibold transition disabled:pointer-events-none disabled:opacity-40',
    '[class]': 'variantClass()',
  },
  template: `
    @if (icon(); as iconName) {
      <svg [lucideIcon]="iconName" class="size-3.5" [strokeWidth]="2"></svg>
    }
    <ng-content />
  `,
})
export class StudioButton {
  readonly icon = input<string>();
  readonly variant = input<keyof typeof BUTTON_VARIANTS>('ghost');
  protected readonly variantClass = computed(() => BUTTON_VARIANTS[this.variant()]);
}

@Component({
  selector: 'button[studioIconButton]',
  imports: [LucideDynamicIcon],
  host: {
    type: 'button',
    '[attr.aria-label]': 'label()',
    '[title]': 'label()',
    class:
      'grid size-7 place-items-center rounded-md text-white/45 transition hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-25',
  },
  template: '<svg [lucideIcon]="icon()" class="size-3.5" [strokeWidth]="2"></svg>',
})
export class IconButton {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
}

@Component({
  selector: 'div[studioFieldLabel]',
  host: { class: 'mb-2 flex items-baseline justify-between gap-3' },
  template: `
    <span class="text-xs text-white/55">{{ label() }}</span>
    @if (value() !== undefined) {
      <span class="font-mono text-[11px] text-white/85 tabular-nums">{{ value() }}</span>
    }
  `,
})
export class FieldLabel {
  readonly label = input.required<string>();
  readonly value = input<string | number>();
}

@Component({
  selector: 'label[studioRange]',
  imports: [FieldLabel],
  host: { class: 'block' },
  template: `
    <div studioFieldLabel [label]="label()" [value]="displayValue()"></div>
    <input
      #range
      type="range"
      class="range"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [value]="value()"
      [style.--fill]="fill()"
      (input)="valueChange.emit(range.valueAsNumber)"
    />
  `,
})
export class RangeField {
  readonly label = input.required<string>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly step = input.required<number>();
  readonly format = input<(value: number) => string>();
  readonly value = input.required<number>();
  readonly valueChange = output<number>();
  protected readonly fill = computed(
    () => `${((this.value() - this.min()) / (this.max() - this.min())) * 100}%`,
  );
  protected readonly displayValue = computed(() => this.format()?.(this.value()) ?? this.value());
}

interface Option<T extends string | number> {
  value: T;
  label: string;
}

@Component({
  selector: 'div[studioSegmented]',
  imports: [FieldLabel],
  template: `
    @if (label(); as heading) {
      <div studioFieldLabel [label]="heading"></div>
    }
    <div class="flex rounded-lg bg-white/[0.05] p-0.5">
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="flex-1 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors"
          [class]="
            option.value === value()
              ? 'bg-white/[0.12] text-white shadow-sm'
              : 'text-white/45 hover:text-white/80'
          "
          (click)="valueChange.emit(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class Segmented<T extends string | number> {
  readonly label = input<string>();
  readonly options = input.required<readonly Option<T>[]>();
  readonly value = input.required<T>();
  readonly valueChange = output<T>();
}

@Component({
  selector: 'label[studioSelect]',
  imports: [FieldLabel, LucideDynamicIcon],
  host: { class: 'block' },
  template: `
    <div studioFieldLabel [label]="label()"></div>
    <div class="relative">
      <select #select class="field appearance-none pr-8" (change)="choose(select.selectedIndex)">
        @for (option of options(); track option.value) {
          <option [value]="option.value" [selected]="option.value === value()" class="bg-[#141417]">
            {{ option.label }}
          </option>
        }
      </select>
      <svg
        lucideIcon="chevron-down"
        class="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-white/40"
      ></svg>
    </div>
  `,
})
export class SelectField<T extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly Option<T>[]>();
  readonly value = input.required<T>();
  readonly valueChange = output<T>();

  protected choose(index: number) {
    const option = this.options()[index];
    if (option) this.valueChange.emit(option.value);
  }
}

@Component({
  selector: 'label[studioText]',
  imports: [FieldLabel],
  host: { class: 'block' },
  template: `
    <div studioFieldLabel [label]="label()"></div>
    @if (multiline()) {
      <textarea
        #field
        [value]="value()"
        [attr.placeholder]="placeholder()"
        rows="2"
        class="field resize-none leading-relaxed"
        (input)="valueChange.emit(field.value)"
      ></textarea>
    } @else {
      <input
        #field
        [value]="value()"
        [attr.placeholder]="placeholder()"
        class="field"
        (input)="valueChange.emit(field.value)"
      />
    }
  `,
})
export class TextField {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly placeholder = input<string>();
  readonly multiline = input(false, { transform: booleanAttribute });
  readonly valueChange = output<string>();
}

@Component({
  selector: 'div[studioColor]',
  imports: [FieldLabel],
  template: `
    <div studioFieldLabel [label]="label()"></div>
    <div class="flex items-center gap-2">
      <label
        class="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/10"
        [style.background]="value()"
      >
        <input
          #swatch
          [value]="value()"
          type="color"
          class="absolute inset-0 cursor-pointer opacity-0"
          (input)="valueChange.emit(swatch.value)"
        />
      </label>
      <input
        #hex
        [value]="draft() ?? value()"
        spellcheck="false"
        class="field font-mono uppercase"
        (input)="edit(hex.value)"
        (blur)="draft.set(null)"
      />
    </div>
  `,
})
export class ColorField {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly valueChange = output<string>();
  protected readonly draft = signal<string | null>(null);

  protected edit(text: string) {
    this.draft.set(text);
    if (/^#[0-9a-f]{6}$/i.test(text)) this.valueChange.emit(text.toLowerCase());
  }
}

@Component({
  selector: 'button[studioToggle]',
  host: {
    type: 'button',
    role: 'switch',
    '[attr.aria-checked]': 'checked()',
    class: 'flex w-full items-center gap-3 text-left',
    '(click)': 'checkedChange.emit(!checked())',
  },
  template: `
    <span class="flex-1">
      <span class="block text-[13px] text-white/85">{{ label() }}</span>
      @if (hint(); as details) {
        <span class="mt-0.5 block text-[11px] leading-snug text-white/40">{{ details }}</span>
      }
    </span>
    <span
      class="relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200"
      [style.background]="checked() ? 'var(--ui-accent)' : 'rgb(255 255 255 / 0.12)'"
    >
      <span
        class="absolute top-[3px] left-[3px] size-4 rounded-full shadow transition-transform duration-200"
        [style.transform]="checked() ? 'translateX(16px)' : 'none'"
        [style.background]="checked() ? 'var(--ui-on-accent)' : '#fff'"
      ></span>
    </span>
  `,
})
export class Toggle {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly checked = input.required<boolean>();
  readonly checkedChange = output<boolean>();
}
