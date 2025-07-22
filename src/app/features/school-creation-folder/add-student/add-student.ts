import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, output, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Configurations } from '../../../core/models/login/configrations';
import { AddTemplate } from '../../../core/models/school-creation/template.model';
import { SchoolCreationService } from '../../../core/services/school-creation/school-creation.service';
import { LoaderService } from '../../../shared/services/loader.service';
import { NoLeadingSpaceDirective } from '../../../shared/directives/no-leading-space.directive';

@Component({
  selector: 'app-add-student',
  imports: [CommonModule, FormsModule, NoLeadingSpaceDirective],
  templateUrl: './add-student.html',
  styleUrl: './add-student.scss'
})
export class AddStudent {
  @ViewChild('studentForm') studentForm!: NgForm;
  @ViewChild('studentForm', { read: ElementRef }) studentFormRef!: ElementRef<HTMLFormElement>;
  isStepValid = output<boolean>();

  fileSelected: boolean = false;
  validationResult: { success: boolean, message: string } | null = null;
  teachersData: any[] = [];
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
  isValidating = signal<boolean>(false);
  isValidated = signal<boolean>(false);
  validationSuccess = signal<boolean | null>(null); // null = not validated, true = success, false = errors
  mustValidate = signal<boolean>(true); // Require validation after file change
  validationError = signal<string>('');
  excelFileName = signal<string>('');

  ngOnInit(): void {
    this.configrations.set(JSON.parse(localStorage.getItem('configrations') || '{}'));
    this.requiredColumns.set(this.configrations()?.excelTemplates.find(template => template.id == 3)?.requiredFields || []);
    this.templateUrl.set(this.configrations()?.excelTemplates.find(template => template.id == 3)?.url || '');
    if (sessionStorage.getItem('studentDetails')) {
      const studentDetails = JSON.parse(sessionStorage.getItem('studentDetails'));
      this.excelFileName.set(studentDetails.excelFileName);
      this.isUpdateStep.set(true);
      this.mustValidate.set(false); // Allow submit if loaded from storage
      // Retrieve file from sessionStorage if present
      if (studentDetails.fileData && studentDetails.fileName && studentDetails.fileType) {
        const file = this.base64ToFile(studentDetails.fileData, studentDetails.fileName, studentDetails.fileType);
        this.selectedFile.set(file);
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
    this.selectedFile.set(file || null);
    this.isValidated.set(false);
    this.validationSuccess.set(null);
    this.backendErrors.set([]);
    this.mustValidate.set(true); // Require validation after file change
    this.validationError.set('');
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

      this.fileSelected = true;
    };
    reader.readAsBinaryString(file);
  }

  async onValidate(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;
    this.isValidating.set(true);
    this.isValidated.set(false);
    this.validationSuccess.set(null);
    this.backendErrors.set([]);
    this.mustValidate.set(false); // Validation done
    this.validationError.set('');
    // Prepare FormData for validation
    const formData = new FormData();
    formData.append('SchoolId', JSON.parse(sessionStorage.getItem('schoolDetails')).schoolId);
    formData.append('CourseType', JSON.parse(sessionStorage.getItem('courseType')));
    formData.append('excelType', '3'); // 3 for students
    formData.append('excelFile', file);
    this.schoolCreationService.validateExcel(formData).subscribe({
      next: (res) => {
        if (res.data && res.data.isSuccess === false) {
          const errors = (res.data.errors || []).map((err: any) => `Row ${err.rowNumber}, Column ${err.columnName}: ${err.errorMessage}`);
          this.backendErrors.set(errors.length ? errors : ['Unknown error occurred.']);
          this.validationSuccess.set(false);
        } else if (res.success) {
          this.validationSuccess.set(true);
          this.excelFileName.set(res.data.excelFileName);
        }
        this.isValidating.set(false);
        this.isValidated.set(true);
      },
      error: () => {
        this.backendErrors.set(['An error occurred while validating the file.']);
        this.validationSuccess.set(false);
        this.isValidating.set(false);
        this.isValidated.set(true);
      }
    });
  }

  onDeleteFile() {
    this.selectedFile.set(null);
    this.isValidated.set(false);
    this.validationSuccess.set(null);
    this.backendErrors.set([]);
    this.mustValidate.set(true); // Require validation after file change
    this.validationError.set('');
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid) {
      this.isStepValid.emit(false);
      return;
    }
    if (this.mustValidate()) {
      this.validationError.set('Please validate your file before submitting.');
      this.isStepValid.emit(false);
      return;
    }
    const selectedFile = this.selectedFile();
    if (!selectedFile) {
      this.isStepValid.emit(false);
      return;
    }
    const fileBase64 = await this.fileToBase64(selectedFile);
    let addStudent = {
      schoolId: JSON.parse(sessionStorage.getItem('schoolDetails')).schoolId,
      stepNumber: 6,
      isUpdateStep: this.isUpdateStep(),
      courseType: JSON.parse(sessionStorage.getItem('courseType')),
      excelFileName: this.excelFileName()
    };
    this.loaderService.showStepLoader(5);
    this.schoolCreationService.addStudent(addStudent).subscribe({
      next: (res) => {
        if (res.data && res.data.isSuccess === false) {
          const errors = (res.data.errors || []).map((err: any) => `Row ${err.rowNumber}, Column ${err.columnName}: ${err.errorMessage}`);
          this.backendErrors.set(errors.length ? errors : ['Unknown error occurred.']);
          this.isStepValid.emit(false);
          this.loaderService.hide();
          return;
        }
        if (res.success) {
          const storageData = {
            schoolId: JSON.parse(sessionStorage.getItem('schoolDetails')).schoolId,
            stepNumber: 6,
            isUpdateStep: this.isUpdateStep(),
            courseType: JSON.parse(sessionStorage.getItem('courseType')),
            excelFileName: this.excelFileName(),
            fileData: fileBase64,
            fileName: selectedFile.name,
            fileType: selectedFile.type
          };
          sessionStorage.setItem('studentDetails', JSON.stringify(storageData));
          this.isStepValid.emit(true);
          this.stepSuccess.emit();
        }
        this.loaderService.hide();
      },
      error: (error) => {
        this.loaderService.hide();
        console.error('Error adding students:', error);
        this.backendErrors.set(['An error occurred while adding students.']);
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
    if (this.studentFormRef?.nativeElement) {
      this.studentFormRef.nativeElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
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
      this.validationResult = {
        success: true,
        message: 'File successfully parsed. Preview shown below.'
      };
    };
    reader.readAsBinaryString(file);
  }


}