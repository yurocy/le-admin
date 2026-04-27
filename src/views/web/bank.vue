<template>
  <div class="page-container">
    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加银行账户</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="bank_name" label="银行名称" min-width="140" />
      <el-table-column prop="account_name" label="户名" min-width="140" />
      <el-table-column prop="account_no" label="账号" min-width="200" />
      <el-table-column prop="branch" label="支行" min-width="180" show-overflow-tooltip />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑银行账户' : '添加银行账户'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="银行名称" prop="bank_name">
          <el-input v-model="form.bank_name" placeholder="请输入银行名称" />
        </el-form-item>
        <el-form-item label="户名" prop="account_name">
          <el-input v-model="form.account_name" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="账号" prop="account_no">
          <el-input v-model="form.account_no" placeholder="请输入银行账号" />
        </el-form-item>
        <el-form-item label="支行">
          <el-input v-model="form.branch" placeholder="开户支行" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
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

const form = reactive({ bank_name: '', account_name: '', account_no: '', branch: '', sort: 0, status: true })
const rules = {
  bank_name: [{ required: true, message: '请输入银行名称', trigger: 'blur' }],
  account_name: [{ required: true, message: '请输入户名', trigger: 'blur' }],
  account_no: [{ required: true, message: '请输入账号', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try { const res: any = await webApi.listBank(); tableData.value = res.data || res || [] } catch { ElMessage.error('获取银行列表失败') } finally { loading.value = false }
}

function handleAdd() { isEdit.value = false; editId.value = 0; Object.assign(form, { bank_name: '', account_name: '', account_no: '', branch: '', sort: 0, status: true }); dialogVisible.value = true }
function handleEdit(row: any) { isEdit.value = true; editId.value = row.id; Object.assign(form, { bank_name: row.bank_name, account_name: row.account_name, account_no: row.account_no, branch: row.branch, sort: row.sort, status: row.status }); dialogVisible.value = true }

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) { await webApi.updateBank(editId.value, { ...form }); ElMessage.success('更新成功') }
    else { await webApi.createBank({ ...form }); ElMessage.success('添加成功') }
    dialogVisible.value = false; fetchData()
  } catch { ElMessage.error('操作失败') } finally { submitLoading.value = false }
}

async function handleDelete(row: any) {
  try { await ElMessageBox.confirm('确定删除该银行账户吗？', '提示', { type: 'warning' }); await webApi.deleteBank(row.id); ElMessage.success('删除成功'); fetchData() } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>
