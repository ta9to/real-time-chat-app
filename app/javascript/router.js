import { createRouter, createWebHistory } from 'vue-router'
import ChatRoom from './components/ChatRoom.vue'

const routes = [
    {
        path: '/rooms/:id',
        name: 'room',
        component: ChatRoom
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
