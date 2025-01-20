<template>
  <div class="bg-white p-4 w-96 rounded shadow">
    <h2 class="text-xl font-bold mb-2">プロフィール編集</h2>
    <form @submit.prevent="onSubmit" enctype="multipart/form-data">
      <!-- アバター -->
      <div class="mb-3">
        <label class="block font-semibold mb-1">アバター画像</label>
        <input type="file" @change="onFileChange" />
        <!-- 既存のプレビュー -->
        <div v-if="avatarUrl" class="mt-2 w-16 h-16 rounded-full overflow-hidden">
          <img :src="avatarUrl" class="object-cover w-full h-full" />
        </div>
      </div>

      <!-- ステータス -->
      <div class="mb-3">
        <label class="block font-semibold mb-1">ステータス</label>
        <input type="text" v-model="formStatus" class="border p-2 w-full" />
      </div>

      <div class="text-right">
        <button type="button" @click="$emit('closeProfile')" class="border px-3 py-1 rounded mr-2">キャンセル</button>
        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">更新</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "UserProfileForm",
  props: {
    initialStatus: { type: String, default: "" },
    avatarUrl: { type: String, default: "" }
  },
  data() {
    return {
      formStatus: this.initialStatus,
      newFile: null
    }
  },
  methods: {
    onFileChange(e) {
      this.newFile = e.target.files[0]
    },
    onSubmit() {
      this.$emit('submitProfile', {
        status: this.formStatus,
        file: this.newFile
      })
    }
  }
}
</script>
