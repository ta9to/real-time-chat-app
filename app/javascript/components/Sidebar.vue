<!-- Sidebar.vue -->
<template>
  <div class="h-full p-4 bg-gray-50 flex flex-col">
    <!-- Profile Section -->
    <div v-if="user" class="mb-4 bg-white rounded shadow p-3 text-center flex flex-col items-center">
      <div class="w-16 h-16 rounded-full overflow-hidden mb-2">
        <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover" />
      </div>
      <div class="font-bold text-lg">
        {{ user.name }}
      </div>
      <div class="text-sm text-gray-500">
        {{ user.status || 'オフライン' }}
      </div>
    </div>

    <hr class="my-2" />

    <!-- Room List -->
    <div class="flex-1 overflow-auto">
      <h3 class="font-bold mb-2">ルーム一覧</h3>
      <ul class="space-y-1">
        <li v-for="r in rooms" :key="r.id" class="p-2 hover:bg-gray-200 cursor-pointer">
          {{ r.name }}
        </li>
      </ul>
    </div>

    <div class="mt-4">
      <form action="/logout" method="post" @submit="onLogoutSubmit">
        <input type="hidden" name="_method" value="delete">
        <input type="hidden" name="authenticity_token" :value="csrfToken">
        <button type="submit" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
          ログアウト
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Sidebar",
  props: {
    roomId: String,
    currentUserId: String
  },
  data() {
    return {
      user: null,
      rooms: []
    }
  },
  async created() {
    const token = document.querySelector('meta[name="csrf-token"]')
    if (token) {
      this.csrfToken = token.getAttribute('content')
    }

    const el = document.getElementById('vue-app')
    if (el && el.dataset.currentUser) {
      this.user = JSON.parse(el.dataset.currentUser)
    }

    this.rooms = [
      { id: 1, name: "General" },
      { id: 2, name: "Random" }
    ]
  },
  methods: {
  }
}
</script>
