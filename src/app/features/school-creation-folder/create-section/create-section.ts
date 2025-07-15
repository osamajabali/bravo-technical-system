import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-create-section',
  imports: [CommonModule,FormsModule,NgSelectModule],
  templateUrl: './create-section.html',
  styleUrl: './create-section.scss'
})
export class CreateSection {
  fields: any[] = [{ grade: '', subject: '' }];

  addField() {
    this.fields.push({ grade: '', subject: '' });
  }

  removeField(index: number) {
    this.fields.splice(index, 1);
  }
}
