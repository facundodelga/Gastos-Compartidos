import { NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    const result = authService.login(parsed.data.email, parsed.data.password);

    if (result.success && result.user) {
      return NextResponse.json({ success: true, user: result.user });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Error al iniciar sesión' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

