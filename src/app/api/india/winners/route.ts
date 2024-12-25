import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../../config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch winners from API
async function fetchWinners() {
  try {
    const response = await fetch('https://base-around-the-world-api.vercel.app/api/winners/india');
    if (!response.ok) throw new Error('Failed to fetch winners');
    return await response.json();
  } catch (error) {
    console.error('Error fetching winners:', error);
    return [];
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const winners = await fetchWinners();
    const body = await req.json();
    const { untrustedData } = body;
    const buttonIndex = untrustedData?.buttonIndex || 0;

   // If Home button is clicked (button index 4)
   if (buttonIndex === 4) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: 'Based India',
            action: 'post',
            postUrl: `${NEXT_PUBLIC_URL}/api/india`,
          },
          {
            label: 'Based Latam',
            action: 'post',
            postUrl: `${NEXT_PUBLIC_URL}/api/latam`,
          },
          {
            label: 'Based SEA',
            action: 'post',
            postUrl: `${NEXT_PUBLIC_URL}/api/sea`,
          },
          {
            label: 'Based Africa',
            action: 'post',
            postUrl: `${NEXT_PUBLIC_URL}/api/africa`,
          },
        ],
        image: `${NEXT_PUBLIC_URL}/buildathon.png`,
        post_url: `${NEXT_PUBLIC_URL}/api/projects?region=all`,
      })
    );
  }

    // Parse state with better error handling
    let currentIndex;
    try {
      if (untrustedData?.state) {
        const stateData = JSON.parse(untrustedData.state);
        currentIndex = typeof stateData.index === 'number' ? stateData.index : 0;
      } else {
        currentIndex = 0; // Set to 0 for initial load
      }
    } catch (error) {
      console.error('Error parsing state:', error);
      currentIndex = 0;
    }

    // Handle navigation
    if (buttonIndex === 2) { // Next
      currentIndex = (currentIndex + 1) % winners.length;
    } else if (buttonIndex === 1) { // Previous
      currentIndex = currentIndex <= 0 ? winners.length - 1 : currentIndex - 1;
    }

    console.log('Navigation:', {
      buttonIndex,
      currentIndex,
      totalProjects: winners.length
    });

    const currentProject = winners[currentIndex];
    if (!currentProject) {
      console.error('Project not found for index:', currentIndex);
      return new NextResponse('Project not found', { status: 500 });
    }

    const imageUrl = `${NEXT_PUBLIC_URL}/india/${currentProject.image}`;

    const response = new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Previous (${currentIndex + 1}/${winners.length})`,
            action: 'post',
          },
          {
            label: `Next (${currentIndex + 1}/${winners.length})`,
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
          },
        ],
        image: imageUrl,
        post_url: `${NEXT_PUBLIC_URL}/api/india/winners`,
        state: { index: currentIndex },
      })
    );

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const fetchCache = 'force-no-store';