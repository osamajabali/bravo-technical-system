import { Directive, OnInit, OnDestroy } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgSelectCoordinatorService } from '../services/ng-select-coordinator.service';

@Directive({
  selector: '[ngSelectCloseOnOtherClear]'
})
export class NgSelectCloseOnOtherClearDirective implements OnInit, OnDestroy {
  constructor(
    private ngSelect: NgSelectComponent,
    private coordinator: NgSelectCoordinatorService
  ) {}

  ngOnInit() {
    this.coordinator.register(this.ngSelect);
    this.ngSelect.clearEvent.subscribe(() => {
      this.coordinator.closeAllExcept(this.ngSelect);
    });
  }

  ngOnDestroy() {
    this.coordinator.unregister(this.ngSelect);
  }
} 