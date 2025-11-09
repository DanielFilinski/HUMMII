import { NextRequest, NextResponse } from 'next/server';

// Для серверных API routes используем внутреннее имя Docker сервиса
const API_URL = process.env.API_URL || 'http://api:3000';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const nextResponse = NextResponse.json({ success: true });

    // Удаляем cookies
    nextResponse.cookies.delete('accessToken');
    nextResponse.cookies.delete('refreshToken');
    nextResponse.cookies.delete('admin_token');

    return nextResponse;
  } catch (error) {
    console.error('Logout proxy error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
