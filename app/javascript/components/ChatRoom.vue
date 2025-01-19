<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b">
      <h2 class="font-bold text-xl">ChatRoom #{{ roomId }}</h2>
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
  props: {
    roomId: String,
    currentUserId: String
  },
  data() {
    return {
      messages: [],
      newMessage: ""
    }
  },
  async created() {
    this.messages = [
      { id: 101, user: { name: "Alice" }, content: "Hello" },
      { id: 102, user: { name: "Bob" }, content: "Hi there" }
    ]
  },
  methods: {
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
