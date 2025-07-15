import { Component, inject, OnInit, output, signal, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SchoolCreationService } from '../../../core/services/school-creation/school-creation.service';
import { AddSchoolDetailsRequest } from '../../../core/models/school-creation/add-school-details-request.model';
import { LookUps } from '../../../core/services/look-ups.service';
import { City } from '../../../core/models/shared-models/city.model';
import { AutoFormErrorDirective } from '../../../shared/directives/auto-form-error.directive';

@Component({
  selector: 'app-school-details',
  imports: [FormsModule, NgSelectModule, AutoFormErrorDirective],
  templateUrl: './school-details.html',
  styleUrl: './school-details.scss'
})
export class SchoolDetails implements OnInit {
  schoolCreationService = inject(SchoolCreationService);
  lookUpsService = inject(LookUps);
  lookUps = inject(LookUps).lookups;
  schoolDetails: AddSchoolDetailsRequest = new AddSchoolDetailsRequest();
  cities = signal<City[]>([]);
  isStepValid = output<boolean>();
  stepSuccess = output<void>();
  @ViewChild('schoolForm', { read: ElementRef }) schoolFormRef!: ElementRef<HTMLFormElement>;

  ngOnInit(): void {
    if(sessionStorage.getItem('schoolDetails')){
      this.schoolDetails = JSON.parse(sessionStorage.getItem('schoolDetails') || '{}');
      this.getCities();
    }
  }

  onSubmit(form: NgForm) {
    this.isStepValid.emit(form.valid);
    if (form.invalid) {
      return;
    }
    this.schoolDetails.schoolId = 0;
    this.schoolDetails.stepNumber = 1;
    const formData = this.toFormData(this.schoolDetails);
    this.schoolCreationService.addSchoolDetails(formData).subscribe((res) => {
      if (res.success) {
        this.schoolDetails.schoolId = res.data.newSchoolId;
        sessionStorage.setItem('schoolDetails', JSON.stringify(this.schoolDetails));
        this.stepSuccess.emit();
      }
    });
  }

  public triggerValidation() {
    if (this.schoolFormRef?.nativeElement) {
      this.schoolFormRef.nativeElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }

  toFormData(model: AddSchoolDetailsRequest): FormData {
    const formData = new FormData();
    Object.entries(model).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });
    return formData;
  }

  getCities() {
    this.lookUpsService.getCities(this.schoolDetails.countryId).subscribe((res) => {
      if (res.success) {
        this.cities.set(res.data);
      }
    });
  }
}