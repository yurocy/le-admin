<template>
  <div class="page-container">
    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加分类</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="classname" label="分类名称" min-width="200" />
      <el-table-column prop="info" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '添加分类'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="classname">
          <el-input v-model="form.classname" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.info" placeholder="分类描述" />
        </el-form-item>
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
import { articleApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const form = reactive({ classname: '', info: '' })
const rules = { classname: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

async function fetchData() {
  loading.value = true
  try {
    const res: any = await articleApi.listCategory()
    tableData.value = res.data || res || []
  } catch {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, { classname: '', info: '' })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, { classname: row.classname, info: row.info })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await articleApi.updateCategory(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await articleApi.createCategory({ ...form })
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
    await ElMessageBox.confirm('确定删除该分类吗？', '提示', { type: 'warning' })
    await articleApi.deleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>
