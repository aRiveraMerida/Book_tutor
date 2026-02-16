import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    const validUser = process.env.AUTH_USER;

    if (username === validUser) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Usuario inválido' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}
