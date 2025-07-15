import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, output, signal, ViewChild, computed } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookUps } from '../../../core/services/look-ups.service';
import { Grade } from '../../../core/models/header-models/header.model';
import { SchoolCreationService } from '../../../core/services/school-creation/school-creation.service';
import { GradesAndSubjectsRequest } from '../../../core/models/school-creation/grades-and-subjects.model';
import { AutoFormErrorDirective } from '../../../shared/directives/auto-form-error.directive';

@Component({
  selector: 'app-grades-and-subjects',
  imports: [CommonModule , FormsModule, NgSelectModule, AutoFormErrorDirective],
  templateUrl: './grades-and-subjects.html',
  styleUrl: './grades-and-subjects.scss'
})
export class GradesAndSubjects implements OnInit {
  lookUpsService = inject(LookUps);
  schoolCreationService = inject(SchoolCreationService);
  gradesAndSubjectsRequest: GradesAndSubjectsRequest = new GradesAndSubjectsRequest();
  grades = signal<Grade[]>([]);
  subjects = inject(LookUps).lookups().subjects;
  isStepValid = output<boolean>();
  stepSuccess = output<void>();
  selectedGrade = signal<number[]>([]);
  availableGradesVersion = signal<number>(0);
  @ViewChild('gradesAndSubjectsForm', { read: ElementRef }) gradesAndSubjectsFormRef!: ElementRef<HTMLFormElement>;
  ngOnInit(): void {
    this.getGrades();
    if(sessionStorage.getItem('gradesAndSubjects')){
      this.gradesAndSubjectsRequest = JSON.parse(sessionStorage.getItem('gradesAndSubjects') || '{}');
    }
  }
  getGrades() {
    this.lookUpsService.getGrades([1]).subscribe((res) => {
      if (res.success) {
        this.grades.set(res.data);
      }
    });
  }

  addField() {
    this.gradesAndSubjectsRequest.gradeSubjects.push({ gradeId: null, subjectIds: [] });
  }

  removeField(index: number) {
    this.gradesAndSubjectsRequest.gradeSubjects.splice(index, 1);
  }

  getAvailableGrades(currentIndex: number) {
    // If no grade is selected in the current field, show all grades
    if (!this.gradesAndSubjectsRequest.gradeSubjects[currentIndex]?.gradeId) {
      return this.grades();
    }
    const selectedGradeIds = this.gradesAndSubjectsRequest.gradeSubjects
      .map((field, idx) => idx !== currentIndex ? field.gradeId : null)
      .filter(id => id !== null);
    return this.grades().filter(g => !selectedGradeIds.includes(g.gradeId));
  }


  submitGradesAndSubjects(form: NgForm) {
    this.isStepValid.emit(form.valid);
    if (form.invalid) {
      return;
    }
    let schoolId = JSON.parse(sessionStorage.getItem('schoolDetails') || '{}').schoolId;
      const model: GradesAndSubjectsRequest = {
      schoolId: schoolId,
      stepNumber: 2,
      gradeSubjects: this.gradesAndSubjectsRequest.gradeSubjects
    };
    this.schoolCreationService.addGradesAndSubjects(model).subscribe(res => {
      if (res.success) {
        sessionStorage.setItem('gradesAndSubjects', JSON.stringify(model));
        this.stepSuccess.emit();
      }
    });
  }

  public triggerValidation() {
    if (this.gradesAndSubjectsFormRef?.nativeElement) {
      this.gradesAndSubjectsFormRef.nativeElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }
}
