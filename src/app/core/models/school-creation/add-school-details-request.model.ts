export class AddSchoolDetailsRequest {
  schoolId: number;
  stepNumber: number;
  organizationId: number;
  systemStatusId: number;
  countryId: number;
  cityId: number;
  accountOwnerId: number;
  academicYearId: number;
  nameArabic: string;
  nameEnglish: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  websiteUrl?: string;
  logo?: any;
  logoUrl?: string;
  contractExpiryDate?: string; // ISO string or date string
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  startDate?: string; // ISO string or date string
  endDate?: string; // ISO string or date string
} 