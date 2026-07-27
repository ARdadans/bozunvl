import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Opsional: Validasi token secret jika diperlukan untuk keamanan webhook
    // if (secret !== process.env.REVALIDATE_SECRET) {
    //   return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    // }

    // Revalidate sitemap menggunakan path
    revalidatePath('/sitemap.xml', 'page');
    revalidatePath('/sitemap.xml'); // fallback revalidate by path tanpa tipe 'page'

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Error revalidating sitemap', error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Opsional: Validasi token secret jika diperlukan untuk keamanan webhook
    // if (secret !== process.env.REVALIDATE_SECRET) {
    //   return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    // }

    // Revalidate sitemap menggunakan path
    revalidatePath('/sitemap.xml', 'page');
    revalidatePath('/sitemap.xml'); // fallback revalidate by path tanpa tipe 'page'

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Error revalidating sitemap', error: err.message },
      { status: 500 }
    );
  }
}
