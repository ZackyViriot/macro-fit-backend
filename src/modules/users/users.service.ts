import {Injectable} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async createUser(createUserDto: CreateUserDto) {
        try {
          const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
          return await this.prisma.user.create({
            data: {
              email: createUserDto.email,
              firstName: createUserDto.firstName,
              lastName: createUserDto.lastName,
              password: hashedPassword,
            },
          });
        } catch (error) {
          if (error.code === 'P2002') {
            throw new Error('User with this email already exists');
          }
          throw error;
        }
      }

    async findByEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
    }

    async findUserById(id: number) {
        return await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
    }
    async updateUserWeight(id: number)

    async updateUser(id: number, updateUserDto: UpdateUserDto) {
        try {
            return await this.prisma.user.update({
                where: {
                    id: id,
                },
                data: updateUserDto,
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error('User with this email already exists');
            }
            if (error.code === 'P2025') {
                throw new Error('User not found');
            }
            throw error;
        }
    }

    async deleteUser(id: number) {
        try {
            return await this.prisma.user.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new Error('User not found');
            }
            throw error;
        }
    }
}