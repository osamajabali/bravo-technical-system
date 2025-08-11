import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-bulk-sectioning-modal',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './bulk-sectioning-modal.html'
})
export class BulkSectioningModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() upload = new EventEmitter<File>();

  selectedFile: File | null = null;
  @ViewChild('bulkFileInput') bulkFileInput!: ElementRef<HTMLInputElement>;

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file || null;
  }

  onChangeFile(input: HTMLInputElement) {
    this.selectedFile = input.files && input.files.length ? input.files[0] : null;
  } 

  onClose() {
    this.selectedFile = null;
    this.close.emit();
  }

  onSubmit() {
    if (this.selectedFile) {
      this.upload.emit(this.selectedFile);
    }
  }
}

