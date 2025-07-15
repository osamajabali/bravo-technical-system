import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-teacher',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-teacher.html',
  styleUrl: './add-teacher.scss'
})
export class AddTeacher {
  fileSelected: boolean = false;
  validationResult: { success: boolean, message: string } | null = null;
  teachersData: any[] = [];
  uploadedData = signal<any[]>([]);


  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const binaryStr = e.target.result;
        const wb = XLSX.read(binaryStr, { type: 'binary' });

        // Assuming the first sheet is the one you want
        const ws = wb.Sheets[wb.SheetNames[0]];

        // Convert the data to JSON format
        this.uploadedData.set(XLSX.utils.sheet_to_json(ws).slice(0, 5));
        this.validationResult = {
          success: true,
          message: 'File successfully parsed. Preview shown below.'
        };
      };
      reader.readAsBinaryString(file);
    }
  }

  validateAndReadFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr = e.target.result;
      const wb = XLSX.read(binaryStr, { type: 'binary' });

      // Validate sheet structure and content
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Predefined template validation
      const isValid = this.validateTemplate(data);
      if (isValid) {
        this.teachersData = data;
        this.validationResult = { success: true, message: 'File is valid. Ready for import.' };
      } else {
        this.teachersData = [];
        this.validationResult = { success: false, message: 'Invalid file structure or content.' };
      }

      this.fileSelected = true;
    };
    reader.readAsBinaryString(file);
  }

  validateTemplate(data: any[]): boolean {
    // Check for correct columns and expected structure in the data
    const headers = data[0];
    const requiredHeaders = ['Teacher Name', 'Email', 'Phone Number', 'Section'];

    // Check if the first row matches the required headers
    return requiredHeaders.every((header, index) => headers[index] === header);
  }

  onSubmit(): void {
    // Trigger teacher import to the backend or process here
    console.log('Teachers Data for Import:', this.teachersData);
    // Call service to upload the teachers data to the server or process it as needed
  }
}