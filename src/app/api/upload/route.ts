import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `course-thumbnails/${fileName}`;

    console.log('Server-side upload:', {
      fileName,
      fileSize: file.size,
      fileType: file.type,
      hasServiceKey: !!supabaseServiceKey
    });

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Server upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const publicUrl = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    console.log('Server upload successful:', publicUrl.data.publicUrl);

    return NextResponse.json({ 
      url: publicUrl.data.publicUrl,
      path: data.path 
    });

  } catch (error) {
    console.error('Server upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 