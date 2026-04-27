<template>
  <div class="page-container">
    <!-- Table -->
    <el-card shadow="hover" class="table-card">
      <div class="table-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd(null)">添加菜单</el-button>
        <el-button @click="toggleExpand">
          {{ isExpanded ? '收起全部' : '展开全部' }}
        </el-button>
      </div>
      <el-table
        ref="tableRef"
        :data="menuTree"
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children' }"
        :default-expand-all="isExpanded"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="菜单名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="icon" label="图标" width="90" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.path || '-' }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="type" label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'primary' : 'success'" size="small">
              {{ row.type === 1 ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="perm" label="权限标识" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.perm || '-' }}</template>
        </el-table-column>
        <el-table-column prop="hidden" label="隐藏" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hidden === 1 ? 'danger' : 'info'" size="small">
              {{ row.hidden === 1 ? '隐藏' : '显示' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.type === 1"
              type="success"
              link
              size="small"
              :icon="Plus"
              @click="handleAdd(row)"
            >
              新增
            </el-button>
            <el-button type="primary" link size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上级菜单" prop="parent_id">
          <el-tree-select
            v-model="form.parent_id"
            :data="parentMenuTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择上级菜单 (不选则为顶级)"
            clearable
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路由路径 (如 /system/user)" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标名称 (如 User, Setting)" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type === 2" label="权限标识" prop="perm">
          <el-input v-model="form.perm" placeholder="请输入权限标识 (如 system:user:list)" />
        </el-form-item>
        <el-form-item v-if="form.type === 1" label="隐藏" prop="hidden">
          <el-switch v-model="form.hidden" :active-value="1" :inactive-value="0" active-text="隐藏" inactive-text="显示" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { listMenus, createMenu, updateMenu, deleteMenu } from '@/api/system'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const isExpanded = ref(true)
const formRef = ref<FormInstance>()
const tableRef = ref<any>()
const menuTree = ref<any[]>([])
const parentMenuTree = ref<any[]>([])

const form = reactive({
  id: 0,
  parent_id: undefined as number | undefined,
  name: '',
  path: '',
  icon: '',
  sort: 0,
  type: 1 as number,
  perm: '',
  hidden: 0 as number,
  status: 1 as number,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

const dialogTitle = ref('添加菜单')

async function fetchList() {
  loading.value = true
  try {
    const { data } = await listMenus()
    const list = data?.list || data?.items || data || []
    menuTree.value = list
    parentMenuTree.value = buildParentOptions(list)
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

// Build flat list of parent menu options (only type=1, menus not buttons)
function buildParentOptions(tree: any[], parent: any = null): any[] {
  const result: any[] = []
  for (const item of tree) {
    if (item.type === 1) {
      result.push({ id: item.id, name: item.name, children: [] })
      if (item.children && item.children.length > 0) {
        const childOptions = buildParentOptions(item.children, item)
        result[result.length - 1].children = childOptions
      }
    }
  }
  return result
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  // Force table re-render to toggle expand
  nextTick(() => {
    const table = tableRef.value
    if (table) {
      menuTree.value.forEach((row: any) => {
        table.toggleRowExpansion(row, isExpanded.value)
      })
    }
  })
}

function resetForm() {
  form.id = 0
  form.parent_id = undefined
  form.name = ''
  form.path = ''
  form.icon = ''
  form.sort = 0
  form.type = 1
  form.perm = ''
  form.hidden = 0
  form.status = 1
}

function handleAdd(parentRow: any | null) {
  isEdit.value = false
  dialogTitle.value = parentRow ? `在"${parentRow.name}"下添加子菜单` : '添加菜单'
  resetForm()
  if (parentRow) {
    form.parent_id = parentRow.id
  }
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  dialogTitle.value = '编辑菜单'
  Object.assign(form, {
    id: row.id,
    parent_id: row.parent_id || undefined,
    name: row.name,
    path: row.path || '',
    icon: row.icon || '',
    sort: row.sort || 0,
    type: row.type,
    perm: row.perm || '',
    hidden: row.hidden || 0,
    status: row.status,
  })
  dialogVisible.value = true
}

async function handleDelete(row: any) {
  try {
    const hasChildren = row.children && row.children.length > 0
    let msg = `确定要删除菜单"${row.name}"吗？`
    if (hasChildren) {
      msg += '该菜单下存在子菜单，删除后子菜单也将被删除。'
    }
    await ElMessageBox.confirm(msg, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteMenu(row.id)
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
      parent_id: form.parent_id || 0,
      name: form.name,
      path: form.path,
      icon: form.icon,
      sort: form.sort,
      type: form.type,
      perm: form.perm,
      hidden: form.hidden,
      status: form.status,
    }
    if (isEdit.value) {
      await updateMenu(form.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createMenu(payload)
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

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.table-card {
  .table-actions {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
  }
}
</style>
