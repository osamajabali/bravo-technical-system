import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, output, signal, ViewChild, computed } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookUps } from '../../../core/services/look-ups.service';
import { Grade } from '../../../core/models/header-models/header.model';
import { SchoolCreationService } from '../../../core/services/school-creation/school-creation.service';
import { GradesAndSubjectsRequest } from '../../../core/models/school-creation/grades-and-subjects.model';
import { AutoFormErrorDirective } from '../../../shared/directives/auto-form-error.directive';
import { LoaderService } from '../../../shared/services/loader.service';
import { NoLeadingSpaceDirective } from '../../../shared/directives/no-leading-space.directive';
import { NgSelectCloseOnOtherClearDirective } from '../../../shared/directives/ng-select-close-on-other-clear.directive';

@Component({
  selector: 'app-grades-and-subjects',
  imports: [CommonModule , FormsModule, NgSelectModule, AutoFormErrorDirective, NgSelectCloseOnOtherClearDirective],
  templateUrl: './grades-and-subjects.html',
  styleUrl: './grades-and-subjects.scss'
})
export class GradesAndSubjects implements OnInit {
  lookUpsService = inject(LookUps);
  schoolCreationService = inject(SchoolCreationService);
  loaderService = inject(LoaderService);
  gradesAndSubjectsRequest: GradesAndSubjectsRequest = new GradesAndSubjectsRequest();
  grades = signal<Grade[]>([]);
  filteredGrades = signal<Grade[]>([]);
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
      this.gradesAndSubjectsRequest.isUpdateStep = true;
    }
  }
  getGrades() {
    this.lookUpsService.getGrades([1]).subscribe((res) => {
      if (res.success) {
        this.grades.set(res.data);
        this.filteredGrades.set(res.data);
      }
    });
  }
  onGradeChange(gradeId: number , index: number) {
    // let checkGrade = this.filteredGrades().find(g => g.id === gradeId);
    // if(checkGrade){
    //   this.filteredGrades.set(this.filteredGrades().filter(g => g.id !== gradeId));
    // }else{
    //   const gradeToAdd = this.grades().find(g => g.id === gradeId);
    //   if (gradeToAdd) {
    //     this.filteredGrades.set([...this.filteredGrades(), gradeToAdd]);
    //   }
    // }
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
    return this.grades().filter(g => !selectedGradeIds.includes(g.id));
  }


  submitGradesAndSubjects(form: NgForm) {
    this.isStepValid.emit(form.valid);
    if (form.invalid) {
      return;
    }
    // Extract unique selected grade IDs
    const selectedGradeIds = [
      ...new Set(this.gradesAndSubjectsRequest.gradeSubjects.map(g => g.gradeId).filter(id => id !== null))
    ];

    // Map to {id, name} using grades() (find by id, not gradeId)
    const selectedGrades = selectedGradeIds.map(id => {
      const grade = this.grades().find(g => (g as any).id === id);
      // Use id if present, otherwise gradeId
      return grade ? { id: (grade as any).id ?? grade.id, name: grade.name } : null;
    }).filter(g => g !== null);

    // Extract all selected subject IDs (flattened)
    const selectedSubjectIds = [
      ...new Set(
        this.gradesAndSubjectsRequest.gradeSubjects
          .flatMap(g => g.subjectIds)
          .filter(id => id !== null)
      )
    ];

    // Map to {id, name} using subjects
    const selectedSubjects = selectedSubjectIds.map(id => {
      const subject = this.subjects.find(s => s.id === id);
      return subject ? { id: subject.id, name: subject.name } : null;
    }).filter(s => s !== null);

    // Store in sessionStorage
    sessionStorage.setItem('selectedGrades', JSON.stringify(selectedGrades));
    sessionStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));

    let schoolId = JSON.parse(sessionStorage.getItem('schoolDetails') || '{}').schoolId;
      const model: GradesAndSubjectsRequest = {
      schoolId: schoolId,
      stepNumber: 2,
      isUpdateStep: this.gradesAndSubjectsRequest.isUpdateStep,
      gradeSubjects: this.gradesAndSubjectsRequest.gradeSubjects
    };
    
    // Show loader
    this.loaderService.showStepLoader(1);
    
    this.schoolCreationService.addGradesAndSubjects(model).subscribe({
      next: (res) => {
        if (res.success) {
          sessionStorage.setItem('gradesAndSubjects', JSON.stringify(model));
          this.stepSuccess.emit();
        }
        // Hide loader
        this.loaderService.hide();
      },
      error: (error) => {
        // Hide loader on error
        this.loaderService.hide();
        console.error('Error saving grades and subjects:', error);
      }
    });
  }

  public triggerValidation() {
    if (this.gradesAndSubjectsFormRef?.nativeElement) {
      this.gradesAndSubjectsFormRef.nativeElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }
}
