import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const events = await prisma.event.findMany()
  return NextResponse.json({events})
}

export async function POST(request) {
  const data = await request.json()
  const event = await prisma.event.create({ data })
  return NextResponse.json({event})
}