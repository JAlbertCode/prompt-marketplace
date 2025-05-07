import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    // Basic validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    
    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Check if email already exists in waitlist
    const existingEmail = await db.waitlist.findUnique({
      where: { email },
    });
    
    if (existingEmail) {
      return NextResponse.json({ message: 'Email already on waitlist' }, { status: 200 });
    }
    
    // Add email to waitlist
    await db.waitlist.create({
      data: {
        email,
        joinedAt: new Date(),
      },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully joined the waitlist' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json({ error: 'Server error processing request' }, { status: 500 });
  }
}
