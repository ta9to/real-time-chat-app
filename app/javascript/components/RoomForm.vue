<template>
  <div class="bg-white p-4 w-96 rounded shadow">
    <h2 class="text-xl font-bold mb-2">
      {{ isEdit ? "ルーム編集" : "新規ルーム作成" }}
    </h2>
    <form @submit.prevent="onSubmit">
      <div class="mb-3">
        <label class="block mb-1">ルーム名</label>
        <input v-model="formName" class="border p-2 w-full" type="text" required />
      </div>
      <div class="mb-3">
        <label class="flex items-center">
          <input type="checkbox" v-model="formPrivate" class="mr-2" />
          プライベート
        </label>
      </div>

      <div class="flex justify-between items-center">
        <!-- 削除ボタン(編集モードのみ) -->
        <button
            v-if="isEdit"
            type="button"
            class="text-red-500"
            @click="$emit('delete')">
          削除
        </button>

        <div class="text-right">
          <button type="button" @click="$emit('close')" class="border px-3 py-1 mr-2 rounded">キャンセル</button>
          <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            {{ isEdit ? "更新" : "作成" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "RoomForm",
  props: {
    isEdit: { type: Boolean, default: false },
    initialName: { type: String, default: "" },
    initialPrivate: { type: Boolean, default: false }
  },
  data() {
    return {
      formName: this.initialName,
      formPrivate: this.initialPrivate,
    }
  },
  methods: {
    onSubmit() {
      this.$emit('submit-room', {
        name: this.formName,
        isPrivate: this.formPrivate
      })
    }
  }
}
</script>
