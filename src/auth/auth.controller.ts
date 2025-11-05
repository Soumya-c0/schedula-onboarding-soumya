import { Controller, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { google } from 'googleapis';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Start Google OAuth flow — includes role in state
  @Get('google')
  async googleAuthRedirect(@Query('role') role: string, @Res() res: Response) {
    if (!role || (role !== 'doctor' && role !== 'patient')) {
      return res.status(400).send('role query param must be doctor or patient');
    }

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
      response_type: 'code',
      scope: 'openid profile email',
      state: role,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.redirect(authUrl);
  }

  // Google will redirect here with ?code=...&state=role
  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Query('state') role: string, @Res() res: Response) {
    try {
      const { OAuth2 } = google.auth;
      const client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL,
      );

      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);

      const oauth2 = google.oauth2({ auth: client, version: 'v2' });
      const userinfo = (await oauth2.userinfo.get()).data;

      const roleType: 'doctor' | 'patient' = role === 'doctor' ? 'doctor' : 'patient';
      const result = await this.authService.findOrCreateFromGoogle(
        { id: userinfo.id!, displayName: userinfo.name!, emails: [{ value: userinfo.email! }] },
        roleType,
      );

      // return JSON with token and user
      return res.json({ token: result.token, user: result.user });
    } catch (err:any) {
      console.error('Google callback error', err);
      return res.status(500).json({ message: 'Google auth failed', error: err.message || err });
    }
  }

  // small protected endpoint to test JWT
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req: Request) {
    // JwtStrategy sets req.user
    return { user: (req as any).user };
  }
}
