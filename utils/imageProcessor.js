const sharp = require('sharp');

/**
 * Converts an image buffer to WebP format.
 * @param {Buffer} buffer - The original image buffer.
 * @param {number} quality - WebP quality (1-100).
 * @returns {Promise<Buffer>} - The WebP image buffer.
 */
const convertToWebP = async (buffer, quality = 80) => {
    try {
        return await sharp(buffer)
            .webp({ quality })
            .toBuffer();
    } catch (error) {
        console.error('Sharp conversion error:', error);
        throw new Error('Erreur lors de la conversion en WebP');
    }
};

module.exports = { convertToWebP };
