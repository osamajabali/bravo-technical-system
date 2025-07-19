import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { StepItem, CustomStepsComponent } from '../../../shared/components/custom-steps/custom-steps.component';
import { SchoolDetails } from "../school-details/school-details";
import { CommonModule } from '@angular/common';
import { GradesAndSubjects } from "../grades-and-subjects/grades-and-subjects";
import { SchoolAdmin } from "../school-admin/school-admin";
import { CreateSection } from "../create-section/create-section";
import { AddStudent } from "../add-student/add-student";
import { LookUps } from '../../../core/services/look-ups.service';
import { GotPermissionDirective } from '../../../shared/directives/got-permission.directive';
import { ActionId } from '../../../core/models/shared-models/enums';
import { AddTeacher } from '../add-teacher/add-teacher';
import { AppLoaderComponent } from '../../../shared/components/app-loader/app-loader.component';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'app-school-creation',
  standalone: true,
  imports: [CustomStepsComponent, SchoolDetails, CommonModule, GradesAndSubjects, SchoolAdmin, CreateSection, AddTeacher, AddStudent, GotPermissionDirective, AppLoaderComponent],
  templateUrl: './school-creation.html',
  styleUrl: './school-creation.scss'
})
export class SchoolCreation implements OnInit {
  isStepValid = signal<boolean>(true);
  actionId = ActionId;
  @ViewChild('schoolDetailsRef') schoolDetailsRef!: SchoolDetails;
  @ViewChild('gradesAndSubjectsRef') gradesAndSubjectsRef!: GradesAndSubjects;
  @ViewChild('schoolAdminRef') schoolAdminRef!: SchoolAdmin;
  @ViewChild('createSectionRef') createSectionRef!: CreateSection;
  @ViewChild('addTeacherRef') addTeacherRef!: AddTeacher;
  @ViewChild('addStudentRef') addStudentRef!: AddStudent;
  items = signal<StepItem[]>([
    {
      id: '0',
      label: 'School Details',
      isStepCompleted: false,
    },
    {
      id: '1',
      label: 'Grades & Subjects',
      isStepCompleted: false,
    },
    {
      id: '2',
      label: 'Add School Admin',
      isStepCompleted: false,
    },
    {
      id: '3',
      label: 'Create Section',
      isStepCompleted: false,
    },
    {
      id: '4',
      label: 'Add Teachers',
      isStepCompleted: false,
    },
    {
      id: '5',
      label: 'Add Students',
      isStepCompleted: false,
    },
    {
      id: '6',
      label: 'Success',
      isStepCompleted: false,
    },
  ]);

  activeStep = signal<number>(0);

  lookUps = inject(LookUps);
  loaderService = inject(LoaderService);

  ngOnInit(): void {
    this.lookUps.mainLookups().subscribe((res) => {
      if (res.success) {
        this.lookUps.setLookups(res.data);
      }
    });
  }

  next() {
    // If on the first step and invalid, trigger validation in the child
    if (this.activeStep() === 0) {
      this.schoolDetailsRef?.triggerValidation();
      if (!this.isStepValid()) {
        return;
      }
    }
    if(this.activeStep() === 1){
      this.gradesAndSubjectsRef?.triggerValidation();
      if (!this.isStepValid()) {
        return;
      }
    }
    if(this.activeStep() === 2){
      this.schoolAdminRef?.triggerValidation();
      if (!this.isStepValid()) {
        return;
      }
    }
    if(this.activeStep() === 3){
      this.createSectionRef?.triggerValidation();
      if (!this.isStepValid()) {
        return;
      }
    }
    if(this.activeStep() === 4){
      this.addTeacherRef?.triggerValidation();
      if (!this.isStepValid()) {
        return;
      }
    }
    if(this.activeStep() === 5){
      this.addStudentRef?.triggerValidation();
      if (!this.isStepValid()) {
        return;
      }
    }
    }

  back() {
    this.activeStep.set(this.activeStep() - 1);

    this.updateStepsCompletion();
  }

  onStepSuccess() {
    // If we're on step 5 (Add Students), go to success step (6)
    if (this.activeStep() === 5) {
      this.activeStep.set(6);
    } else {
      this.activeStep.set(this.activeStep() + 1);
    }
    this.updateStepsCompletion();
  }

  updateStepsCompletion() {
    for (let i = 0; i < this.items().length; i++) {
      this.items()[i].isStepCompleted = i < this.activeStep();
    }
  }

  createNewSchool(): void {
    // Clear all sessionStorage data
    sessionStorage.clear();
    // Reset to step 1 (School Details)
    this.activeStep.set(0);
    // Reset steps completion
    this.updateStepsCompletion();
  }
}
