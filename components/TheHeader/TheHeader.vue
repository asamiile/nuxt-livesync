<template>
  <header class="border-b">
    <div class="container mx-auto px-4">
      <div class="flex h-16 items-center justify-between">
        <h1 class="text-2xl font-bold">
          <NuxtLink to="/">LiveSync Director</NuxtLink>
        </h1>
        <nav>
          <ul class="flex items-center space-x-4">
            <li>
              <NuxtLink to="/admin/cues" class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Cues
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/admin/onair" class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                OnAir
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>
