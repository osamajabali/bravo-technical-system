import { Component, inject, OnInit, signal } from '@angular/core';
import { StepItem, CustomStepsComponent } from '../../../shared/components/custom-steps/custom-steps.component';
import { SchoolDetails } from "../school-details/school-details";
import { CommonModule } from '@angular/common';
import { GradesAndSubjects } from "../grades-and-subjects/grades-and-subjects";
import { SchoolAdmin } from "../school-admin/school-admin";
import { CreateSection } from "../create-section/create-section";
import { AddTeacher } from "../add-teacher/add-teacher";
import { AddStudent } from "../add-student/add-student";
import { LookUps } from '../../../core/services/look-ups.service';

@Component({
  selector: 'app-school-creation',
  standalone : true,
  imports: [CustomStepsComponent, SchoolDetails, CommonModule, GradesAndSubjects, SchoolAdmin, CreateSection, AddTeacher, AddStudent],
  templateUrl: './school-creation.html',
  styleUrl: './school-creation.scss'
})
export class SchoolCreation implements OnInit {

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
  ]);

  activeStep = signal<number>(0);

  lookUps = inject(LookUps);

  ngOnInit(): void {
    this.lookUps.mainLookups().subscribe((res) => {
      if(res.success){
        this.lookUps.setLookups(res.data);
      }
    });
  }
  
  next() {

    this.activeStep.set(this.activeStep() + 1);

    this.updateStepsCompletion();
  }

  back() {
    this.activeStep.set(this.activeStep() - 1);

    this.updateStepsCompletion();
  }

    updateStepsCompletion() {
    for (let i = 0; i < this.items().length; i++) {
      this.items()[i].isStepCompleted = i < this.activeStep();
    }
  }
}
