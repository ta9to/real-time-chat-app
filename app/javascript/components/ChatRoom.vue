<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b flex items-center justify-between">
      <div class="flex items-center">
        <span v-if="room?.is_private" class="text-gray-600 mr-1"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c.177 0 .351.014.523.04a4 4 0 10-6.945 3.725A4.992 4.992 0 006 16v2a2 2 0 002 2h8a2 2 0 002-2v-2a5 5 0 00-8-4H8"></path></svg></span>
        <span v-else class="text-gray-600 mr-1"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 9h10M7 15h10M9 3v18M15 3v18" /></svg></span>
        <h2 class="text-xl font-bold">{{ room?.name }}</h2>
      </div>
      <!-- gear icon -->
      <svg v-if="!isRootRoom" @click="showEditModal = true" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800"
           fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M10.325 4.317c.426-1.756 3.924-1.756 4.35 0a1.998 1.998 0 002.549
                 1.367c1.522-.58 3.198.64 2.618 2.162a1.999 1.999 0 001.367
                 2.549c1.756.426 1.756 3.924 0 4.35a1.998 1.998 0 00-1.367
                 2.549c.58 1.522-.64 3.198-2.162 2.618a1.999 1.999 0 00-2.549
                 1.367c-.426 1.756-3.924 1.756-4.35
                 0a1.998 1.998 0 00-2.549-1.367c-1.522.58-3.198-.64-2.618-2.162a1.999
                 1.999 0 00-1.367-2.549c-1.756-.426-1.756-3.924
                 0-4.35a1.999 1.999 0 001.367-2.549c-.58-1.522.64-3.198
                 2.162-2.618a1.998 1.998 0 002.549-1.367z" />
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-auto p-4">
      <div v-for="msg in messages" :key="msg.id" class="mb-2">
        <span class="font-semibold mr-1">{{ msg.user.name }}:</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>

    <!-- edit modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <RoomForm
          :isEdit="true"
          :initialName="room?.name || ''"
          :initialPrivate="room?.is_private || false"
          :allUsers="allUsers"
          :initialUserIds="currentMemberIds"
          @submit-room="handleUpdateSubmit"
          @delete="handleDelete"
          @close="closeEditModal"
      />
    </div>

    <!-- Form -->
    <form class="border-t p-2 flex" @submit.prevent="submitMessage">
      <textarea v-model="newMessage" class="flex-1 border rounded mr-2 p-2" rows="2"></textarea>
      <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">送信</button>
    </form>
  </div>
</template>

<script>
import RoomForm from '../components/RoomForm.vue'
import { useRoomsStore } from '../stores/rooms'

const rootRoomId = '1'

export default {
  name: "ChatRoom",
  components: { RoomForm },
  beforeRouteUpdate(to, from, next) {
    this.fetchRoom(to.params.id)
    this.fetchMembers(to.params.id)
    next()
  },
  computed: {
    isRootRoom() {
      return this.roomId === rootRoomId
    },
    roomId() { return this.$route.params.id },
    roomsStore() {
      return useRoomsStore()
    }
  },
  data() {
    return {
      room: null,
      allUsers: [],
      currentMemberIds: [],
      messages: [],
      newMessage: "",
      showEditModal: false,
      editRoomName: '',
      editRoomPrivate: false
    }
  },
  async created() {
    this.fetchRoom(this.roomId)
    this.fetchMessages(this.roomId)
    this.fetchMembers(this.roomId)
    this.fetchAllUsers()
  },
  methods: {
    async fetchRoom(id) {
      const resp = await fetch(`/rooms/${id}.json`)
      const data = await resp.json()
      this.room = data
      this.editRoomName = data.name
      this.editRoomPrivate = data.is_private
    },
    async fetchMessages(id) {
      const resp = await fetch(`/rooms/${id}/messages`)
      this.messages = await resp.json()
    },
    async fetchMembers(id) {
      const resp = await fetch(`/rooms/${id}/members.json`)
      this.currentMemberIds = await resp.json()
    },
    async fetchAllUsers() {
      const resp = await fetch("/users.json")
      this.allUsers = await resp.json()
    },
    closeEditModal() {
      this.showEditModal = false
    },
    async handleUpdateSubmit({ name, isPrivate, userIds }) {
      const store = useRoomsStore()
      const updated = await store.updateRoom({
        roomId: this.room?.id,
        name,
        isPrivate,
        userIds,
        csrfToken: document.querySelector('[name="csrf-token"]').content
      })
      if (updated) {
        this.room = updated
        this.currentMemberIds = userIds
        this.closeEditModal()
      }
    },
    async handleDelete() {
      const store = useRoomsStore()
      const ok = await store.deleteRoom({
        roomId: this.room?.id,
        csrfToken: document.querySelector('[name="csrf-token"]').content
      })
      if (ok) {
        this.closeEditModal()
        this.$router.push({ name: 'room', params: { id: rootRoomId } })
      }
    },
    async submitMessage() {
      if (!this.newMessage.trim()) return

      try {
        const token = document.querySelector('[name="csrf-token"]').content
        const resp = await fetch(`/rooms/${this.roomId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
          },
          body: JSON.stringify({
            message: {
              content: this.newMessage
            }
          })
        })
        if (!resp.ok) {
          const errData = await resp.json()
          alert('メッセージ送信エラー: ' + errData.errors.join(', '))
          return
        }
        const createdMessage = await resp.json()
        this.messages.push(createdMessage)
        this.newMessage = ""
      } catch (error) {
        console.error(error)
        alert('メッセージ送信に失敗しました。')
      }
    }
  }
}
</script>
