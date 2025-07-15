export class Result<T = any>  {
    data!: T;
    success : boolean ;
    message : string ;
    code : number;
}