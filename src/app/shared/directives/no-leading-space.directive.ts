import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[noLeadingSpace]'
})
export class NoLeadingSpaceDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    if (input.value.startsWith(' ')) {
      input.value = input.value.replace(/^ +/, '');
      input.dispatchEvent(new Event('input'));
    }
  }
} 