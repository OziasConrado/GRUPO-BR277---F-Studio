'use server';

import { getStorage, ref, getSignedUrl } from 'firebase-admin/storage';
import { getFirebaseAdminApp } from '@/lib/firebase/admin';

// Initialize Firebase Admin SDK
getFirebaseAdminApp();

interface SignedUrlOptions {
  file: {
    name: string;
    type: string;
    size: number;
  };
  userId: string;
  path: 'profile' | 'post' | 'chat';
}

const MAX_SIZES = {
    profile: 5 * 1024 * 1024, // 5 MB
    post: 50 * 1024 * 1024, // 50 MB
    chat: 10 * 1024 * 1024, // 10 MB
}

const FOLDER_PATHS = {
    profile: 'profile_pictures',
    post: 'post_media', // Combined folder for images/videos in posts
    chat: 'chat_media',
}

export async function getSignedUploadUrl({ file, userId, path }: SignedUrlOptions): Promise<{ success: boolean; error?: string; url?: string; filePath?: string; }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  if (!file || !file.name || !file.type || !file.size) {
    return { success: false, error: 'Invalid file information.' };
  }
  if (file.size > MAX_SIZES[path]) {
      return { success: false, error: `File is too large. Max size is ${MAX_SIZES[path] / 1024 / 1024}MB.`}
  }

  try {
    const bucket = getStorage().bucket();
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const filePath = `${FOLDER_PATHS[path]}/${userId}/${uniqueFileName}`;
    const fileRef = bucket.file(filePath);

    const [signedUrl] = await fileRef.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: file.type,
    });

    return { success: true, url: signedUrl, filePath: filePath };
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return { success: false, error: 'Could not get a secure link to upload the file.' };
  }
}
