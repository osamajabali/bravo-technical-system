import { Component, DOCUMENT, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayout } from "./features/main-layout/main-layout";
import { isPlatformBrowser } from '@angular/common';
import { SharedService } from './core/services/shared.service';
import { LoginService } from './core/services/login-services/login.service';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  primeng = inject(PrimeNG);
  
  constructor(
    private translate: TranslateService,
    private authService: LoginService,
    private sharedService: SharedService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.setLanguage();
  }

  ngOnInit(): void {
    this.primeng.ripple.set(true);

  }

  setLanguage() {
    // Check if we are on the browser before accessing localStorage
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('language');
      if (savedLang) {
        this.translate.setDefaultLang(savedLang);
        this.setDirection(savedLang);
      } else {
        this.translate.setDefaultLang('en');
        this.setDirection('en');
      }
    } else {
      // For SSR, set a fallback default language (can be 'en' or any default value)
      this.translate.setDefaultLang('en');
    }
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.setDirection(lang);
  }

  setDirection(lang: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang)
      this.document.documentElement.lang = lang;
      this.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }
}
