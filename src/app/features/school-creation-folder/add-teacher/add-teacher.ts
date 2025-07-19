import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, output, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Configurations } from '../../../core/models/login/configrations';
import { AddTemplate } from '../../../core/models/school-creation/template.model';
import { SchoolCreationService } from '../../../core/services/school-creation/school-creation.service';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'app-add-teacher',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-teacher.html',
  styleUrl: './add-teacher.scss'
})
export class AddTeacher {
  @ViewChild('teacherForm') teacherForm!: NgForm;
  @ViewChild('teacherForm', { read: ElementRef }) teacherFormRef!: ElementRef<HTMLFormElement>;
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
  selectedFile = signal<File | null>(null);
  isUpdateStep = signal<boolean>(false);
  configrations = signal<Configurations | null>(null);
  backendErrors = signal<string[]>([]);
  templateUrl = signal<string>('');
  stepSuccess = output<void>();

  ngOnInit(): void {
    this.configrations.set(JSON.parse(localStorage.getItem('configrations') || '{}'));
    this.requiredColumns.set(this.configrations()?.excelTemplates.find(template => template.id == 2)?.requiredFields || []);
    this.templateUrl.set(this.configrations()?.excelTemplates.find(template => template.id == 2)?.url || '');
    if (sessionStorage.getItem('teacherDetails')) {
      const teacherDetails = JSON.parse(sessionStorage.getItem('teacherDetails'));
      this.isUpdateStep.set(true);

      // Retrieve file from sessionStorage if present
      if (teacherDetails.fileData && teacherDetails.fileName && teacherDetails.fileType) {
        // Reconstruct the File object from base64 data
        const file = this.base64ToFile(teacherDetails.fileData, teacherDetails.fileName, teacherDetails.fileType);
        this.selectedFile.set(file);
        // Trigger file processing and preview
        this.processFileForPreview(file);
      }
    }
  }

  // Method to ensure HTTPS URLs for template downloads
  getSecureTemplateUrl(): string {
    const template = this.configrations()?.excelTemplates.find(template => template.id == 1);
    if (!template?.url) return '';
    
    // If the URL is already HTTPS, return as is
    if (template.url.startsWith('https://')) {
      return template.url;
    }
    
    // If it's HTTP, try to convert to HTTPS
    if (template.url.startsWith('http://')) {
      return template.url.replace('http://', 'https://');
    }
    
    // If it's a relative URL or doesn't start with http/https, return as is
    return template.url;
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
        this.teachersData = data;
        this.validationResult = { success: true, message: 'File is valid. Ready for import.' };
        // Set uploadedData for preview (excluding header row)
        this.uploadedData.set(data);

      this.fileSelected = true;
    };
    reader.readAsBinaryString(file);
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
    
    let addTeacher = {
      schoolId: JSON.parse(sessionStorage.getItem('schoolDetails')).schoolId,
      stepNumber: 5,  
      isUpdateStep: this.isUpdateStep(),
      courseType: JSON.parse(sessionStorage.getItem('courseType')),
      systemStatusId: JSON.parse(sessionStorage.getItem('schoolDetails')).systemStatusId,
      teachersExcel: selectedFile, // Keep original file for API call
      fileData: fileBase64, // Store base64 for sessionStorage
      fileName: selectedFile.name,
      fileType: selectedFile.type
    };

    // Show loader
    this.loaderService.showStepLoader(4);

    let formData = this.toFormData(addTeacher);
    this.schoolCreationService.addTeacher(formData).subscribe({
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
            schoolId: addTeacher.schoolId,
            stepNumber: addTeacher.stepNumber,
            isUpdateStep: addTeacher.isUpdateStep,
            courseType: addTeacher.courseType,
            fileData: addTeacher.fileData,
            fileName: addTeacher.fileName,
            fileType: addTeacher.fileType
          };
          sessionStorage.setItem('teacherDetails', JSON.stringify(storageData));
          this.isStepValid.emit(true);
          this.stepSuccess.emit();
        }
        // Hide loader
        this.loaderService.hide();
      },
      error: (error) => {
        // Hide loader on error
        this.loaderService.hide();
        console.error('Error adding teachers:', error);
        this.backendErrors.set(['An error occurred while adding teachers.']);
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
    if (this.teacherFormRef?.nativeElement) {
      this.teacherFormRef.nativeElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
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