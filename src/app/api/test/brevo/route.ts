import { NextResponse } from 'next/server';
import { syncContactToLists, isContactOnList } from '@/lib/email/brevoSync';
import { DEFAULT_WAITLIST_LIST_ID } from '@/lib/email/brevo';
import { getContactLists } from '@/lib/email/brevoSync';

/**
 * Test endpoint for Brevo integration
 * 
 * NOTE: This should be disabled or protected in production
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';
    const email = url.searchParams.get('email');
    
    // Return api key status without revealing the key
    if (action === 'status') {
      const apiKey = process.env.BREVO_API_KEY;
      
      return NextResponse.json({
        success: true,
        api_configured: !!apiKey,
        waitlist_list_id: DEFAULT_WAITLIST_LIST_ID,
      });
    }
    
    // Get all lists
    if (action === 'lists') {
      const lists = await getContactLists();
      return NextResponse.json({
        success: true,
        lists
      });
    }
    
    // Check if specific email is on waitlist
    if (action === 'check' && email) {
      const isOnList = await isContactOnList(email, DEFAULT_WAITLIST_LIST_ID);
      return NextResponse.json({
        success: true,
        email,
        is_on_waitlist: isOnList,
        waitlist_list_id: DEFAULT_WAITLIST_LIST_ID
      });
    }
    
    // Test contact sync (requires email parameter)
    if (action === 'sync' && email) {
      const result = await syncContactToLists(
        email,
        {
          FIRSTNAME: 'Test',
          LASTNAME: 'User',
          SOURCE: 'api_test',
          SIGNUP_DATE: new Date().toISOString(),
          PRODUCT: 'PromptFlow',
        },
        [DEFAULT_WAITLIST_LIST_ID]
      );
      
      return NextResponse.json({
        success: true,
        sync_result: result,
        waitlist_list_id: DEFAULT_WAITLIST_LIST_ID,
        email
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action or missing parameters',
      available_actions: ['status', 'lists', 'check (requires email)', 'sync (requires email)'],
    }, { status: 400 });
  } catch (error) {
    console.error('Error in Brevo test endpoint:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error testing Brevo integration',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}