<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
      <q-toolbar>
        <q-btn
          @click="leftDrawerOpen = !leftDrawerOpen"
          flat
          dense
          round
          aria-label="Menu"
        >
          <q-icon name="mdi-menu" />
        </q-btn>

        <q-toolbar-title>
          App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Layout extends Vue {}
</script>

<style></style>
