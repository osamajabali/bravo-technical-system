import { Component, inject, OnInit } from '@angular/core';
import { Header } from "../../shared/components/header/header";
import { SideBar } from "../../shared/components/side-bar/side-bar";
import { RouterOutlet } from '@angular/router';
import { SharedService } from '../../core/services/shared.service';
import { LoginService } from '../../core/services/login-services/login.service';

@Component({
  selector: 'app-main-layout',
  imports: [Header, SideBar, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit{
  loginService = inject(LoginService);
  sharedService = inject(SharedService);
  
  ngOnInit(): void {
    this.loginService.getPermission().subscribe((res) => {
      if (res.success) {
        this.sharedService.setPermission(res.data);
      }
    });
  }

}
