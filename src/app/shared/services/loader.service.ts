import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private isLoading = signal<boolean>(false);
  private message = signal<string>('');

  // Getters for the signals
  getIsLoading() {
    return this.isLoading;
  }

  getMessage() {
    return this.message;
  }

  // Show loader with optional message
  show(message: string = 'Loading...') {
    this.message.set(message);
    this.isLoading.set(true);
  }

  // Hide loader
  hide() {
    this.isLoading.set(false);
    this.message.set('');
  }

  // Show loader with step-specific messages
  showStepLoader(stepNumber: number) {
    const messages = {
      0: 'Saving school details...',
      1: 'Saving grades and subjects...',
      2: 'Adding school admin...',
      3: 'Creating sections...',
      4: 'Adding teachers...',
      5: 'Adding students...'
    };
    
    this.show(messages[stepNumber as keyof typeof messages] || 'Processing...');
  }
} 