<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <ClientOnly>
      <Toaster />
    </ClientOnly>
  </NuxtLayout>
</template>
