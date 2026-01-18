import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const REPO_OWNER = process.env.REPO_OWNER || process.env.NEXT_PUBLIC_REPO_OWNER || '';
const REPO_NAME = process.env.REPO_NAME || process.env.NEXT_PUBLIC_REPO_NAME || '';

export async function POST(request: NextRequest) {
  try {
    const { username: providedUsername, token } = await request.json();

    if (!providedUsername || typeof providedUsername !== 'string') {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'GitHub Personal Access Token is required' },
        { status: 400 }
      );
    }

    // Validate PAT by calling GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'FuturePointCoaching-Admin',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid GitHub token' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    const username = userData.login;

    // Verify the provided username matches the token owner
    if (providedUsername.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json(
        {
          error: 'Username verification failed',
          details: 'The provided username does not match the token owner. Please ensure you entered your correct GitHub username.',
        },
        { status: 401 }
      );
    }

    // For local dev, we'll use the local admins.json file
    // In production on Netlify, this would fetch from GitHub
    const fs = await import('fs');
    const path = await import('path');
    
    let adminsContent;
    try {
      const adminsPath = path.join(process.cwd(), 'admins', 'admins.json');
      const adminsFile = fs.readFileSync(adminsPath, 'utf-8');
      adminsContent = JSON.parse(adminsFile);
    } catch {
      // Fallback: fetch from GitHub if local file not found
      const adminsResponse = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/admins/admins.json`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'FuturePointCoaching-Admin',
          },
        }
      );

      if (!adminsResponse.ok) {
        return NextResponse.json(
          { error: 'Unable to verify admin status. Check repository access.' },
          { status: 403 }
        );
      }

      const adminsData = await adminsResponse.json();
      adminsContent = JSON.parse(Buffer.from(adminsData.content, 'base64').toString('utf-8'));
    }

    const isSuperAdmin = adminsContent.super_admins?.includes(username) || 
                         adminsContent.super_admins?.some((a: string) => a.toLowerCase() === username.toLowerCase());
    const isAdmin = adminsContent.admins?.includes(username) ||
                    adminsContent.admins?.some((a: string) => a.toLowerCase() === username.toLowerCase());

    if (!isSuperAdmin && !isAdmin) {
      return NextResponse.json(
        { error: `You (${username}) are not authorized as an admin` },
        { status: 403 }
      );
    }

    // Create JWT
    const jwtPayload = {
      username,
      isSuperAdmin,
      exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60, // 2 hours
    };

    const jwtToken = jwt.sign(jwtPayload, JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      user: {
        username,
        isSuperAdmin,
        avatar: userData.avatar_url,
      },
    });

    // Set cookie
    response.cookies.set('fp_admin', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7200, // 2 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
