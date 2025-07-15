import { Directive, Input, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../core/services/shared.service';

@Directive({
  selector: '[gotPermission]',
})
export class GotPermissionDirective implements OnInit, OnDestroy {
  @Input() gotPermission!: string; // permission in the form of "name, actionId"
  private isPermissionGranted: boolean = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.checkPermission();
  }

  ngOnDestroy() {
    // Cleanup logic if needed
  }

  private checkPermission() {
    if (this.sharedService.hasPermission(this.gotPermission)) {
      this.isPermissionGranted = true;
      this.renderer.setStyle(this.el.nativeElement, 'display', 'block'); // Show element
    } else {
      this.isPermissionGranted = false;
      this.renderer.removeChild(this.el.nativeElement.parentNode, this.el.nativeElement);
    }
  }
}
