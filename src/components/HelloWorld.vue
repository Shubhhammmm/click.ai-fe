<template>
  <div>
    <p>Hello</p>
    <p>Counter: {{ count }}</p>
    <p>Counter: {{ countt }}</p>
    <button @click="increment">Increase Counter</button>
    <button @click="incrementt">Increase Counter</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Counter state
const count = ref(0);
const countt = ref(0);

// Function to increment the counter
const increment = () => {
  count.value++;
};
const incrementt = () => {
  countt.value++;
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
