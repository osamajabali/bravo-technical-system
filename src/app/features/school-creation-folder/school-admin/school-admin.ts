import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, OnInit, output, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookupItem } from '../../../core/models/shared-models/lookup-item.model';
import { Admin, AdminsRequest } from '../../../core/models/school-creation/admin.model';
import { SchoolCreationService } from '../../../core/services/school-creation/school-creation.service';
import { AutoFormErrorDirective } from '../../../shared/directives/auto-form-error.directive';
import { LoaderService } from '../../../shared/services/loader.service';
import { NoLeadingSpaceDirective } from '../../../shared/directives/no-leading-space.directive';
import { NgSelectCloseOnOtherClearDirective } from '../../../shared/directives/ng-select-close-on-other-clear.directive';

@Component({
  selector: 'app-school-admin',
  imports: [FormsModule, CommonModule, NgSelectModule, AutoFormErrorDirective, NoLeadingSpaceDirective, NgSelectCloseOnOtherClearDirective],
  templateUrl: './school-admin.html',
  styleUrl: './school-admin.scss'
})
export class SchoolAdmin implements OnInit {
  @ViewChild('adminForm') adminForm!: NgForm;
  @ViewChild('adminForm', { read: ElementRef }) adminFormRef!: ElementRef<HTMLFormElement>;
  grades = signal<LookupItem[]>([]);
  subjects = signal<LookupItem[]>([]);
  schoolCreationService = inject(SchoolCreationService);
  loaderService = inject(LoaderService);
  stepSuccess = output<void>();
  isStepValid = output<boolean>();
  filteredGrades = signal<LookupItem[]>([]);
  previousGradeIds: { [adminIndex: number]: { [gsIndex: number]: number | null } } = {};
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
    this.filteredGrades.set(this.grades());
    if (sessionStorage.getItem('admins')) {
      const admins = JSON.parse(sessionStorage.getItem('admins')).admins;
      admins.forEach((admin, adminIndex) => {
        admin.gradeSubjects.forEach((gs, gsIndex) => {
          gs.gradeId = gs.gradeId !== null ? +gs.gradeId : null;
          if (!this.previousGradeIds[adminIndex]) this.previousGradeIds[adminIndex] = {};
          this.previousGradeIds[adminIndex][gsIndex] = gs.gradeId;
          if (gs.gradeId != null) {
            this.onGradeChange(gs.gradeId, adminIndex, gsIndex);
          }
        });
      });
      this.fields.set(admins);
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

  addGradeSubject(adminIndex: number) {
    this.fields()[adminIndex].gradeSubjects.push({ gradeId: null, subjectIds: [] });
  }

  removeGradeSubject(adminIndex: number, gsIndex: number) {
    this.fields()[adminIndex].gradeSubjects.splice(gsIndex, 1);
  }

  onGradeChange(gradeId: number, adminIndex: number, gsIndex: number) {
    if (!this.previousGradeIds[adminIndex]) this.previousGradeIds[adminIndex] = {};
    const prevGradeId = this.previousGradeIds[adminIndex][gsIndex];
    // Remove the new grade from the available grades
    this.filteredGrades.set(this.filteredGrades().filter(g => g.id !== gradeId));
    // If there was a previous grade, return it to the available grades
    if (prevGradeId && prevGradeId !== gradeId) {
      const prevGrade = this.grades().find(g => g.id === prevGradeId);
      if (prevGrade) {
        const originalIndex = this.grades().findIndex(g => g.id === prevGradeId);
        const filtered = [...this.filteredGrades()];
        // Find where to insert in filteredGrades to match the original order
        let insertAt = filtered.findIndex(g => {
          const idx = this.grades().findIndex(og => og.id === g.id);
          return idx > originalIndex;
        });
        if (insertAt === -1) insertAt = filtered.length;
        filtered.splice(insertAt, 0, prevGrade);
        this.filteredGrades.set(filtered);
      }
    }
    // Update the tracker with the new gradeId
    this.previousGradeIds[adminIndex][gsIndex] = gradeId;
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

    // Show loader
    this.loaderService.showStepLoader(2);

    this.schoolCreationService.addAdmins(model).subscribe({
      next: (res) => {
        if (res.success) {
          sessionStorage.setItem('admins', JSON.stringify(model));
          this.stepSuccess.emit();
        }
        // Hide loader
        this.loaderService.hide();
      },
      error: (error) => {
        // Hide loader on error
        this.loaderService.hide();
        console.error('Error adding school admins:', error);
      }
    });
  }

  public triggerValidation() {
    if (this.adminFormRef?.nativeElement) {
      this.adminFormRef.nativeElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }
}
