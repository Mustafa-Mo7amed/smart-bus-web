import {
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: 'button[appButtonLoading]',
  standalone: true,
})
export class ButtonLoadingDirective {
  isLoading = input(false, { alias: 'appButtonLoading' });

  private spinnerElement?: HTMLElement;
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      this.toggleLoading(this.isLoading());
    });
  }

  private toggleLoading(loading: boolean): void {
    const nativeElement = this.el.nativeElement as HTMLButtonElement;

    if (loading) {
      this.renderer.addClass(nativeElement, 'is-loading');
      this.renderer.setProperty(nativeElement, 'disabled', true);
      this.addSpinner(nativeElement);
    } else {
      this.renderer.removeClass(nativeElement, 'is-loading');
      this.renderer.setProperty(nativeElement, 'disabled', false);
      this.removeSpinner();
    }
  }

  private addSpinner(parent: HTMLElement): void {
    if (!this.spinnerElement) {
      this.spinnerElement = this.renderer.createElement('span');
      this.renderer.addClass(this.spinnerElement, 'spinner');
      this.renderer.appendChild(parent, this.spinnerElement);
    }
  }

  private removeSpinner(): void {
    if (this.spinnerElement) {
      this.renderer.removeChild(this.el.nativeElement, this.spinnerElement);
      this.spinnerElement = undefined;
    }
  }
}
