<script setup lang="ts">
const DotLottieVue = defineAsyncComponent(async () => {
  const module = await import('@lottiefiles/dotlottie-vue');
  return module.DotLottieVue;
});

defineProps({
  src: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <ClientOnly>
    <DotLottieVue
      v-if="DotLottieVue"
      class="h-full w-full"
      autoplay
      loop
      :src="src"
    />
    <template #fallback>
      <div class="h-full w-full flex items-center justify-center">
        <p>Loading Animation...</p>
      </div>
    </template>
  </ClientOnly>
</template>