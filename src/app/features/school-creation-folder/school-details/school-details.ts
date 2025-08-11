import { Component, inject, OnInit, output, signal, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SchoolCreationService } from '../../../core/services/school-creation/school-creation.service';
import { AddSchoolDetailsRequest } from '../../../core/models/school-creation/add-school-details-request.model';
import { LookUps } from '../../../core/services/look-ups.service';
import { City } from '../../../core/models/shared-models/city.model';
import { AutoFormErrorDirective } from '../../../shared/directives/auto-form-error.directive';
import { LoaderService } from '../../../shared/services/loader.service';
import { RestrictNonNumericDirective } from '../../../shared/directives/restrict-non-numeric.directive';
import { NoLeadingSpaceDirective } from '../../../shared/directives/no-leading-space.directive';
import { NgSelectCloseOnOtherClearDirective } from '../../../shared/directives/ng-select-close-on-other-clear.directive';
import { AutoOpenDatePickerDirective } from '../../../shared/directives/auto-open-date-picker.directive';

@Component({
  selector: 'app-school-details',
  imports: [FormsModule, NgSelectModule, AutoFormErrorDirective, RestrictNonNumericDirective, NoLeadingSpaceDirective, NgSelectCloseOnOtherClearDirective, AutoOpenDatePickerDirective],
  templateUrl: './school-details.html',
  styleUrl: './school-details.scss'
})
export class SchoolDetails implements OnInit {
  schoolCreationService = inject(SchoolCreationService);
  lookUpsService = inject(LookUps);
  lookUps = inject(LookUps).lookups;
  loaderService = inject(LoaderService);
  schoolDetails = signal<AddSchoolDetailsRequest>(new AddSchoolDetailsRequest());
  cities = signal<City[]>([]);
  isStepValid = output<boolean>();
  stepSuccess = output<void>();
  courseType: number = 1;
  schoolLogoPreviewUrl = signal<string | null>(null);
  private logoBlobUrl: string | null = null;
  @ViewChild('schoolForm', { read: ElementRef }) schoolFormRef!: ElementRef<HTMLFormElement>;

  ngOnInit(): void {
    if (sessionStorage.getItem('schoolDetails')) {
      this.schoolDetails.set(JSON.parse(sessionStorage.getItem('schoolDetails') || '{}'));
      this.getCities();
      this.courseType = parseInt(sessionStorage.getItem('courseType') || '1');
      // Set preview if logoUrl exists
      let uploadedImage = JSON.parse(sessionStorage.getItem('uploadedLogo'));
      if (uploadedImage) {
        this.schoolLogoPreviewUrl.set(uploadedImage.base64);
        // this.schoolDetails().logo = uploadedImage;
      }
    }
  }

  onPrevious() {
    sessionStorage.setItem('schoolDetails', JSON.stringify(this.schoolDetails()));
  }

  onSubmit(form: NgForm) {
    this.isStepValid.emit(form.valid);
    if (form.invalid) {
      return;
    }

    // Show loader
    this.loaderService.showStepLoader(0);

    this.schoolDetails().schoolId = 0;
    this.schoolDetails().stepNumber = 1;
    const formData = this.toFormData(this.schoolDetails());
    this.schoolCreationService.addSchoolDetails(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.schoolDetails().schoolId = res.data.newSchoolId;
          sessionStorage.setItem('schoolDetails', JSON.stringify(this.schoolDetails()));
          sessionStorage.setItem('courseType', this.courseType.toString());
          this.stepSuccess.emit();
        }
        // Hide loader
        this.loaderService.hide();
      },
      error: (error) => {
        // Hide loader on error
        this.loaderService.hide();
        console.error('Error saving school details:', error);
      }
    });
  }

  public triggerValidation() {
    if (this.schoolFormRef?.nativeElement) {
      this.schoolFormRef.nativeElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }

  onLogoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Create a FileReader to convert the image to a base64 string
      const reader = new FileReader();

      reader.onloadend = () => {
        // Create an object to store file information and base64 string
        const fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          base64: reader.result as string
        };

        // Save the file information in session storage
        sessionStorage.setItem('uploadedLogo', JSON.stringify(fileInfo));

        // Update the schoolDetails object with the logo file
        this.schoolDetails().logo = file;

        // Clean up the previous blob URL if it exists
        if (this.logoBlobUrl) {
          URL.revokeObjectURL(this.logoBlobUrl);
        }

        // Create a new blob URL for the image
        const url = URL.createObjectURL(file);
        this.logoBlobUrl = url;

        // Set the school logo preview URL
        this.schoolLogoPreviewUrl.set(url);

        // Save the blob URL in school details (optional)
        this.schoolDetails().logoUrl = url;
      };

      // Convert the file to base64
      reader.readAsDataURL(file);
    }
  }


  ngOnDestroy() {
    if (this.logoBlobUrl) {
      URL.revokeObjectURL(this.logoBlobUrl);
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
    this.lookUpsService.getCities(this.schoolDetails().countryId).subscribe((res) => {
      if (res.success) {
        this.cities.set(res.data);
      }
    });
  }
}