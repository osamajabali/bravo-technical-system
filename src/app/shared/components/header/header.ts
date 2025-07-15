import { CommonModule } from '@angular/common';
import { Component, DOCUMENT, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonDirective } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Popover, PopoverModule } from 'primeng/popover';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-header',
  standalone : true,
  imports: [
    CommonModule,
    FormsModule,
    PopoverModule,
    RadioButtonModule,
    MenuModule,
    TranslateModule
  ],
    templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
 @ViewChild('filterContent')
  filterContent: Popover;  // Get the reference to the popover
 // Data binding
  title: string = 'Page Title';  // You can dynamically set this value
  userName: string = localStorage.getItem('userName') || '';
  userInitials: string = this.userName.split(' ').map(name => name[0]).join('');
  displayFilter: string = 'Filter'; // You can dynamically set this
  SubjectExpanded: boolean = false;
  GradesExpanded: boolean = false;
  sectionExpanded: boolean = false;
  selectedSubjectId: string | null = null;
  selectedGradeId: string | null = null;
  selectedSectionId: string | null = null;

  // Classes data, can be fetched from a service or backend
  classesData = {
    subjects: [
      { subjectId: '1', name: 'Math' },
      { subjectId: '2', name: 'Science' },
      { subjectId: '3', name: 'English' }
    ],
    grades: [
      { gradeId: '1', name: 'Grade 1' },
      { gradeId: '2', name: 'Grade 2' }
    ],
    courseSections: [
      { courseSectionId: '1', name: 'Section A' },
      { courseSectionId: '2', name: 'Section B' }
    ]
  };

  // Menu items for the user profile menu
  userMenuItems = [
    { label: 'Profile', icon: 'pi pi-user', command: () => { /* Profile action */ } },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => { /* Logout action */ } }
  ];

  constructor(private translate: TranslateService) {}

  // Function to handle the back button action
  goBack() {
    // Implement the go back functionality, like navigating to the previous page
    console.log('Going back...');
  }

  // Function to handle filter option selection (like subject, grade, section)
  selectedItem(itemId: string, itemType: string) {
    if (itemType === 'subject') {
      this.selectedSubjectId = itemId;
    } else if (itemType === 'grade') {
      this.selectedGradeId = itemId;
    } else if (itemType === 'section') {
      this.selectedSectionId = itemId;
    }
  }

  // Function to apply the filter selection
  applyFilter(event: Event) {
    // Implement your filter logic here
    console.log('Filters applied');
  }

  // Function to refresh classes when the filter popover is hidden
  refreshClasses() {
    // Any necessary logic to refresh classes or reset states
    console.log('Refreshing classes...');
  }

  // Function to toggle between languages (for translating items)
  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  // Other helper methods can be added as required
}