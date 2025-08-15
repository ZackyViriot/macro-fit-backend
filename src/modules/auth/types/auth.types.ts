export interface AuthResponse {
    access_token: string;
    user: {
        id?:number;
        first_name: string;
        last_name: string;
        email: string;
        created_at?:Date;
        // this is boiler plate for now this will be changed later to add all features and their flag checks.
    }
}

export interface SignInDto {
    email: string;
    password: string;
}