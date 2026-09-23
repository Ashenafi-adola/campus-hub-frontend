export interface health {
    health: string;
}

export type UserRegistrationData = {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password?: string;
    confirm_password?: string;
}