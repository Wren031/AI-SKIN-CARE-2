import { UserStatus } from "./UserStatus";

export interface User {
    id: string; 
    avatar_url: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    date_of_birth: number | null; 
    gender: string | null;
    phone_number: string | null;
    address: string | null;
    status: UserStatus;
    created_at: string;
    updated_at: string;
}