<template>
  <div class="page-container">
    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加银行</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="bankname" label="银行名称" min-width="200" />
      <el-table-column label="银行Logo" width="120">
        <template #default="{ row }">
          <el-image
            v-if="row.banklogo"
            :src="row.banklogo"
            :preview-src-list="[row.banklogo]"
            style="width: 50px; height: 50px"
            fit="cover"
          />
          <span v-else>-</span>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑银行' : '添加银行'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="银行名称" prop="bankname">
          <el-input v-model="form.bankname" placeholder="请输入银行名称" />
        </el-form-item>
        <el-form-item label="Logo地址">
          <el-input v-model="form.banklogo" placeholder="请输入银行Logo地址" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
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
import { webApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const defaultForm = { bankname: '', banklogo: '', sort: 0 }
const form = reactive({ ...defaultForm })
const rules = {
  bankname: [{ required: true, message: '请输入银行名称', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await webApi.listBank()
    tableData.value = res.data || res || []
  } catch {
    ElMessage.error('获取银行列表失败')
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
    bankname: row.bankname,
    banklogo: row.banklogo || '',
    sort: row.sort || 0,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await webApi.updateBank(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await webApi.createBank({ ...form })
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
    await ElMessageBox.confirm('确定删除该银行吗？', '提示', { type: 'warning' })
    await webApi.deleteBank(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>
