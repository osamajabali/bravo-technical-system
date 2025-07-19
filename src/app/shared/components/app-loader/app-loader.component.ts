import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-loader-overlay" *ngIf="isLoading">
      <div class="app-loader-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div class="loader-message mt-3" *ngIf="message">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .app-loader-container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      text-align: center;
      min-width: 200px;
    }

    .loader-message {
      color: #666;
      font-size: 0.9rem;
      margin-top: 1rem;
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
  `]
})
export class AppLoaderComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = '';
} 