import { NextResponse } from 'next/server'

import { hash } from 'bcryptjs'
import * as z from 'zod'

import { db } from '@/lib/db'

// Define a schema for input validation
const userSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export async function POST(req) {
  try {
    if (!req.body) {
      return NextResponse.json({ message: 'Request body is missing' }, { status: 400 })
    }

    const body = await req.json()

    const parsedBody = userSchema.safeParse(body)

    // Handle validation errors
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: parsedBody.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = parsedBody.data

    // Check if the email already exists
    const existingUser = await db.user.findUnique({ where: { email } })

    if (existingUser) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 })
    }

    // // Check if name already exists
    // const existingUserByName = await db.user.findUnique({ where: { name } })

    // if (existingUserByName) {
    //   return NextResponse.json({ message: 'Name already exists' }, { status: 400 })
    // }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Create a new user
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({ user: userWithoutPassword, message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error in registration:', error)

    return NextResponse.json({ message: 'Something went wrong', error: error.message }, { status: 500 })
  }
}
