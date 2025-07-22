export class FileError {
    isSuccess: boolean;
    errors: ErrorDetail[];
    excelFileName : string;
  }
  
  export class ErrorDetail {
    rowNumber: number;
    columnName: string;
    errorMessage: string;
  }
  