import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { RolesGuard } from './guards/roles.guard';
import { ResourceOwnerGuard } from './guards/resource-owner.guard';
import { FailedLoginService } from './services/failed-login.service';
import { PrismaService } from '../shared/prisma/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    FailedLoginService, // Failed login tracking
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    RolesGuard, // Register RolesGuard
    ResourceOwnerGuard, // Register ResourceOwnerGuard
    {
      provide: GoogleStrategy,
      inject: [ConfigService, AuthService],
      useFactory: (configService: ConfigService, authService: AuthService) => {
        const googleClientId = configService.get<string>('GOOGLE_CLIENT_ID');
        // Only create GoogleStrategy if client ID is configured and not placeholder
        if (googleClientId && !googleClientId.includes('your-google-client')) {
          return new GoogleStrategy(configService, authService);
        }
        return null;
      },
    },
  ],
  exports: [AuthService, JwtModule, RolesGuard, ResourceOwnerGuard, FailedLoginService],
})
export class AuthModule {}
