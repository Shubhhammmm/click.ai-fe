<template>
  <div class="flexCC-C">
    <button
      @click="Logout"
      class="upload-button"
      style="position: absolute; top: 15px; right: 15px; background-color: red"
    >
      Logout
    </button>
    <div class="file-upload">
      <h2>File Management</h2>
      <div
        style="background-color: #0002; padding: 15px 0px; border-radius: 5px"
      >
        <div style="" class="flexCC-C">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            class="file-input"
            style="margin-bottom: 5px; width: 300px; border: none"
          />
          <button
            @click="uploadFile"
            :disabled="!newFile"
            class="upload-button"
          >
            Upload File
          </button>
        </div>

        <div style="margin-top: 10px" class="flexCC-C">
          <input
            type="text"
            v-model="newFolderName"
            placeholder="New Folder Name"
            class="folder-input"
          />
          <button
            @click="createFolder"
            :disabled="!newFolderName"
            class="upload-button"
          >
            Create Folder
          </button>
        </div>
      </div>

      <div
        v-if="folders.length > 0 || files.length > 0"
        class="filesfolders-outer-div"
      >
        <h3>Uploaded Files</h3>

        <div
          class="files-container"
          :class="{ empty: files.length === 0 }"
          @dragover.prevent
          @drop="dropFile"
        >
          <ul class="file-list">
            <li
              v-for="file in files"
              :key="file.id"
              class="file-item"
              @dragstart="startDrag(file)"
              draggable="true"
              @dragend="clearDraggedFile"
            >
              <span class="file-name"
                >{{ file.name }} ({{ formatFileSize(file.size) }})</span
              >
              <div class="file-actions">
                <button @click="downloadFile(file)" class="action-button">
                  Download
                </button>
                <button @click="removeFile(file)" class="action-button delete">
                  Delete
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="folders.length > 0">
          <h3>Folders</h3>
          <ul class="folder-list">
            <li
              v-for="folder in folders.slice().reverse()"
              :key="folder.id"
              class="folder-item"
              @dragover.prevent="folderDragEnter"
              @dragleave="folderDragLeave"
              @drop="dropFileInFolder(folder)"
            >
              <span class="folder-name">{{ folder.name }}</span>
              <div class="folder-actions">
                <div style="display: flex; flex-direction: column; gap: 5px">
                  <button @click="deleteFolder(folder)" class="action-button">
                    Delete Folder
                  </button>
                  <button @click="downloadFolder(folder)" class="action-button">
                    Download Folder
                  </button>
                </div>
              </div>
              <ul class="folder-files">
                <li
                  v-for="file in folder.files"
                  :key="file.id"
                  class="file-item"
                  @dragstart="startDrag(file,folder)"
                  draggable="true"
                  @dragend="clearDraggedFile"
                >
                  <span class="file-name"
                    >{{ file.name }} ({{ formatFileSize(file.size) }})</span
                  >
                  <div class="file-actions">
                    <button @click="downloadFile(file)" class="action-button">
                      Download
                    </button>
                    <button
                      @click="removeFileFromFolder(file, folder)"
                      class="action-button delete"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <div v-else>
        <p>No files or folders created yet.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

import {
  uploadFile,
  deleteFile,
  getFiles,
  downloadFolderApi,
  updatePath,
  getFolders,
  uploadFolder,
  delFolder,
  deleteFileFromFolder,
  getuser,
} from "../services/api";

