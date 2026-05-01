<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="关键词" clearable style="width: 180px" />
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加用户</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" width="100" />
      <el-table-column prop="usertel" label="电话" width="130" />
      <el-table-column prop="company" label="公司" min-width="140" show-overflow-tooltip />
      <el-table-column prop="address" label="地址" min-width="160" show-overflow-tooltip />
      <el-table-column prop="regtime" label="注册时间" width="170" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          <el-button :type="row.status ? 'warning' : 'success'" link @click="toggleStatus(row)">
            {{ row.status ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '添加用户'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="电话" prop="usertel">
          <el-input v-model="form.usertel" placeholder="电话号码" />
        </el-form-item>
        <el-form-item label="公司">
          <el-input v-model="form.company" placeholder="公司名称" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="详细地址" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { pricingApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ keyword: '', status: '' as any })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const defaultForm = { username: '', password: '', usertel: '', company: '', address: '', status: 1 }
const form = reactive({ ...defaultForm })

const rules: any = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.status !== '') params.status = searchForm.status
    const res: any = await pricingApi.listUser(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('获取用户列表失败') } finally { loading.value = false }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { Object.assign(searchForm, { keyword: '', status: '' }); pagination.page = 1; fetchData() }

function handleAdd() { isEdit.value = false; editId.value = 0; Object.assign(form, { ...defaultForm }); dialogVisible.value = true }
function handleEdit(row: any) { isEdit.value = true; editId.value = row.id; Object.assign(form, { username: row.username, password: '', usertel: row.usertel, company: row.company, address: row.address, status: row.status || 0 }); dialogVisible.value = true }

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    const payload = { ...form }
    if (isEdit.value && !payload.password) delete (payload as any).password
    if (isEdit.value) { await pricingApi.updateUser(editId.value, payload); ElMessage.success('更新成功') }
    else { await pricingApi.createUser(payload); ElMessage.success('添加成功') }
    dialogVisible.value = false; fetchData()
  } catch { ElMessage.error('操作失败') } finally { submitLoading.value = false }
}

async function handleDelete(row: any) {
  try { await ElMessageBox.confirm('确定删除该用户吗？', '提示', { type: 'warning' }); ElMessage.success('删除成功'); fetchData() } catch { /* cancelled */ }
}

async function toggleStatus(row: any) {
  try { await pricingApi.updateUserStatus(row.id, { status: row.status ? 0 : 1 }); ElMessage.success('状态更新成功'); fetchData() } catch { ElMessage.error('操作失败') }
}

onMounted(() => { fetchData() })
</script>
