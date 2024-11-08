import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const project = searchParams.get('project');
  const description = searchParams.get('description');
  const index = searchParams.get('index');
  const total = searchParams.get('total');

  if (!project) {
    return new NextResponse('Project parameter is required', { status: 400 });
  }

  const imagePath = path.join(process.cwd(), 'public', 'buildathon-og-africa.png');
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Arial.ttf');

  try {
    if (!fs.existsSync(imagePath)) {
      console.error('Background image not found:', imagePath);
      throw new Error('Background image not found');
    }

    if (!fs.existsSync(fontPath)) {
      console.error('Font file not found:', fontPath);
      throw new Error('Font file not found');
    }

    const image = await sharp(imagePath)
      .resize(1200, 630)
      .composite([
        {
          input: {
            text: {
              text: `Project ${index}/${total}`,
              font: fontPath,
              width: 400,
              height: 50,
              rgba: true,
            },
          },
          top: 150,
          left: 100,
        },
        {
          input: {
            text: {
              text: decodeURIComponent(project).toUpperCase(),
              font: fontPath,
              width: 1000,
              height: 150,
              rgba: true,
            },
          },
          top: 200,
          left: 100,
        },
        {
          input: {
            text: {
              text: description ? decodeURIComponent(description) : '',
              font: fontPath,
              width: 800,
              height: 100,
              rgba: true,
            },
          },
          top: 350,
          left: 100,
        },
      ])
      .png()
      .toBuffer();

    return new NextResponse(image, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'max-age=10',
      },
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
