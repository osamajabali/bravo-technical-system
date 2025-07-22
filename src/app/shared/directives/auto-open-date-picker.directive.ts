import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[autoOpenDatePicker]'
})
export class AutoOpenDatePickerDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('focus')
  @HostListener('click')
  openPicker() {
    this.el.nativeElement.showPicker?.();
  }
} 