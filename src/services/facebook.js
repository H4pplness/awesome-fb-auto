import axios from 'axios';
import fs from 'fs-extra';
import FormData from 'form-data';

const BASE_URL = 'https://graph.facebook.com/v19.0';

export async function verifyPage(pageId, accessToken) {
  const res = await axios.get(`${BASE_URL}/${pageId}`, {
    params: { fields: 'id,name', access_token: accessToken },
  });
  return res.data;
}

export async function postText(pageId, accessToken, message) {
  const res = await axios.post(`${BASE_URL}/${pageId}/feed`, {
    message,
    access_token: accessToken,
  });
  return res.data;
}

export async function postPhoto(pageId, accessToken, message, imagePath) {
  const form = new FormData();
  form.append('message', message);
  form.append('access_token', accessToken);
  form.append('source', fs.createReadStream(imagePath));

  const res = await axios.post(`${BASE_URL}/${pageId}/photos`, form, {
    headers: form.getHeaders(),
  });
  return res.data;
}
