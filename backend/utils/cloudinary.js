const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      folder: 'sankalp-cvs',
      access_mode: 'public',
      ...options,
    };
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const deleteFile = async (publicId, resourceType = null) => {
  const types = resourceType ? [resourceType] : ['image', 'raw'];
  for (const type of types) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: type });
      if (result.result === 'ok') return;
    } catch (err) {
      console.error(`Cloudinary delete error (${type}):`, err.message);
    }
  }
};

module.exports = { uploadBuffer, deleteFile };
