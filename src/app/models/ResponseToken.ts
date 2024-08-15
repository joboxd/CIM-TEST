import { DataToken } from "./DataToken";

export interface ResponseToken {

    code: number,
    message: string,
    data: DataToken,
    requestId: string

}