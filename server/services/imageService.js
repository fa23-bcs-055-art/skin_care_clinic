// server/services/imageService.js
const validateImage = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 2 * 1024 * 1024;

  if (!file) throw new Error('No image file provided.');
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }
  if (file.size > maxSize) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    throw new Error(`File size exceeds 2 MB limit. Your file is ${sizeMB} MB.`);
  }
  return true;
};

const bufferToDataUri = (buffer, mimetype) => {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
};

module.exports = { validateImage, bufferToDataUri };