import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../../config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch projects from API
async function fetchProjects() {
  try {
    const response = await fetch('https://base-around-the-world-api.vercel.app/api/projects/africa');
    if (!response.ok) throw new Error('Failed to fetch projects');
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const projects = await fetchProjects();
    const body = await req.json();
    const { untrustedData } = body;
    
    // Debug log to see what we're receiving
    console.log('Received request:', {
      buttonIndex: untrustedData?.buttonIndex,
      state: untrustedData?.state,
      projectsLength: projects.length
    });

    // Handle home button (index 4)
    if (untrustedData?.buttonIndex === 4) {
      const homeResponse = new NextResponse(
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

      // Set aggressive cache control headers
      homeResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      homeResponse.headers.set('Pragma', 'no-cache');
      homeResponse.headers.set('Expires', '0');
      homeResponse.headers.set('Surrogate-Control', 'no-store');
      homeResponse.headers.set('Clear-Site-Data', '"cache"');
      
      return homeResponse;
    }

    // Parse state with URL decode and better error handling
    let currentIndex;
    try {
      if (untrustedData?.state) {
        const decodedState = decodeURIComponent(untrustedData.state);
        const stateData = JSON.parse(decodedState);
        currentIndex = typeof stateData.index === 'number' ? stateData.index : 0;
      } else {
        currentIndex = 0;
      }
    } catch (error) {
      console.error('Error parsing state:', error);
      currentIndex = 0;
    }

    // Handle navigation
    const buttonIndex = untrustedData?.buttonIndex;
    if (buttonIndex === 1) { // Previous
      currentIndex = (currentIndex - 1 + projects.length) % projects.length;
    } else if (buttonIndex === 2) { // Next
      currentIndex = (currentIndex + 1) % projects.length;
    }

    // Debug log to see what index we're using
    console.log('Using index:', currentIndex);

    const currentProject = projects[currentIndex];
    if (!currentProject) {
      console.error('Project not found for index:', currentIndex);
      return new NextResponse('Project not found', { status: 500 });
    }

    // Add timestamp to image URL to prevent caching
    const timestamp = new Date().getTime();
    const imageUrl = `${NEXT_PUBLIC_URL}/africa/${currentProject.image}?t=${timestamp}`;

    const response = new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Previous (${currentIndex + 1}/${projects.length})`,
            action: 'post',
          },
          {
            label: `Next (${currentIndex + 1}/${projects.length})`,
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
        post_url: `${NEXT_PUBLIC_URL}/api/africa/projects?t=${timestamp}`,
        state: { index: currentIndex },
      })
    );

    // Set aggressive cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Clear-Site-Data', '"cache"');

    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const fetchCache = 'force-no-store';