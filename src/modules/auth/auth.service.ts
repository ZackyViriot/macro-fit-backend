import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { AuthResponse } from "./types/auth.types";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
    ) { }

    async signIn(email: string, password: string): Promise<AuthResponse> {
        // need to go build the findByEmail function in the users service.
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (!user.password) {
            throw new UnauthorizedException("User does not have a password");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid password");
        }

        const payload = {
            sub: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
        }

        const transformedUser = {
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            created_at: user.createdAt,
        }

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: transformedUser,
        }
    }

}


    