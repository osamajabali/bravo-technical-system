import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookUps } from '../../../core/services/look-ups.service';
import { NgSelectCloseOnOtherClearDirective } from '../../../shared/directives/ng-select-close-on-other-clear.directive';
import { NewYearService } from '../../../core/services/new-year/new-year.service';
import { LookupItem } from '../../../core/models/shared-models/lookup-item.model';

@Component({
  selector: 'app-ended-schools-year',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, NgSelectCloseOnOtherClearDirective],
  templateUrl: './ended-schools-year.html',
  styleUrl: './ended-schools-year.scss'
})
export class EndedSchoolsYear {
  router = inject(Router);
  newYearService = inject(NewYearService);

  filterOptions = [
    { id: 'all', name: 'All' },
    { id: 'chain', name: 'Chain' },
  ];

  filterType: 'all' | 'chain' = 'all';
  selectedOrganizationId: number | null = null;

  loading = signal<boolean>(false);
  schools = signal<LookupItem[]>([]);
  filteredSchools = signal<LookupItem[]>([]);
  searchTerm = signal<string>('');
  organizations = signal<LookupItem[]>([]);
  ngOnInit() {
    this.fetchSchools();
    this.fetchOrganizations();
  }

  onFilterTypeChange(type: 'all' | 'chain') {
    this.filterType = type;
    if (type === 'all') {
      this.selectedOrganizationId = null;
    }
    this.fetchSchools();
  }

  fetchOrganizations() {
    this.newYearService.getOrganizationList().subscribe((res) => {
      this.organizations.set(res.data);
    });
  }

  applyFilters() {
    const base = this.schools();
    this.filteredSchools.set(this.filterBySearch(base, this.searchTerm()));
  }

  fetchSchools() {
    this.loading.set(true);
    const orgId = this.filterType === 'chain' ? this.selectedOrganizationId : null;
    this.newYearService.getEndedSchools(orgId).subscribe({
      next: (res: { success: boolean; data: LookupItem[] }) => {
        const items = res && res.success ? res.data || [] : [];
        this.schools.set(items);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.schools.set([]);
        this.filteredSchools.set([]);
        this.loading.set(false);
      }
    });
  }

  onOrganizationChange() {
    this.fetchSchools();
  }

  startNewYear(school: { id: number; name: string }) {
    sessionStorage.setItem('selectedSchoolId', String(school.id));
    sessionStorage.setItem('selectedSchoolName', school.name || '');
    this.router.navigate(['features', 'new-year', 'start']);
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term || '');
    this.applyFilters();
  }

  private filterBySearch(items: LookupItem[], term: string): LookupItem[] {
    const t = (term || '').toLowerCase().trim();
    if (!t) return items;
    return items.filter(s => (s.name || '').toLowerCase().includes(t));
  }
}
