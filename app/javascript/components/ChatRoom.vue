<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b flex items-center">
      <!-- if private => lock / else => hash -->
      <span v-if="room?.is_private" class="text-gray-600 mr-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c.177 0 .351.014.523.04a4 4 0 10-6.945 3.725A4.992 4.992 0 006 16v2a2 2 0 002 2h8a2 2 0 002-2v-2a5 5 0 00-8-4H8"></path>
        </svg>
      </span>
      <span v-else class="text-gray-600 mr-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 9h10M7 15h10M9 3v18M15 3v18" />
        </svg>
      </span>

      <h2 class="text-xl font-bold">
        {{ room?.name }}
      </h2>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-auto p-4">
      <div v-for="msg in messages" :key="msg.id" class="mb-2">
        <span class="font-semibold mr-1">{{ msg.user.name }}:</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>

    <!-- Form -->
    <form class="border-t p-2 flex" @submit.prevent="submitMessage">
      <textarea v-model="newMessage" class="flex-1 border rounded mr-2 p-2" rows="2"></textarea>
      <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">送信</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "ChatRoom",
  beforeRouteUpdate(to, from, next) {
    this.fetchRoom(to.params.id)
    next()
  },
  computed: {
    roomId() {
      return this.$route.params.id
    }
  },
  data() {
    return {
      room: null,
      messages: [],
      newMessage: ""
    }
  },
  async created() {
    this.roomId = this.$route.params.id
    this.fetchRoom(this.roomId)
  },
  methods: {
    async fetchRoom(id) {
      const resp = await fetch(`/rooms/${id}.json`)
      const data = await resp.json()
      this.room = data
      this.messages = data.messages || []
    },
    async submitMessage() {
      if (!this.newMessage.trim()) return
      const newMsg = {
        id: Date.now(),
        user: { name: "You" },
        content: this.newMessage
      }
      this.messages.push(newMsg)
      this.newMessage = ""
    }
  }
}
</script>
