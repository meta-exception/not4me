<template>
  <div class="fixed-center text-center">
    <p class="text-faded">Sorry, nothing here...<strong>(404)</strong></p>
    <q-btn @click="$router.push('/')" color="secondary" style="width:200px;"
      >Go back</q-btn
    >
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Error404 extends Vue {}
</script>
