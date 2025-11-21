import { NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';
import { registerPayloadSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    const parsed = registerPayloadSchema.safeParse({ email, password, name });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    const result = authService.register(parsed.data.email, parsed.data.password, parsed.data.name);

    if (result.success && result.user) {
      return NextResponse.json({ success: true, user: result.user });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Error al registrarse' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

