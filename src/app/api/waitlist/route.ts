import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addContact, sendTransactionalEmail } from '@/lib/email/brevo';

// List IDs in Brevo - use environment variables if available, or defaults
const WAITLIST_LIST_ID = parseInt(process.env.BREVO_LIST_ID_WAITLIST || '1'); 
const WAITLIST_TEMPLATE_ID = parseInt(process.env.BREVO_TEMPLATE_ID_WELCOME || '1');

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
    
    // Get the source and IP for analytics
    const source = req.headers.get('referer') || 'direct';
    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || '';
    
    // Check if email already exists in waitlist
    const existingEmail = await prisma.waitlist.findUnique({
      where: { email },
    });
    
    if (existingEmail) {
      return NextResponse.json({ message: 'Email already on waitlist' }, { status: 200 });
    }
    
    // Add email to waitlist
    await prisma.waitlist.create({
      data: {
        email,
        joinedAt: new Date(),
        source,
        ipAddress,
      },
    });

    // Only attempt to send emails if Brevo is configured
    if (process.env.BREVO_API_KEY) {
      try {
        // Add to Brevo contact list for email automation
        await addContact(
          email, 
          undefined, 
          undefined,
          [WAITLIST_LIST_ID], 
          {
            SOURCE: source,
            SIGNUP_DATE: new Date().toISOString(),
            IP_ADDRESS: ipAddress
          }
        );
        
        // Send welcome email using Brevo template
        await sendTransactionalEmail(
          email,
          WAITLIST_TEMPLATE_ID,
          {
            SIGNUP_DATE: new Date().toLocaleDateString()
          },
          undefined,
          ['waitlist', 'welcome']
        );
      } catch (emailError) {
        // Log but don't fail the request if email sending fails
        console.error('Error with email processing:', emailError);
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully joined the waitlist' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json({ error: 'Server error processing request' }, { status: 500 });
  }
}
