import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookupItem } from '../../../core/models/shared-models/lookup-item.model';
import { NewYearService } from '../../../core/services/new-year/new-year.service';
import { LookUps } from '../../../core/services/look-ups.service';
import { StartNewYearStudentsResponse } from '../../../core/models/new-year/start-new-year.models';
import { BulkSectioningModalComponent } from './bulk-sectioning-modal';

@Component({
  selector: 'app-start-new-year',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BulkSectioningModalComponent],
  templateUrl: './start-new-year.html',
  styleUrl: './start-new-year.scss'
})
export class StartNewYearComponent {
  private router = inject(Router);
  private newYearService = inject(NewYearService);
  lookUps = inject(LookUps);

  schoolId: number | null = null;
  activeTab: 'school' | 'student' = 'student';

  selectedGradeId: number | null = null;
  selectedHomeroomId: number | null = null;

  searchTerm = signal<string>('');
  loading = signal<boolean>(false);

  pageSize = signal<number>(25);
  summary = signal<StartNewYearStudentsResponse | null>(null);
  students = signal<any[]>([]);
  filteredStudents = signal<any[]>([]);
  showBulkModal = signal<boolean>(false);

  ngOnInit(): void {
    const storedId = sessionStorage.getItem('selectedSchoolId');
    this.schoolId = storedId ? Number(storedId) : null;
    this.loadSchoolInfo();
  }

  switchTab(tab: 'school' | 'student') {
    this.activeTab = tab;
  }

  onSearch() {
    // No students API yet; keep client-side filter only
    this.applyFilters();
  }

  onSearchTermChange(term: string) {
    this.searchTerm.set(term || '');
    this.applyFilters();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    // No server-side paging yet; keep client-side for now
    this.applyFilters();
  }

  loadSchoolInfo() {
    if (this.schoolId == null) return;
    this.loading.set(true);
    this.newYearService.getSchoolInfo(this.schoolId).subscribe({
      next: (res) => {
        const payload = Array.isArray(res?.data) ? res.data[0] : res?.data;
        this.summary.set(payload || null);
        const gradesFromSummary = (payload?.gradesList || []).map((g: any) => ({ id: g.gradeId, name: g.nameEnglish, optionalValue: null } as LookupItem));
        this.loading.set(false);
      },
      error: () => {
        this.summary.set(null);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    const t = (this.searchTerm() || '').toLowerCase().trim();
    const base = this.students();
    const filtered = t
      ? base.filter(s =>
          (`${s.school.nameEnglish || ''}`.toLowerCase().includes(t)) ||
          (`${s.school.nameArabic || ''}`.toLowerCase().includes(t))
        )
      : base;
    this.filteredStudents.set(filtered);
  }

  goBack() {
    this.router.navigate(['/features/new-year']);
  }

  onBulkSectioning() {
    this.showBulkModal.set(true);
  }

  onBulkModalClose() {
    this.showBulkModal.set(false);
  }

  onBulkUpload(file: File) {
    // TODO: Send file to API endpoint
    this.showBulkModal.set(false);
  }
}

