import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-school-admin',
  imports: [FormsModule,CommonModule,NgSelectModule],
  templateUrl: './school-admin.html',
  styleUrl: './school-admin.scss'
})
export class SchoolAdmin {
  fields: any[] = [{ grade: '', subject: '' }];

  addField() {
    this.fields.push({ grade: '', subject: '' });
  }

  removeField(index: number) {
    this.fields.splice(index, 1);
  }
}
