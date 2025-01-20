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
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold">ルーム一覧</h3>
        <!-- plus icon → open modal -->
        <svg @click="showNewRoomModal = true" xmlns="http://www.w3.org/2000/svg"
             class="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" fill="none"
             stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <ul class="space-y-1">
        <li v-for="r in roomsStore.rooms" :key="r.id" class="p-2 hover:bg-gray-200">
          <router-link
              :to="{ name: 'room', params: { id: r.id } }"
              class="flex items-center"
          >
            <span v-if="r.is_private" class="mr-1 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                 stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 11c.177 0 .351.014.523.04a4 4 0 10-6.945 3.725A4.992 4.992 0 006 16v2a2 2 0 002 2h8a2 2 0 002-2v-2a5 5 0 00-8-4H8">
              </path>
            </svg>
          </span>
            <span v-else class="mr-1 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                 stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M7 9h10M7 15h10M9 3v18M15 3v18" />
            </svg>
          </span>
            <span>{{ r.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>

    <hr class="my-2" />

    <!-- Users List -->
    <div class="mt-2">
      <h3 class="font-bold mb-2">ユーザー一覧</h3>
      <ul class="space-y-1">
        <li v-for="u in users" :key="u.id" class="p-2 hover:bg-gray-200 cursor-pointer"
            @click="startDirectChat(u.id)">
          {{ u.name }} ({{ u.status }})
        </li>
      </ul>
    </div>

    <!-- modal for new room -->
    <div v-if="showNewRoomModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <RoomForm
          :isEdit="false"
          :initialName="''"
          :initialPrivate="false"
          :allUsers="users"
          :initialUserIds="[]"
          @submit-room="handleCreateSubmit"
          @close="closeNewRoomModal"
      />
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
import RoomForm from '../components/RoomForm.vue'
import { useRoomsStore } from '../stores/rooms'

export default {
  name: "Sidebar",
  components: { RoomForm },
  data() {
    return {
      user: null,
      users: [],
      csrfToken: '',
      // new room modal
      showNewRoomModal: false,
      newRoomName: '',
      newRoomPrivate: false
    }
  },
  computed: {
    roomsStore() {
      return useRoomsStore()
    }
  },
  async created() {
    // CSRFトークン取得
    const token = document.querySelector('meta[name="csrf-token"]')
    if (token) {
      this.csrfToken = token.getAttribute('content')
    }

    // ログインユーザ情報取得
    const el = document.getElementById('vue-app')
    if (el && el.dataset.currentUser) {
      this.user = JSON.parse(el.dataset.currentUser)
    }

    const store = useRoomsStore()
    await store.fetchRooms()

    // ユーザリストを取得
    try {
      let resp = await fetch("/users.json")
      if (!resp.ok) throw new Error("Users fetch failed")
      let data = await resp.json()
      this.users = data
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    closeNewRoomModal() {
      this.showNewRoomModal = false
    },
    async handleCreateSubmit({ name, isPrivate, userIds }) {
      console.log("Sidebar handleCreateSubmit", name);
      const store = useRoomsStore()
      const roomData = await store.createRoom({
        name,
        isPrivate,
        userIds,
        csrfToken: this.csrfToken
      })
      if (roomData) {
        this.showNewRoomModal = false
        this.$router.push({ name: 'room', params: { id: roomData.id } })
      }
    },
    async startDirectChat(userId) {
      try {
        const resp = await fetch(`/rooms/direct.json?user_id=${userId}`)
        if (!resp.ok) {
          const errData = await resp.json()
          alert(errData.error || "ルーム取得失敗")
          return
        }
        const roomData = await resp.json()
        this.$router.push({ name: 'room', params: { id: roomData.id } })
      } catch (err) {
        console.error(err)
        alert("ルーム取得に失敗しました")
      }
    },
  }
}
</script>
