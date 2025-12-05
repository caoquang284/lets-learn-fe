import {
  generateSHA1,
  generateSignature,
  getPublicIdFromCloudinaryUrl,
} from '@shared/helper/cloudinary.api.helper';
import { POST } from './utils.api';
import { environment } from '../../../environments/environment';

const VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-ms-wmv',
  'video/x-msvideo',
  'video/x-flv',
  'video/webm',
  'video/3gpp',
  'video/3gpp2',
  'video/ogg',
  'video/x-matroska',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/webm',
];

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const UploadCloudinaryFile = async (file: File) => {
  if (!file) {
    return Promise.reject(new Error('File is not provided'));
  }

  const cloudName = environment.CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = environment.UPLOAD_PRESET_NAME || '';
  if (!cloudName || !uploadPreset) {
    return Promise.reject(
      new Error('Cloud name or upload preset is not found')
    );
  }

  let resourceType = 'raw';
  if (IMAGE_TYPES.includes(file.type)) resourceType = 'image';
  else if (VIDEO_TYPES.includes(file.type)) resourceType = 'video';

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const requestData = new FormData();
  requestData.append('file', file);
  requestData.append('upload_preset', uploadPreset);

  return await fetch(uploadUrl, {
    method: 'POST',
    body: requestData,
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error('Error uploading file to Cloudinary:', error);
      return Promise.reject(new Error(`Failed to upload file: ${file.name}`));
    });
};

export const UploadMultipleCloudinaryFiles = (files: File[]) => {
  const uploadPromises = files.map((file) => UploadCloudinaryFile(file));
  return Promise.all(uploadPromises).catch((errors) => {
    return Promise.reject(
      new Error(Array.isArray(errors) ? errors[0]?.message : errors?.message)
    );
  });
};

export const DeleteCloudinaryFile = (imageUrl: string) => {
  if (!imageUrl) {
    return Promise.reject(new Error('Image URL is not provided'));
  }

  const cloudName = environment.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = environment.CLOUDINARY_API_KEY || '';
  const apiSecret = environment.CLOUDINARY_API_SECRET || '';
  if (!cloudName) {
    return Promise.reject(new Error('Cloud name is not found'));
  } else if (!apiKey) {
    return Promise.reject(new Error('API key is not found'));
  } else if (!apiSecret) {
    return Promise.reject(new Error('API secret is not found'));
  }

  const publicId = getPublicIdFromCloudinaryUrl(imageUrl);
  const timestamp = new Date().getTime().toString();
  const signature = generateSHA1(generateSignature(publicId, apiSecret));

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

  const formData = new FormData();
  formData.append('api_key', apiKey);
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  return fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error('Error uploading file to Cloudinary:', error);
      return Promise.reject(
        new Error(`Failed to delete file with url: ${imageUrl}`)
      );
    });
};

export function DeleteMultipleCloudinaryFiles(listImageUrls: string[]) {
  const deletePromises = listImageUrls.map((url) =>
    DeleteCloudinaryFile(getPublicIdFromCloudinaryUrl(url))
  );

  return Promise.all(deletePromises).catch((errors) => {
    return Promise.reject(
      new Error(Array.isArray(errors) ? errors[0]?.message : errors?.message)
    );
  });
}
