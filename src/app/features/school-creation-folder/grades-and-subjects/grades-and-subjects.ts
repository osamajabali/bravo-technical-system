import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookUps } from '../../../core/services/look-ups.service';
import { Grade } from '../../../core/models/header-models/header.model';

@Component({
  selector: 'app-grades-and-subjects',
  imports: [CommonModule , FormsModule, NgSelectModule],
  templateUrl: './grades-and-subjects.html',
  styleUrl: './grades-and-subjects.scss'
})
export class GradesAndSubjects implements OnInit {
  lookUpsService = inject(LookUps);
  fields: any[] = [{ grade: '', subject: '' }];
  grades = signal<Grade[]>([]);
  subjects = inject(LookUps).lookups().subjects;
  ngOnInit(): void {
    this.getGrades();
  }
  getGrades() {
    this.lookUpsService.getGrades([1]).subscribe((res) => {
      if (res.success) {
        this.grades.set(res.data);
      }
    });
  }

  addField() {
    this.fields.push({ grade: '', subject: '' });
  }

  removeField(index: number) {
    this.fields.splice(index, 1);
  }

}
