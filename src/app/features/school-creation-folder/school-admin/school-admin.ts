import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, OnInit, output, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookupItem } from '../../../core/models/shared-models/lookup-item.model';
import { Admin, AdminsRequest } from '../../../core/models/school-creation/admin.model';
import { SchoolCreationService } from '../../../core/services/school-creation/school-creation.service';
import { AutoFormErrorDirective } from '../../../shared/directives/auto-form-error.directive';

@Component({
  selector: 'app-school-admin',
  imports: [FormsModule, CommonModule, NgSelectModule, AutoFormErrorDirective],
  templateUrl: './school-admin.html',
  styleUrl: './school-admin.scss'
})
export class SchoolAdmin implements OnInit {
  @ViewChild('adminForm') adminForm!: NgForm;
  @ViewChild('adminForm', { read: ElementRef }) adminFormRef!: ElementRef<HTMLFormElement>;
  grades = signal<LookupItem[]>([]);
  subjects = signal<LookupItem[]>([]);
  schoolCreationService = inject(SchoolCreationService);
  stepSuccess = output<void>();
  isStepValid = output<boolean>();
  // Each admin field is of type Admin, but with UI helpers for selection
  fields = signal<Admin[]>([{
    genderId: null,
    nameEnglishFirst: '',
    nameEnglishMiddle: '',
    nameEnglishLast: '',
    nameArabicFirst: '',
    nameArabicMiddle: '',
    nameArabicLast: '',
    email: '',
    phoneNumber: '',
    gradeSubjects: [{ gradeId: null, subjectIds: [] }]
  }]);

  ngOnInit(): void {
    this.grades.set(JSON.parse(sessionStorage.getItem('selectedGrades') || '[]'));
    this.subjects.set(JSON.parse(sessionStorage.getItem('selectedSubjects') || '[]'));
    if (sessionStorage.getItem('admins')) {
      this.fields.set(JSON.parse(sessionStorage.getItem('admins')).admins);
    }
  }

  addField() {
    this.fields().push({
      genderId: null,
      nameEnglishFirst: '',
      nameEnglishMiddle: '',
      nameEnglishLast: '',
      nameArabicFirst: '',
      nameArabicMiddle: '',
      nameArabicLast: '',
      email: '',
      phoneNumber: '',
      gradeSubjects: [{ gradeId: null, subjectIds: [] }]
    });
  }

  removeField(index: number) {
    this.fields().splice(index, 1);
  }

  onSubmit() {
    this.isStepValid.emit(this.adminForm.valid);
    if (this.adminForm.invalid) {
      return;
    }
    let schoolId = JSON.parse(sessionStorage.getItem('schoolDetails') || '{}').schoolId;
    const model: AdminsRequest = {
      schoolId: schoolId,
      stepNumber: 3,
      isUpdateStep: sessionStorage.getItem('admins') ? true : false,
      admins: this.fields()
    };

    this.schoolCreationService.addAdmins(model).subscribe(res => {
      if (res.success) {
        sessionStorage.setItem('admins', JSON.stringify(model));
        this.stepSuccess.emit();
      }
    });
  }

  public triggerValidation() {
    if (this.adminFormRef?.nativeElement) {
      this.adminFormRef.nativeElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }
}
