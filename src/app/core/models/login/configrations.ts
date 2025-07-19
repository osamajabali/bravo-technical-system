export class Configurations {
    excelTemplates: ExcelTemplate[];
  }
  
  export class ExcelTemplate {
    id: number;
    url: string;
    requiredFields: string[];
    optionalFields: string[];
  }
  