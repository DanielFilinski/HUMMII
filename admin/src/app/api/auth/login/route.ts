import { NextRequest, NextResponse } from 'next/server';

// Для серверных API routes используем внутреннее имя Docker сервиса
const API_URL = process.env.API_URL || 'http://api:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Удаляем пустое поле code, если оно есть
    const loginData: any = {
      email: body.email,
      password: body.password,
    };
    
    // Добавляем code только если он не пустой
    if (body.code && body.code.trim()) {
      loginData.code = body.code;
    }
    
    console.log('Login request to:', `${API_URL}/api/v1/auth/login`);
    console.log('Body:', loginData);
    
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();
    console.log('API Response status:', response.status);
    console.log('API Response data:', data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Создаем ответ с данными
    const nextResponse = NextResponse.json(data);

    // Копируем cookies из ответа API
    // В Node.js fetch, используем getSetCookie() для получения всех set-cookie заголовков
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookieString: string) => {
        // Парсим каждый cookie отдельно
        const [nameValue, ...attributes] = cookieString.split(';');
        const [name, value] = nameValue.split('=');
        
        if (name && value) {
          // Извлекаем атрибуты
          const cookieAttributes: {
            path?: string;
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: 'strict' | 'lax' | 'none';
            maxAge?: number;
          } = {
            path: '/',
          };
          
          attributes.forEach((attr: string) => {
            const [key, val] = attr.trim().split('=');
            const lowerKey = key.toLowerCase();
            
            if (lowerKey === 'httponly') {
              cookieAttributes.httpOnly = true;
            } else if (lowerKey === 'secure') {
              cookieAttributes.secure = true;
            } else if (lowerKey === 'samesite') {
              cookieAttributes.sameSite = (val?.toLowerCase() as any) || 'lax';
            } else if (lowerKey === 'max-age') {
              cookieAttributes.maxAge = parseInt(val, 10);
            } else if (lowerKey === 'path') {
              cookieAttributes.path = val;
            }
          });
          
          nextResponse.cookies.set(name.trim(), value.trim(), cookieAttributes);
        }
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
