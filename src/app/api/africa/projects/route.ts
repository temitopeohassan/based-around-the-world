import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../../config';
import projects from '../../../projects-africa.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { untrustedData } = body;
    
    console.log('Received request:', {
      buttonIndex: untrustedData?.buttonIndex,
      state: untrustedData?.state,
      projectsLength: projects.length
    });

    // Handle home button (index 4)
    if (untrustedData?.buttonIndex === 4) {
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

    // Initialize currentIndex
    let currentIndex = 0;

    // Get current state if it exists
    if (untrustedData?.state) {
      try {
        const stateData = JSON.parse(untrustedData.state);
        currentIndex = stateData.index ?? 0;
      } catch (error) {
        console.error('Error parsing state:', error);
      }
    }

    // Handle navigation based on button press
    if (untrustedData?.buttonIndex === 1) { // Previous
      currentIndex = currentIndex <= 0 ? projects.length - 1 : currentIndex - 1;
    } else if (untrustedData?.buttonIndex === 2) { // Next
      currentIndex = currentIndex >= projects.length - 1 ? 0 : currentIndex + 1;
    }

    console.log('Navigation:', {
      buttonIndex: untrustedData?.buttonIndex,
      currentIndex,
      totalProjects: projects.length
    });

    // Get current project and create response
    const currentProject = projects[currentIndex];
    const nextIndex = (currentIndex + 1) % projects.length;
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    const nextProject = projects[nextIndex];
    const prevProject = projects[prevIndex];

    if (!currentProject) {
      console.error('Project not found for index:', currentIndex);
      return new NextResponse('Project not found', { status: 500 });
    }

    const imageUrl = `${NEXT_PUBLIC_URL}/africa/${currentProject.image}`;
    const response = new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `← ${prevProject ? prevProject.name || 'Previous' : 'Previous'}`,
            action: 'post',
          },
          {
            label: `→ ${nextProject ? nextProject.name || 'Next' : 'Next'}`,
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
        post_url: `${NEXT_PUBLIC_URL}/api/africa/projects`,
        state: { 
          index: currentIndex,
          direction: untrustedData?.buttonIndex === 1 ? 'prev' : 'next'
        },
      })
    );

    // Cache control
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}