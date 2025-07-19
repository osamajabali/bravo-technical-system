export class FileError {
    isSuccess: boolean;
    errors: ErrorDetail[];
  }
  
  export class ErrorDetail {
    rowNumber: number;
    columnName: string;
    errorMessage: string;
  }
  