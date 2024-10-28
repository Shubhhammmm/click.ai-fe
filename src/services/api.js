import axios from 'axios';

const API = axios.create({
  baseURL: "backendurl", // Backend API URL
  withCredentials: false,               // Allow cross-origin cookies for OAuth
});

// Example function to fetch user's folders
export const getFiles = async (mail) => {
  const response = await API.get('/files/fetchAll',{ params: { mail }});
  return response.data;
};

// Upload a file to a folder
export const uploadFile = async (formData,mail) => {
  formData.append('mail', mail);
  const response = await API.post('/files/upload', formData);
  return response.data;
};

export const deleteFile = async (id) => {
  const response = await API.delete(`/files/${id}`);
  return response.data;
};

export const getFolders = async (mail) => {
  const response = await API.get('/folders/fetchAll',{ params: { mail }});
  return response.data;
};

// Upload a folder
export const uploadFolder = async (newPathref,mail) => {
  const response = await API.post('/folders/upload', {
    newPathref,
    mail
  });
  return response.data;
};

// Delete a folder
export const delFolder = async (id) => {
  const response = await API.delete(`/folders/${id}`);
  return response.data;
};

export const downloadFolderApi = async (folderId) => {
  const response = await API.get(`/folders/folder-zip/${folderId}`, {
    responseType: 'blob', // This is important
  });
  return response;
};

export const deleteFileFromFolder = async (fileId,folderId) => {
  const response = await API.delete(`/folders/file/${fileId}/${folderId}`);
  return response.data;
};

export const updatePath = async (fileId, newPathref,from,to,toId,fromId,mail) => {
  try {
    const response = await API.put(`/files/update-pathref`, {
      id: fileId,
      from,
      to,
      newPathref: newPathref,
      toId,
      fromId,
      mail
    });
    console.log(response);
  } catch (error) {
    console.error("Error updating file pathref:", error);
    throw error;
  }
};

export default API;
