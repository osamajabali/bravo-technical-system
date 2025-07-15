// action.model.ts
export interface Action {
  actionId: number;
  name: string;
}

// menu.model.ts
export interface Menu {
  menuId: number;
  name: string;
  order: number;
  actions: Action[];
  children: Menu[];
}

// user.model.ts
export class LoginResponse {
  fullName: string;
  username: string;
  token: string;
}