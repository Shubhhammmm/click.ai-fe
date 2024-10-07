<template>
    <div class="dashboard">
      <h2>Cloud File Manager</h2>
      <Notifications />
      <FileList />
    </div>
  </template>
  
  <script>
  import FileList from "../components/FileUpload.vue";
  import Notifications from "../components/Notifications.vue";
  
  export default {
    components: {  Notifications , FileList },
  };
  </script>
  