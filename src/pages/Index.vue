<template>
  <q-page class="row flex flex-center">
    <q-input v-model="text" class="col-10" autogrow filled type="textarea">
      <template v-slot:append>
        <q-icon
          @click="processInput()"
          name="mdi-equal-box"
          class="q-mb-md self-end cursor-pointer"
        />
      </template>
    </q-input>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { validValue } from '../utils/examples.ts';

@Component
export default class PageIndex extends Vue {
  private text = validValue;

  processInput() {
    if (this.text.length) {
      this.$store.dispatch('grammarProcessor/process', this.text);
    }
  }
}
</script>

<style lang="scss">
.q-field__append {
  height: 100%;
}
</style>
