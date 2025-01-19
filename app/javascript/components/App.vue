<template>
  <div class="flex h-screen">
    <Sidebar
        :room-id="roomId"
        :current-user-id="currentUserId"
        class="w-1/4 border-r"
    />
    <div class="flex-1">
      <ChatRoom
          :room-id="roomId"
          :current-user-id="currentUserId"
          class="h-full"
      />
    </div>
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue'
import ChatRoom from './ChatRoom.vue'

export default {
  name: "App",
  props: {
    roomId: String,
    currentUserId: String
  },
  components: { Sidebar, ChatRoom },
  setup(props) {
    return { ...props }
  }
}
</script>
