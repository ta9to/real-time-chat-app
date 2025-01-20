<!-- Sidebar.vue -->
<template>
  <div class="h-full p-4 bg-gray-50 flex flex-col">
    <!-- Profile Section -->
    <div v-if="user" class="mb-4 bg-white rounded shadow p-3 text-center flex flex-col items-center">
      <div class="w-16 h-16 rounded-full overflow-hidden mb-2">
        <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover" />
      </div>
      <div class="font-bold text-lg">{{ user.name }}</div>
      <div class="text-sm text-gray-500">{{ user.status }}</div>
      <svg @click="showProfileModal = true" class="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800 absolute top-6 left-6" viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M424.5,216.5h-15.2c-12.4,0-22.8-10.7-22.8-23.4c0-6.4,2.7-12.2,7.5-16.5l9.8-9.6c9.7-9.6,9.7-25.3,0-34.9l-22.3-22.1  c-4.4-4.4-10.9-7-17.5-7c-6.6,0-13,2.6-17.5,7l-9.4,9.4c-4.5,5-10.5,7.7-17,7.7c-12.8,0-23.5-10.4-23.5-22.7V89.1  c0-13.5-10.9-25.1-24.5-25.1h-30.4c-13.6,0-24.4,11.5-24.4,25.1v15.2c0,12.3-10.7,22.7-23.5,22.7c-6.4,0-12.3-2.7-16.6-7.4l-9.7-9.6  c-4.4-4.5-10.9-7-17.5-7s-13,2.6-17.5,7L110,132c-9.6,9.6-9.6,25.3,0,34.8l9.4,9.4c5,4.5,7.8,10.5,7.8,16.9  c0,12.8-10.4,23.4-22.8,23.4H89.2c-13.7,0-25.2,10.7-25.2,24.3V256v15.2c0,13.5,11.5,24.3,25.2,24.3h15.2  c12.4,0,22.8,10.7,22.8,23.4c0,6.4-2.8,12.4-7.8,16.9l-9.4,9.3c-9.6,9.6-9.6,25.3,0,34.8l22.3,22.2c4.4,4.5,10.9,7,17.5,7  c6.6,0,13-2.6,17.5-7l9.7-9.6c4.2-4.7,10.2-7.4,16.6-7.4c12.8,0,23.5,10.4,23.5,22.7v15.2c0,13.5,10.8,25.1,24.5,25.1h30.4  c13.6,0,24.4-11.5,24.4-25.1v-15.2c0-12.3,10.7-22.7,23.5-22.7c6.4,0,12.4,2.8,17,7.7l9.4,9.4c4.5,4.4,10.9,7,17.5,7  c6.6,0,13-2.6,17.5-7l22.3-22.2c9.6-9.6,9.6-25.3,0-34.9l-9.8-9.6c-4.8-4.3-7.5-10.2-7.5-16.5c0-12.8,10.4-23.4,22.8-23.4h15.2  c13.6,0,23.3-10.7,23.3-24.3V256v-15.2C447.8,227.2,438.1,216.5,424.5,216.5z M336.8,256L336.8,256c0,44.1-35.7,80-80,80  c-44.3,0-80-35.9-80-80l0,0l0,0c0-44.1,35.7-80,80-80C301.1,176,336.8,211.9,336.8,256L336.8,256z"/></svg>
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

    <!-- プロフィール編集モーダル -->
    <div v-if="showProfileModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <UserProfileForm
          :initialStatus="user.status"
          :avatarUrl="user.avatar_url"
          @submitProfile="handleProfileSubmit"
          @closeProfile="closeProfileModal"
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
import UserProfileForm from '../components/UserProfileForm.vue'
import RoomForm from '../components/RoomForm.vue'
import { useRoomsStore } from '../stores/rooms'

export default {
  name: "Sidebar",
  components: { UserProfileForm, RoomForm },
  data() {
    return {
      user: null,
      users: [],
      csrfToken: '',
      // new room modal
      showNewRoomModal: false,
      newRoomName: '',
      newRoomPrivate: false,
      showProfileModal: false,
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
    closeProfileModal() {
      this.showProfileModal = false
    },
    async handleProfileSubmit({ status, file }) {
      // PATCH /users/:id.json with formdata
      const formData = new FormData()
      formData.append('user[status]', status || '')
      if (file) {
        formData.append('user[avatar]', file)
      }

      try {
        const resp = await fetch(`/users/${this.user.id}.json`, {
          method: "PATCH",
          headers: {
            "X-CSRF-Token": this.csrfToken
          },
          body: formData
        })
        if (!resp.ok) {
          const err = await resp.json()
          alert(err.errors || "プロフィール更新失敗")
          return
        }
        const updatedUser = await resp.json()
        // userを更新 (avatar_url, status)
        this.user = updatedUser
        this.showProfileModal = false
      } catch (err) {
        console.error(err)
        alert("プロフィール更新エラー")
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
