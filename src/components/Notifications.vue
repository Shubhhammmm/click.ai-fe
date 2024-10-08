<template>
  <div class="notifications">
    <p v-if="percentage" style="font-size: 30px;">{{ `${message}: ${percentage}%` }}</p>
  </div>
</template>

<script>
import { io } from "socket.io-client";

export default {
  data() {
    return {
      message:"",
      percentage:"",
      socket: null,
    };
  },
  mounted() {
    this.initializeSocket();
  },
  methods: {
    initializeSocket() {
      this.socket = io(process.env.VUE_APP_API_URL, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      });

      this.socket.on('connected', (data) => {
       console.log("socket",data)
      });

      this.socket.on("upload-progress-file", (data) => {
        this.message="File Uploading"
        this.percentage = data;
        if(data==100){
          setTimeout(() => {
            this.percentage="";
          }, 1000);
        }
      });
      this.socket.on("upload-progress-folder", (data) => {
        this.message="Folder Uploading"
        this.percentage = data;
        if(data==100){
          setTimeout(() => {
            this.percentage="";
          }, 1000);
        }
        console.log(data);
      });
    },
   
  },
};
</script>
