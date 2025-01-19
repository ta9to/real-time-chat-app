<template>
  <div class="flex h-screen">
    <Sidebar class="w-1/4 border-r" />
    <div class="flex-1">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue'
export default {
  name: "App",
  components: { Sidebar },
}
</script>
