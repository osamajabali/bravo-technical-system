import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, output, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import * as XLSX from 'xlsx';
import { SchoolCreationService } from '../../../core/services/school-creation/school-creation.service';
import { AutoFormErrorDirective } from '../../../shared/directives/auto-form-error.directive';
import { AddTemplate } from '../../../core/models/school-creation/template.model'; 
import { Configurations } from '../../../core/models/login/configrations';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'app-create-section',
  imports: [CommonModule, FormsModule, NgSelectModule, AutoFormErrorDirective],
  templateUrl: './create-section.html',
  styleUrl: './create-section.scss'
})
export class CreateSection implements OnInit{
  @ViewChild('sectionForm') sectionForm!: NgForm;
  @ViewChild('sectionForm', { read: ElementRef }) sectionFormRef!: ElementRef<HTMLFormElement>;
  isStepValid = output<boolean>();

  fileSelected: boolean = false;
  validationResult: { success: boolean, message: string } | null = null;
  teachersData: any[] = [];
  uploadedData = signal<any[]>([]);
  schoolCreationService = inject(SchoolCreationService);
  loaderService = inject(LoaderService);
  showError = signal<boolean>(false);
  // Table columns and sample row for the required Excel format
  requiredColumns = signal<string[]>([]);
  templateUrl = signal<string>('');
  selectedFile = signal<File | null>(null);
  isUpdateStep = signal<boolean>(false);
  configrations = signal<Configurations | null>(null);
  backendErrors = signal<string[]>([]);
  stepSuccess = output<void>();

  ngOnInit(): void {
    this.configrations.set(JSON.parse(localStorage.getItem('configrations') || '{}'));
    this.requiredColumns.set(this.configrations()?.excelTemplates.find(template => template.id == 1)?.requiredFields || []);
    this.templateUrl.set(this.configrations()?.excelTemplates.find(template => template.id == 1)?.url || '');
    
    if (sessionStorage.getItem('sectionDetails')) {
      const sectionDetails = JSON.parse(sessionStorage.getItem('sectionDetails'));
      this.isUpdateStep.set(true);

      // Retrieve file from sessionStorage if present
      if (sectionDetails.fileData && sectionDetails.fileName && sectionDetails.fileType) {
        // Reconstruct the File object from base64 data
        const file = this.base64ToFile(sectionDetails.fileData, sectionDetails.fileName, sectionDetails.fileType);
        this.selectedFile.set(file);
        // Trigger file processing and preview
        this.processFileForPreview(file);
      }
    }
  }

  
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processFileForPreview(file);
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
        this.teachersData = data;
        this.validationResult = { success: true, message: 'File is valid. Ready for import.' };
        // Set uploadedData for preview (excluding header row)
        this.uploadedData.set(data);

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

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid) {
      this.isStepValid.emit(false);
      return;
    }

    const selectedFile = this.selectedFile();
    if (!selectedFile) {
      this.isStepValid.emit(false);
      return;
    }

    // Convert file to base64 for storage
    const fileBase64 = await this.fileToBase64(selectedFile);
    
    let addSection = {
      schoolId: JSON.parse(sessionStorage.getItem('schoolDetails')).schoolId,
      stepNumber: 4,
      isUpdateStep: this.isUpdateStep(),
      courseType: JSON.parse(sessionStorage.getItem('courseType')),
      sectionsExcel: selectedFile, // Keep original file for API call
      fileData: fileBase64, // Store base64 for sessionStorage
      fileName: selectedFile.name,
      fileType: selectedFile.type
    };

    // Show loader
    this.loaderService.showStepLoader(3);

    let formData = this.toFormData(addSection);
    this.schoolCreationService.addSection(formData).subscribe({
      next: (res) => {
        // Check for backend error
        if (res.data && res.data.isSuccess === false) {
          // Map ErrorDetail[] to string[] for display
          const errors = (res.data.errors || []).map((err: any) => `Row ${err.rowNumber}, Column ${err.columnName}: ${err.errorMessage}`);
          this.backendErrors.set(errors.length ? errors : ['Unknown error occurred.']);
          this.isStepValid.emit(false);
          // Hide loader
          this.loaderService.hide();
          return;
        }
        if (res.success) {
          // Store in sessionStorage without the File object
          const storageData = {
            schoolId: addSection.schoolId,
            stepNumber: addSection.stepNumber,
            isUpdateStep: addSection.isUpdateStep,
            courseType: addSection.courseType,
            fileData: addSection.fileData,
            fileName: addSection.fileName,
            fileType: addSection.fileType
          };
          sessionStorage.setItem('sectionDetails', JSON.stringify(storageData));
          this.isStepValid.emit(true);
          this.stepSuccess.emit();
        }
        // Hide loader
        this.loaderService.hide();
      },
      error: (error) => {
        // Hide loader on error
        this.loaderService.hide();
        console.error('Error creating sections:', error);
        this.backendErrors.set(['An error occurred while creating sections.']);
        this.isStepValid.emit(false);
      }
    });
  }

  toFormData(model: AddTemplate): FormData {
    const formData = new FormData();
    Object.entries(model).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });
    return formData;
  }

  public triggerValidation() {
    if (this.sectionFormRef?.nativeElement) {
      this.sectionFormRef.nativeElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }

  // Convert File to base64 string
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Convert base64 back to File
  private base64ToFile(base64: string, filename: string, mimeType: string): File {
    const arr = base64.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mimeType });
  }

  private processFileForPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr = e.target.result;
      const wb = XLSX.read(binaryStr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      this.uploadedData.set(XLSX.utils.sheet_to_json(ws).slice(0, 5));
      this.validationResult = {
        success: true,
        message: 'File successfully parsed. Preview shown below.'
      };
    };
    reader.readAsBinaryString(file);
  }


}