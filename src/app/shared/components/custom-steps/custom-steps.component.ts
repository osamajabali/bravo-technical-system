import { Component, input } from '@angular/core';

@Component({
  selector: 'app-custom-steps',
  templateUrl: './custom-steps.component.html',
  styleUrls: ['./custom-steps.component.scss']
})
export class CustomStepsComponent {
  items = input<StepItem[]>([]);
  activeIndex = input<number>(0);

  nextStep() {
    if (this.activeIndex() < this.items().length - 1) {
      {{this.activeIndex() + 1}};
    }
  }

  prevStep() {
    if (this.activeIndex() > 0) {
      {{this.activeIndex()-1}};
    }
  }
}


export interface StepItem {
  id: string;
  label: string;
  isStepCompleted: boolean;
}