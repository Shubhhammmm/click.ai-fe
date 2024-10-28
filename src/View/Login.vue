
<template>
  <div style="
  height: 100vh;
  width: 100vw; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;">
  <div class="loginContainer" >
    <div class="form-wrapper" :class="{ 'shift-left': !isLogin }">
      <!-- Login Form -->
      <div class="form-container">
        <h1>Login</h1>
        <form @submit.prevent="loginUser">
          <div class="nameDiv">
            <label for="email">Email:</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input type="email" v-model="email" id="loginEmail" required />
            </div>
          </div>
          <div class="nameDiv">
            <label for="password">Password:</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input
                type="password"
                v-model="password"
                id="loginPassword"
                required
              />
            </div>
          </div>
          <button class="submit-button" type="submit">Login</button>
        </form>
      </div>

      <!-- Register Form -->
      <div class="form-container">
        <h1>Register</h1>
        <form @submit.prevent="registerUser">
          <div class="nameDiv">
            <label for="name">Name:</label>
            <div class="input-wrapper">
              <i class="fas fa-user"></i>
              <input type="text" v-model="name" id="registerName" required />
            </div>
          </div>
          <div class="nameDiv">
            <label for="email">Email:</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input type="email" v-model="email" id="registerEmail" required />
            </div>
          </div>
          <div class="nameDiv">
            <label for="password">Password:</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input
                type="password"
                v-model="password"
                id="registerPassword"
                required
              />
            </div>
          </div>
          <button class="submit-button" type="submit">Register</button>
        </form>
      </div>
    </div>

    <!-- Toggle Link -->
    <div class="toggle-link">
      <button v-if="!isLogin" @click="loginWithGoogle" class="submit-button" style="max-width: 300px;">Register with Google</button>
      <p>
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
        <a href="#" @click.prevent="toggleForm">
          {{ isLogin ? "Register" : "Login" }}
        </a>
      </p>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.css';
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      isLogin: true,
    };
  },
  methods: {
    loginWithGoogle() {
      window.location.href = 'backendurl/auth/google';
    },
    toggleForm() {
      this.isLogin = !this.isLogin;
      this.clearForm();
    },
    clearForm() {
      this.name = "";
      this.email = "";
      this.password = "";
    },
    async registerUser() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(this.email)) {
    alert("Please enter a valid email address");
    return;
  }
  try {
    const response = await axios.post(
      "backendurl/auth/user/register",
      {
        Name: this.name,
        email: this.email,
        password: this.password,
      }
    );
    // this.isLogin = true;
    if (response?.status === 200) {
      this.toggleForm();
      alert("Successfully Registered , now Please Login");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error during registration:", error.response.data);
      alert("User already exists");
    } else {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again later.");
    }
  }
    },
    async loginUser() {
      try {
          const response = await axios.post("backendurl/auth/user/login", {
            email: this.email,
            password: this.password,
          });
          if (response) {
            this.setCookie("lznk", response.data.user.email);
            this.$router.push('/Dashboard');
          }
        } catch (error) {
          if(error.response.data.message=="User Not Found"){
            console.error("Error during login:", error.response);
            alert("User Not Found Pls Register First");
          }
          else if (error.response) {
            console.error("Error during login:", error.response.data);
            alert("Please enter valid credentials");
          } else {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again later.");
          }
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
  },
};
</script>

<style>
.loginContainer {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background: linear-gradient(to bottom right, #e0f7fa, #ffffff);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
}

.form-wrapper {
  display: flex;
  width: 200%;
  transition: transform 0.5s ease-in-out;
}

.form-container {
  width: 50%;
  padding: 20px;
}
.form-container form{
  padding-left: 30px;
}

.shift-left {
  transform: translateX(-50%);
}

h1 {
  text-align: center;
  font-family: "Montserrat", sans-serif;
  color: #00796b;
  margin-bottom: 20px;
}

.nameDiv {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-size: 14px;
  margin-bottom: 5px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper i {
  position: absolute;
  left: 10px;
  top: 12px;
  color: #00796b;
}

input {
  border: 1px solid #b2dfdb;
  height: 40px;
  width: 80%;
  border-radius: 5px;
  padding-left: 35px;
  font-size: 17px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #00796b;
  outline: none;
}

.submit-button {
  padding: 10px;
  background: linear-gradient(to right, #00796b, #004d40);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 15px;
  width: 92%;
}

.submit-button:hover {
  background: #004d40;
}

.toggle-link {
  text-align: center;
  margin-top: 15px;
}

a {
  color: #00796b;
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #004d40;
}
</style>
