import axios from 'axios';

// Get these from Pinata (https://pinata.cloud/)
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';

export const uploadToIPFS = async (file: File) => {
  if (!PINATA_JWT) {
    console.warn("Pinata JWT not found. Mocking upload...");
    return "QmMockCIDForDemo" + Math.random().toString(36).substring(7);
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        'Content-Type': `multipart/form-data`,
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });
    return res.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
};
