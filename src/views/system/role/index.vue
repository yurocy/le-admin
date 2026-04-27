<template>
  <div class="page-container">
    <!-- Search Bar -->
    <el-card shadow="hover" class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="角色名称/Key"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="hover" class="table-card">
      <div class="table-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">添加角色</el-button>
      </div>
      <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="role_name" label="角色名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="role_key" label="角色标识" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.role_key }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.desc || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" link size="small" :icon="Setting" @click="handleAssignMenus(row)">分配菜单</el-button>
            <el-button type="danger" link size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="form.role_name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="role_key">
          <el-input v-model="form.role_key" placeholder="请输入角色标识 (如 admin)" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- Assign Menus Dialog -->
    <el-dialog
      v-model="menuDialogVisible"
      title="分配菜单权限"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-loading="menuLoading" style="min-height: 200px">
        <el-tree
          ref="menuTreeRef"
          :data="menuTree"
          show-checkbox
          node-key="id"
          :default-checked-keys="assignedMenuIds"
          :props="{ label: 'name', children: 'children' }"
          default-expand-all
          check-strictly
          class="menu-tree"
        />
      </div>
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="menuSubmitLoading" @click="submitMenuAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Setting } from '@element-plus/icons-vue'
import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  updateRoleMenus,
  listMenus,
  getRole,
} from '@/api/system'
import type { ElTree } from 'element-plus'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<any[]>([])

const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
})

const form = reactive({
  id: 0,
  role_name: '',
  role_key: '',
  sort: 0,
  status: 1 as number,
  desc: '',
})

const rules: FormRules = {
  role_name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  role_key: [{ required: true, message: '请输入角色标识', trigger: 'blur' }],
}

const dialogTitle = ref('添加角色')

// Menu assign
const menuDialogVisible = ref(false)
const menuLoading = ref(false)
const menuSubmitLoading = ref(false)
const menuTreeRef = ref<InstanceType<typeof ElTree>>()
const menuTree = ref<any[]>([])
const assignedMenuIds = ref<number[]>([])
const currentRoleId = ref(0)

async function fetchList() {
  loading.value = true
  try {
    const params: any = {}
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.status !== undefined) params.status = searchForm.status

    const { data } = await listRoles(params)
    tableData.value = data?.list || data?.items || data || []
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  fetchList()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = undefined
  fetchList()
}

function resetForm() {
  form.id = 0
  form.role_name = ''
  form.role_key = ''
  form.sort = 0
  form.status = 1
  form.desc = ''
}

function handleAdd() {
  isEdit.value = false
  dialogTitle.value = '添加角色'
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  Object.assign(form, {
    id: row.id,
    role_name: row.role_name,
    role_key: row.role_key,
    sort: row.sort || 0,
    status: row.status,
    desc: row.desc || '',
  })
  dialogVisible.value = true
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${row.role_name}"吗？如果该角色已分配给用户，删除后将影响相关用户的权限。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    // cancelled or error handled
  }
}

async function submitForm() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    const payload: any = {
      role_name: form.role_name,
      role_key: form.role_key,
      sort: form.sort,
      status: form.status,
      desc: form.desc,
    }
    if (isEdit.value) {
      await updateRole(form.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createRole(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch {
    // handled by interceptor
  } finally {
    submitLoading.value = false
  }
}

async function handleAssignMenus(row: any) {
  currentRoleId.value = row.id
  assignedMenuIds.value = []
  menuDialogVisible.value = true
  menuLoading.value = true

  try {
    // Load all menus for tree
    const [menuRes, roleRes] = await Promise.all([
      listMenus(),
      getRole(row.id),
    ])
    menuTree.value = menuRes.data?.list || menuRes.data?.items || menuRes.data || []
    // Get assigned menu ids (from role detail)
    const roleData = roleRes.data || {}
    assignedMenuIds.value = roleData.menu_ids || roleData.menus?.map((m: any) => m.id) || []
  } catch {
    // handled by interceptor
  } finally {
    menuLoading.value = false
  }
}

async function submitMenuAssign() {
  menuSubmitLoading.value = true
  try {
    const checkedKeys = menuTreeRef.value?.getCheckedKeys(false) as number[]
    const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() as number[]
    const allKeys = [...checkedKeys, ...halfCheckedKeys]
    await updateRoleMenus(currentRoleId.value, allKeys)
    ElMessage.success('菜单分配成功')
    menuDialogVisible.value = false
  } catch {
    // handled by interceptor
  } finally {
    menuSubmitLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.table-card {
  .table-actions {
    margin-bottom: 16px;
  }
}

.menu-tree {
  max-height: 400px;
  overflow-y: auto;
}
</style>
