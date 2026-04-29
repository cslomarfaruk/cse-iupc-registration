import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  const { username, password } = await request.json()
  
  const hashedPassword = await bcrypt.hash(password, 12)
  
  try {
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword
      }
    })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: "Admin creation failed" })
  }
}