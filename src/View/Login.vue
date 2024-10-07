<template>
  <div style="height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; flex-direction: column;">
    <h2>Login</h2>
    <button @click="loginWithGoogle">Login with Google</button>
  </div>
</template>


<script>
export default {
  methods: {
    loginWithGoogle() {
      window.location.href = 'https://foyr-backend.vercel.app/auth/google';
    },
  },
};
</script>