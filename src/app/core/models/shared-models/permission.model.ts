export interface Action {
  actionId: number;
  name: string;
}

export interface Menu {
  menuId: number;
  name: string;
  order: number;
  actions: Action[];
  children: Menu[];
}

export interface Permission {
  menus: Menu[];
} 