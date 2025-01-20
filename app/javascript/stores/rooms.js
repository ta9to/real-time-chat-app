import { defineStore } from 'pinia'

export const useRoomsStore = defineStore('rooms', {
    state: () => ({
        rooms: [],
    }),
    actions: {
        async fetchRooms() {
            try {
                const resp = await fetch("/rooms.json")
                if (!resp.ok) throw new Error("Rooms fetch failed")
                const data = await resp.json()
                this.rooms = data
            } catch (err) {
                console.error(err)
            }
        },
        async createRoom({ name, isPrivate, userIds, csrfToken }) {
            try {
                const resp = await fetch("/rooms.json", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken
                    },
                    body: JSON.stringify({
                        room: {
                            name: name,
                            is_private: isPrivate,
                            user_ids: userIds,
                        }
                    })
                })
                if (!resp.ok) {
                    const err = await resp.json()
                    alert(err.errors || "ルーム作成エラー")
                    return
                }
                const roomData = await resp.json()
                this.rooms.push(roomData)
                return roomData
            } catch (error) {
                console.error(error)
                alert("新規ルーム作成に失敗しました")
            }
        },
        async updateRoom({ roomId, name, isPrivate, userIds, csrfToken }) {
            try {
                const resp = await fetch(`/rooms/${roomId}.json`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken
                    },
                    body: JSON.stringify({
                        room: {
                            name: name,
                            is_private: isPrivate,
                            user_ids: userIds,
                        }
                    })
                })
                if (!resp.ok) {
                    const err = await resp.json()
                    alert(err.errors || "ルーム更新エラー")
                    return
                }
                const updated = await resp.json()
                // rooms配列を更新
                const idx = this.rooms.findIndex(r => r.id === updated.id)
                if (idx !== -1) {
                    this.rooms[idx] = updated
                }
                return updated
            } catch (error) {
                console.error(error)
                alert("ルーム更新に失敗しました")
            }
        },
        async deleteRoom({ roomId, csrfToken }) {
            if(!confirm("本当に削除しますか？")) return
            try {
                const resp = await fetch(`/rooms/${roomId}.json`, {
                    method: "DELETE",
                    headers: {
                        "X-CSRF-Token": csrfToken
                    }
                })
                if(!resp.ok) {
                    alert("削除に失敗しました")
                    return
                }
                this.rooms = this.rooms.filter(r => r.id !== roomId)
                return true
            } catch (error) {
                console.error(error)
                alert("ルーム削除に失敗しました")
            }
        }
    }
})
