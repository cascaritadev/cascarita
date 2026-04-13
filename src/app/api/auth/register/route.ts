import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const RegisterSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese correo.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    )
  } catch (err) {
    console.error('[REGISTER]', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
