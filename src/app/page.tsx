import { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

// Define the metadata for the page
export const metadata: Metadata = {
  title: 'Base Around The World Buildathon',
  description: 'Explore winners and projects from the Base Around The World Buildathon',
  openGraph: {
    title: 'Base Around The World Buildathon',
    description: 'Explore winners and projects from the Base Around The World Buildathon',
    images: [`${NEXT_PUBLIC_URL}/buildathon.png`],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${NEXT_PUBLIC_URL}/buildathon.png`,
    'fc:frame:button:1': 'Based India',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:1:post_url': `${NEXT_PUBLIC_URL}/api/india`,
    'fc:frame:button:2': 'Based Latam',
    'fc:frame:button:2:action': 'post',
    'fc:frame:button:2:post_url': `${NEXT_PUBLIC_URL}/api/latam`,
    'fc:frame:button:3': 'Based SEA',
    'fc:frame:button:3:action': 'post',
    'fc:frame:button:3:post_url': `${NEXT_PUBLIC_URL}/api/sea`,
    'fc:frame:button:4': 'Based Africa',
    'fc:frame:button:4:action': 'post',
    'fc:frame:button:4:post_url': `${NEXT_PUBLIC_URL}/api/africa`,
    'fc:frame:post_url': `${NEXT_PUBLIC_URL}/api/projects?region=all`,
  },
};

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Base Around The World Buildathon</h1>
      <p className="text-lg">Explore the amazing projects and winners from our buildathon!</p>
    </div>
  );
}