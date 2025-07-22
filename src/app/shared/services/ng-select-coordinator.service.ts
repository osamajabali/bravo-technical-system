import { Injectable } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Injectable({ providedIn: 'root' })
export class NgSelectCoordinatorService {
  private openSelects: Set<NgSelectComponent> = new Set();

  register(select: NgSelectComponent) {
    this.openSelects.add(select);
  }

  unregister(select: NgSelectComponent) {
    this.openSelects.delete(select);
  }

  closeAllExcept(except: NgSelectComponent) {
    this.openSelects.forEach(select => {
      if (select !== except && select.isOpen) {
        select.close();
      }
    });
  }
} 