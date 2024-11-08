import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../config';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    return new NextResponse('Invalid request', { status: 400 });
  }

  const { untrustedData } = body;
  const buttonIndex = untrustedData?.buttonIndex || 0;
  
  console.log('Received request with buttonIndex:', buttonIndex);

  // Default response (initial load or any button click)
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: 'Projects',
          action: 'post',
          postUrl: `${NEXT_PUBLIC_URL}/api/africa/projects`,
        },
        {
          label: 'Winners',
          action: 'post',
          postUrl: `${NEXT_PUBLIC_URL}/api/africa/winners`,
        },
        {
          label: 'Home',
          action: 'post',
          postUrl: `${NEXT_PUBLIC_URL}`,
        }
      ],
      image: `${NEXT_PUBLIC_URL}/buildathon-africa.png`,
    })
  );
}

export const dynamic = 'force-dynamic';