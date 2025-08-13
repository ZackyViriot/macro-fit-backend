import {Injectable} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async createUser(createUserDto: CreateUserDto) {
        try {
          return await this.prisma.user.create({
            data: {
              email: createUserDto.email,
              firstName: createUserDto.firstName,
              lastName: createUserDto.lastName,
              password: createUserDto.password,           },
          });
        } catch (error) {
          if (error.code === 'P2002') {
            throw new Error('User with this email already exists');
          }
          throw error;
        }
      }
}