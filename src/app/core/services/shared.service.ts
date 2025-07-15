import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  permission: any;

  setPermission(data: any) {
    this.permission = data;
  }

  getPermission() {
    return this.permission;
  }
  nextRoute: string = '/features/skills/skills-level-three';
  pagination: any ;
  private refreshSubject = new Subject<any>(); // Changed from void to any
  private apiResponseSubject = new BehaviorSubject<any>(null);
  translateService = inject(TranslateService)
  apiResponse$ = this.apiResponseSubject.asObservable();
  refresh$ = this.refreshSubject.asObservable();

  constructor() { }

  triggerRefresh(data: any) { // Accept data as a parameter
    this.refreshSubject.next(data); // Emit data with the refresh event
  }

  // Function to check if the user has the specified permission
  hasPermission(permission: string): boolean {
    const [name, actionId] = permission.split(',').map((s) => s.trim());

    // Ensure actionId is treated as a number
    const actionIdNum = parseInt(actionId, 10);

    const menu = this.getPermission().menus.find((menu) => menu.name === name);
    if (menu) {
      const child = menu.children.find((child) => child.name === name);
      if (child) {
        // Check if the actionId exists in the actions of the child menu
        return child.actions.some((action) => action.actionId === actionIdNum);
      }
    }

    return false;
  }
}
