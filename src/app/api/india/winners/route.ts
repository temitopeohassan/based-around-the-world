import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../../config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch winners from API
async function fetchWinners() {
  try {
    const response = await fetch('https://base-around-the-world-api.vercel.app/api/winners/india');
    if (!response.ok) {
      throw new Error('Failed to fetch winners');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching winners:', error);
    throw error;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const winners = await fetchWinners();
    const { searchParams } = new URL(req.url);
    const buttonIndex = searchParams.get('untrustedData[buttonIndex]');
    
    let currentIndex = Number(searchParams.get('untrustedData[pageIndex]')) || 0;
    const projectsPerPage = 1;
    const totalProjects = winners.length;

    if (buttonIndex === "2") {
      currentIndex = (currentIndex - 1 + totalProjects) % totalProjects;
    } else if (buttonIndex === "3") {
      currentIndex = (currentIndex + 1) % totalProjects;
    }

    const currentProject = winners[currentIndex];

    // ... rest of your existing response handling code ...
    const response = new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `🏆 ${currentProject.name}`,
          },
          {
            label: `⬅️ Previous`,
          },
          {
            label: `➡️ Next`,
          },
        ],
        image: {
          src: `${NEXT_PUBLIC_URL}/india/${currentProject.image}`,
          aspectRatio: '1.91:1',
        },
        postUrl: `${NEXT_PUBLIC_URL}/api/india/winners?pageIndex=${currentIndex}`,
      })
    );

    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const fetchCache = 'force-no-store';