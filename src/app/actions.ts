'use server';

import { getFirebaseAdminApp } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { randomUUID } from 'crypto';

export async function uploadFileAndGetURL(formData: FormData): Promise<string | null> {
  const file = formData.get('file') as File | null;
  const folder = formData.get('folder') as string | 'misc';
  const userId = formData.get('userId') as string | null;

  if (!file || !userId) {
    console.error('Missing file, folder, or userId for upload.');
    return null;
  }

  try {
    const app = getFirebaseAdminApp();
    const bucket = getStorage(app).bucket();
    const filePath = `${folder}/${userId}/${Date.now()}_${randomUUID()}_${file.name}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const blob = bucket.file(filePath);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.type,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('Error uploading to GCS:', err);
        reject('Upload failed');
      });

      blobStream.on('finish', async () => {
        try {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
          resolve(publicUrl);
        } catch (err) {
          console.error('Error making file public or getting URL:', err);
          reject('Failed to get public URL');
        }
      });

      blobStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Server-side upload error:', error);
    return null;
  }
}