export default {
  data() {
    return {
      files: [],
      folders: [],
      newFile: null,
      newFolderName: "",
      draggedFile: null,
      sourceFolder: null,
      isDraggingOverFolder: false,
    };
  },
  methods: {
    // Fetch all files and folders from the server
    async FetchAllFiles() {
      try {
        const mail= await this.getCookie("lznk")
        if(mail){
        const data = await getFiles(mail);
        const folderdata = await getFolders(mail);
        this.files = [];
        this.folders = [];
        if (data) {
          data.forEach((file) => {
            const { _id, name, size, url, pathref } = file;
            this.files.push({
              name,
              size,
              source: url,
              pathref,
              id: _id,
            });
          });
        }
        if (folderdata && Array.isArray(folderdata)) {
          this.folders = folderdata.map((folder) => {
            const { files, _id, ...data } = folder;

            const updatedFiles = files.map((file) => {
              const { _id, ...rest } = file;
              return { id: _id, ...rest };
            });

            return { ...data, id: _id, files: updatedFiles };
          });
        }
      }
      } catch (error) {
        console.error("Error fetching files and folders:", error);
        this.files = [];
        this.folders = [];
      }
    },

    // Handle file upload selection
    handleFileUpload(event) {
      this.newFile = event.target.files[0];
    },

    // Upload file to server
    async uploadFile() {
      if (!this.newFile) return;

      const formData = new FormData();
      formData.append("file", this.newFile);

      try {
        const mail= await this.getCookie("lznk")
        if(mail){
        const response = await uploadFile(formData,mail);
        this.files.push({
          name: this.newFile.name,
          size: this.newFile.size,
          source: response.fileUrl,
          id: response.fileId,
        });
        this.newFile = null;
        this.$refs.fileInput.value = "";
        this.FetchAllFiles();
      }
      else{
        alert("Your are not Authenticated user , pls Go to Login Page and Login First")
      }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    },

    // Create a new folder
    async createFolder() {
      if (this.newFolderName.trim()) {
        const mail= await this.getCookie("lznk")
        if(mail){
          await uploadFolder(this.newFolderName,mail);
          this.FetchAllFiles();
        }
        else{
          alert("Your are not Authenticated user , pls Go to Login Page and Login First")
        }
        this.newFolderName = "";
      }
    },

    // Start dragging file to drop into folder
    startDrag(file,sourceFolder) {
      this.draggedFile = file;
      this.sourceFolder = sourceFolder; 
    },

    // Clear dragged file on drag end
    clearDraggedFile() {
      this.draggedFile = null;
      this.sourceFolder=null;
    },

    // Drop file into the target folder
    async dropFile(targetFolder) {
      if (this.draggedFile) {
        const mail= await this.getCookie("lznk")

        if (this.draggedFile.pathref == "file") {
          alert("We can't move file to self List");
        }
        await updatePath(
          this.draggedFile.id,
          "file",
          this.draggedFile.pathref,
          "file",
          null,
          this.sourceFolder.id,
          mail
        );
        this.FetchAllFiles();
        this.clearDraggedFile();
      }
    },

    // Drop file back into the main files list (outside folders)
    async dropFileInFolder(targetFolder) {
      try {
        if (this.draggedFile) {
          const mail= await this.getCookie("lznk")
          if (this.draggedFile.pathref != targetFolder.name) {
            const fileFolder = this.files.some(
              (file) => file.id === this.draggedFile.id
            );

            if (fileFolder) {
              console.log("ifFilefolder")
              await updatePath(
                this.draggedFile.id,
                targetFolder.name,
                "file",
                targetFolder.name,
                targetFolder.id, //toid
                mail
              );
            } else {
              console.log("elseFilefolder",this.sourceFolder.id)
              await updatePath(
                this.draggedFile.id,
                targetFolder.name,
                this.draggedFile.pathref,
                targetFolder.name,
                targetFolder.id, //toid
                this.sourceFolder.id, //fromid
                mail
              );
            }

            this.FetchAllFiles();
            this.clearDraggedFile();
          } else {
            alert("We can't move file to self folder");
          }
        }
      } catch (error) {
        if (
          error.response &&
          error.response.status === 404 &&
          error.response.data.message == "From Path and To Path Can't be same"
        ) {
          alert("We can't move file to self folder");
        } else {
          console.log("An error occurred:", error.message);
        }
      }
    },

    // Download individual file
    async downloadFile(file) {
      window.location.href = file.source || file.url;
    },

    // Download entire folder as a zip
    async downloadFolder(folder) {
      try {
        const response = await downloadFolderApi(folder.id);
        if (response && response.data) {
          const blob = response.data;

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(
            new Blob([blob], { type: "application/zip" })
          );

          link.download = `${folder.name}.zip`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.error("Failed to download folder");
        }
      } catch (error) {
        console.error("Error downloading folder:", error);
      }
    },
    async deleteFolder(folder) {
      try {
        await delFolder(folder.id);
        this.FetchAllFiles();
      } catch (error) {
        console.error("Error Deleting folder:", error);
      }
    },

    // Remove file from the folder
    async removeFileFromFolder(file, folder) {
      try {
        await deleteFileFromFolder(file.id, folder.id);
        this.FetchAllFiles();
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },

    // Remove file from the unorganized list
    async removeFile(file) {
      try {
        await deleteFile(file.id);
        this.files = this.files.filter((f) => f.id !== file.id);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },
    async Logout() {
      try {
        Cookies.remove("lznk");
        this.checkAuth();
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },
    async getUserData() {
      try {
        const response = await axios.get("backendurl/auth/session", {
          withCredentials: true,
        });
        this.setCookie("lznk", response.data.user.email);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },

    async setCookie(name, value) {
      const stringValue = JSON.stringify(value);
      const encryptedCookie = CryptoJS.AES.encrypt(
        stringValue,
        process.env.VUE_APP_SECRET_KEY
      ).toString();
      Cookies.set(name, encryptedCookie, { secure: true, sameSite: "Strict" });
    },

    async getCookie(name) {
      const encryptedCookie = Cookies.get(name);
      if (encryptedCookie) {
        const bytes = CryptoJS.AES.decrypt(
          encryptedCookie,
          process.env.VUE_APP_SECRET_KEY
        );
        const originalvalue = bytes.toString(CryptoJS.enc.Utf8);
        const parseValue = JSON.parse(originalvalue);
        return parseValue;
      } else {
        return "No token found";
      }
    },

    async checkAuth() {
     setTimeout(async() => {
     const data= await this.getCookie("lznk")
     if(data=="No token found"){
      this.$router.push('/');
     }
     }, 2000);
    },

    formatFileSize(size) {
      if (size < 1024) return `${size} bytes`;
      else if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
      else return `${(size / 1048576).toFixed(2)} MB`;
    },
  },
  mounted() {
    this.FetchAllFiles();
    this.getUserData();
    this.checkAuth();
  },
};
</script>

<style>

.flexCC-C {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.file-upload {
  max-width: 1000px;
  width: 100%;
}

.filesfolders-outer-div {
  margin-top: 10px;
  width: 100%;
}

.folder-list {
  list-style-type: none;
  padding: 0;
}

.folder-item {
  margin: 10px 0;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  position: relative;
}

.folder-actions {
  display: flex;
  justify-content: flex-end;
}

.file-list {
  list-style-type: none;
  padding: 0;
}

.file-item {
  margin: 10px 0;
  padding: 10px;
  background-color: #e6e6e6;
  border-radius: 5px;
  position: relative;
}

.file-actions {
  display: flex;
  justify-content: flex-end;
}

.empty {
  min-height: 100px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty::before {
  content: "Drag and drop files here or upload a file.";
  font-size: 16px;
}

.folder-upload {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  max-width: 400px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
}

.folder-input {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  transition: border-color 0.3s;
}

.folder-input:focus {
  outline: none;
  border-color: #007bff;
}

.upload-button {
  padding: 10px 15px;
  margin: auto 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button:disabled {
  background-color: #878c91;
  cursor: not-allowed;
}

.upload-button:not(:disabled):hover {
  background-color: #0056b3;
}

.folder-list {
  list-style-type: none;
  padding: 0;
}

.folder-item {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin: 5px 0;
  background-color: #fff;
  transition: box-shadow 0.3s, transform 0.3s;
}

.folder-item:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.folder-name {
  font-weight: bold;
  color: #333;
}

.folder-actions {
  display: flex;
  margin-top: 10px;
}

.action-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #218838;
}

.action-button.delete {
  background-color: #dc3545;
}

.action-button.delete:hover {
  background-color: #c82333;
}

.file-list {
  list-style-type: none;
  padding: 0;
  margin-top: 10px;
}

.file-list li {
  color: #555;
  margin-bottom: 5px;
}
</style>
