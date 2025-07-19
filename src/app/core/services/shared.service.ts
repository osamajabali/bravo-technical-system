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

  // Check if permissions are loaded
  isPermissionLoaded(): boolean {
    const permissionData = this.getPermission();
    return !!(permissionData && permissionData.menus && Array.isArray(permissionData.menus));
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
    // Check if permission data exists
    const permissionData = this.getPermission();
    
    if (!permissionData || !permissionData.menus) {
      return false; // Return false if no permission data is available
    }

    const [name, actionId] = permission.split(',').map((s) => s.trim());

    // Ensure actionId is treated as a number
    const actionIdNum = parseInt(actionId, 10);

    // Search through all menus and their children
    for (const menu of permissionData.menus) {
      // Check if the menu itself has the required permission
      if (menu.name === name && menu.actions) {
        const hasAction = menu.actions.some((action) => action.actionId === actionIdNum);
        if (hasAction) {
          return true;
        }
      }
      
      // Check children of the menu
      if (menu.children) {
        for (const child of menu.children) {
          if (child.name === name && child.actions) {
            const hasAction = child.actions.some((action) => action.actionId === actionIdNum);
            if (hasAction) {
              return true;
            }
          }
          
          // Check grandchildren if they exist
          if (child.children) {
            for (const grandchild of child.children) {
              if (grandchild.name === name && grandchild.actions) {
                const hasAction = grandchild.actions.some((action) => action.actionId === actionIdNum);
                if (hasAction) {
                  return true;
                }
              }
            }
          }
        }
      }
    }

    return false;
  }
}
