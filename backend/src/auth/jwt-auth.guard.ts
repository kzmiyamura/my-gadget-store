import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * コントローラーで @UseGuards(JwtAuthGuard) として使用するガード。
 * 将来 Cognito 等に移行する際はここだけ差し替える。
 *
 * 例:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('me')
 *   getProfile(@Request() req) { return req.user; }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
