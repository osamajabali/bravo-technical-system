import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionLoadingService {
  private permissionsLoaded = signal<boolean>(false);
  private permissionsLoadedSubject = new BehaviorSubject<boolean>(false);
  
  permissionsLoaded$ = this.permissionsLoadedSubject.asObservable();

  setPermissionsLoaded(loaded: boolean) {
    this.permissionsLoaded.set(loaded);
    this.permissionsLoadedSubject.next(loaded);
  }

  isPermissionsLoaded(): boolean {
    return this.permissionsLoaded();
  }
} 