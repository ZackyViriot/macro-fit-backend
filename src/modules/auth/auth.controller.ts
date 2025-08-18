import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class SignupDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.signIn(loginDto.email, loginDto.password);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signUp(signupDto);
  }
}
