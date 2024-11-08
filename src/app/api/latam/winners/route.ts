import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../../config';
import projects from '../../../winners-latam.json';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new NextResponse('Invalid request', { status: 400 });
  }

  const { untrustedData } = body;
  const buttonIndex = untrustedData?.buttonIndex || 0;
  const state = untrustedData?.state ? JSON.parse(untrustedData.state) : { index: -1 };

  let currentIndex = state.index;
  
  // If it's the initial state or Next is clicked, move to next project
  if (currentIndex === -1 || buttonIndex === 2) {
    currentIndex = Math.min(projects.length - 1, currentIndex + 1);
  } else if (buttonIndex === 1) { // Previous
    currentIndex = Math.max(0, currentIndex - 1);
  }

  const currentProject = projects[currentIndex];

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: 'Previous',
          action: 'post',
        },
        {
          label: 'Next',
          action: 'post',
        },
        {
          label: 'View Project',
          action: 'link',
          target: currentProject.link,
        },
        {
          label: 'Home',
          action: 'post',
          postUrl: `${NEXT_PUBLIC_URL}`,
        }
      ],
      image: `${NEXT_PUBLIC_URL}/api/latam/og?project=${encodeURIComponent(currentProject.name)}&description=${encodeURIComponent(currentProject.description)}&index=${currentIndex + 1}&total=${projects.length}`,
      post_url: `${NEXT_PUBLIC_URL}/api/latam/winners`,
      state: { index: currentIndex },
    })
  );
}

export const dynamic = 'force-dynamic';