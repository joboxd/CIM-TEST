import { State } from "./States";
export interface ResponseStates {
    code: number,
    message: string,
    data: State[]
}