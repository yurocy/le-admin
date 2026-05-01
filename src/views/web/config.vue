<template>
  <div class="page-container">
    <el-card v-loading="loading" shadow="never">
      <template #header>
        <span>网站配置</span>
      </template>
      <el-form ref="formRef" :model="form" label-position="top" style="max-width: 700px">
        <el-form-item label="网站标题">
          <el-input v-model="form.webtitle" placeholder="网站标题" />
        </el-form-item>
        <el-form-item label="网站名称">
          <el-input v-model="form.webname" placeholder="网站名称" />
        </el-form-item>
        <el-form-item label="网站描述">
          <el-input v-model="form.webdesc" type="textarea" :rows="2" placeholder="网站描述" />
        </el-form-item>
        <el-form-item label="网站URL">
          <el-input v-model="form.url" placeholder="网站URL" />
        </el-form-item>
        <el-form-item label="SEO关键词">
          <el-input v-model="form.webkey" placeholder="SEO关键词，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="ICP备案号">
          <el-input v-model="form.record" placeholder="ICP备案号" />
        </el-form-item>
        <el-form-item label="覆盖城市">
          <el-input v-model="form.covered_city" placeholder="覆盖城市" />
        </el-form-item>
        <el-form-item label="奖项">
          <el-input v-model="form.award" placeholder="奖项信息" />
        </el-form-item>
        <el-form-item label="奖项限额">
          <el-input-number v-model="form.award_limit" :min="0" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="公司地址" />
        </el-form-item>
        <el-form-item label="版权信息">
          <el-input v-model="form.copyright" placeholder="版权信息" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="handleSave">保存配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { webApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)

const defaultConfig = {
  webtitle: '', webname: '', webdesc: '', url: '', webkey: '',
  record: '', covered_city: '', award: '', award_limit: 0,
  address: '', copyright: '',
}

const form = reactive({ ...defaultConfig })

async function fetchConfig() {
  loading.value = true
  try {
    const res: any = await webApi.getConfig()
    const data = res.data || res
    Object.keys(defaultConfig).forEach(key => {
      (form as any)[key] = data[key] ?? defaultConfig[key as keyof typeof defaultConfig]
    })
  } catch {
    ElMessage.error('获取配置失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  submitLoading.value = true
  try {
    await webApi.updateConfig({ ...form })
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>
