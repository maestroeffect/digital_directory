import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { query } from '../../../../../utils/db'

export async function POST(req) {
  try {
    console.log('Incoming request to /api/auth/signup')

    let body

    try {
      body = await req.json()
    } catch (err) {
      console.error('Error parsing request body:', err)

      return NextResponse.json({ message: 'Invalid JSON input' }, { status: 400 })
    }

    const { email, password, name } = body

    console.log('Received signup request:', { email, name })

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 })
    }

    // Check if the user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = ?', [email])

    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user into the database
    const result = await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
      name,
      email,
      hashedPassword
    ])

    if (!result.insertId) {
      throw new Error('User registration failed')
    }

    // Generate JWT token
    console.log('Generating JWT for new user:', email)
    const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: '2h' })

    console.log('Signup successful:', email)

    return NextResponse.json({ message: 'Signup successful', token })
  } catch (error) {
    console.error('Unexpected error in signup:', error)

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
