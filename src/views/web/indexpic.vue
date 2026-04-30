<template>
  <div class="page-container">
    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加轮播图</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="150" />
      <el-table-column prop="url" label="链接URL" min-width="200" show-overflow-tooltip />
      <el-table-column prop="path" label="图片路径" min-width="200" show-overflow-tooltip />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'success' : 'info'" size="small">{{ row.type === 1 ? '类型1' : '类型' + row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑轮播图' : '添加轮播图'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="链接URL" prop="url">
          <el-input v-model="form.url" placeholder="跳转链接URL" />
        </el-form-item>
        <el-form-item label="图片路径" prop="path">
          <el-input v-model="form.path" placeholder="图片路径" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-input-number v-model="form.type" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { webApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const defaultForm = { title: '', url: '', path: '', type: 0, sort: 0 }
const form = reactive({ ...defaultForm })
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  url: [{ required: true, message: '请输入链接URL', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await webApi.listIndexPic()
    tableData.value = res.data || res || []
  } catch {
    ElMessage.error('获取轮播图列表失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, { ...defaultForm })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    title: row.title,
    url: row.url,
    path: row.path,
    type: row.type || 0,
    sort: row.sort || 0,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await webApi.updateIndexPic(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await webApi.createIndexPic({ ...form })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该轮播图吗？', '提示', { type: 'warning' })
    await webApi.deleteIndexPic(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>
