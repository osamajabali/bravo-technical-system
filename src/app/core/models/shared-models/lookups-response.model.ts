import { LookupItem } from './lookup-item.model';

export class LookupsResponse {
  academicYears: LookupItem[];
  countries: LookupItem[];
  gradeEducationalSystems: LookupItem[];
  organizations: LookupItem[];
  owners: LookupItem[];
  statuses: LookupItem[];
  subjects: LookupItem[];
  // Add more keys if your API returns more
} 