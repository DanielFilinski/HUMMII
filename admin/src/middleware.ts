import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Получаем токен из куки
  const token = request.cookies.get('admin_token');
  
  // Проверяем, является ли путь защищенным
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') && 
    !request.nextUrl.pathname.startsWith('/admin/login');

  // Если это защищенный маршрут и нет токена - редирект на логин
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Если есть токен и пытаемся зайти на страницу логина - редирект на дашборд
  if (token && request.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Добавляем заголовки безопасности
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );

  return response;
}

// Указываем пути, для которых будет работать middleware
export const config = {
  matcher: '/admin/:path*',
};