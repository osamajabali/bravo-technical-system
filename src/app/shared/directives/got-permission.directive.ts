import { Directive, Input, ElementRef, Renderer2, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { SharedService } from '../../core/services/shared.service';
import { PermissionLoadingService } from '../../core/services/permission-loading.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[gotPermission]',
})
export class GotPermissionDirective implements OnInit, OnDestroy, AfterViewInit {
  @Input() gotPermission!: string; // permission in the form of "name, actionId"
  private isPermissionGranted: boolean = false;
  private permissionSubscription?: Subscription;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private sharedService: SharedService,
    private permissionLoadingService: PermissionLoadingService
  ) {}

  ngOnInit() {
    // Initially hide the element until permissions are loaded
    this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
  }

  ngAfterViewInit() {
    // Subscribe to permission loading events
    this.permissionSubscription = this.permissionLoadingService.permissionsLoaded$.subscribe(
      (permissionsLoaded) => {
        if (permissionsLoaded) {
          this.checkPermission();
        }
      }
    );

    // Also check immediately in case permissions are already loaded
    if (this.permissionLoadingService.isPermissionsLoaded()) {
      this.checkPermission();
    }
  }

  ngOnDestroy() {
    if (this.permissionSubscription) {
      this.permissionSubscription.unsubscribe();
    }
  }

  private checkPermission() {
    try {
      // First check if permissions are loaded
      if (!this.sharedService.isPermissionLoaded()) {
        // Permissions not loaded yet, hide element
        this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
        return;
      }

      const hasPermission = this.sharedService.hasPermission(this.gotPermission);

      if (hasPermission) {
        if (!this.isPermissionGranted) {
          this.isPermissionGranted = true;
          this.renderer.setStyle(this.el.nativeElement, 'display', 'block'); // Show element
        }
      } else {
        if (this.isPermissionGranted) {
          this.isPermissionGranted = false;
          this.renderer.setStyle(this.el.nativeElement, 'display', 'none'); // Hide element
        }
      }
    } catch (error) {
      console.warn('Error checking permission:', error);
      // On error, hide the element
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }
}
