import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { query } from '../../../../../utils/db'

export async function POST(req) {
  try {
    console.log('Incoming request to /api/auth/login')

    // Parse request body safely
    let body

    try {
      body = await req.json()
    } catch (err) {
      console.error('Error parsing request body:', err)

      return NextResponse.json({ message: 'Invalid JSON input' }, { status: 400 })
    }

    const { email, password } = body

    console.log('Received:', { email })

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Check if user exists
    const user = await query('SELECT * FROM users WHERE email = ?', [email])

    console.log('User lookup result:', user)

    if (user.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user[0].password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Debug JWT Secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing! Check your .env file.')

      return NextResponse.json({ message: 'Server misconfiguration' }, { status: 500 })
    }

    console.log('Generating JWT for:', email)
    const token = jwt.sign({ id: user[0].id, email: user[0].email }, process.env.JWT_SECRET, { expiresIn: '2h' })

    console.log('Login successful:', email)

    return NextResponse.json({ message: 'Login successful', token })
  } catch (error) {
    console.error('Unexpected error in login:', error)

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
