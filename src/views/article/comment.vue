<template>
  <div class="page-container">
    <div class="search-bar">
      <el-select v-model="searchForm.type" placeholder="类型" clearable style="width: 120px">
        <el-option label="订单" :value="0" />
        <el-option label="代理" :value="1" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
      <div style="flex: 1" />
      <el-button type="primary" @click="handleAdd">添加评论</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 0 ? '' : 'success'">{{ typeMap[row.type] || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="usertel" label="用户电话" width="130" />
      <el-table-column label="关联订单" width="170">
        <template #default="{ row }">
          <el-button v-if="row.order_no" type="primary" link @click="goOrder(row.order_id)">{{ row.order_no }}</el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="内容" min-width="250" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.content && row.content.length > 80 ? row.content.slice(0, 80) + '...' : row.content }}
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP" width="130" />
      <el-table-column label="评分" width="100" align="center">
        <template #default="{ row }">
          <el-rate v-model="row.mark" disabled />
        </template>
      </el-table-column>
      <el-table-column prop="addtime" label="时间" width="170" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 添加评论对话框 -->
    <el-dialog v-model="dialogVisible" title="添加评论" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="评论类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
            <el-option label="订单" :value="0" />
            <el-option label="代理" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户电话" prop="usertel">
          <el-input v-model="form.usertel" placeholder="用户电话" />
        </el-form-item>
        <el-form-item label="关联订单">
          <el-input v-model="form.order_id" placeholder="订单ID（可选）" />
        </el-form-item>
        <el-form-item label="评论内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="3" placeholder="评论内容" />
        </el-form-item>
        <el-form-item label="评分">
          <el-rate v-model="form.mark" show-text :texts="['很差', '差', '一般', '好', '很好']" />
        </el-form-item>
        <el-form-item label="IP">
          <el-input v-model="form.ip" placeholder="IP地址（可选）" />
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { articleApi } from '@/api/business'

const router = useRouter()

const typeMap: Record<number, string> = { 0: '订单', 1: '代理' }

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const searchForm = reactive({ type: '' as any })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const defaultForm = {
  type: 0,
  usertel: '',
  order_id: '',
  content: '',
  mark: 5,
  ip: '',
}

const form = reactive({ ...defaultForm })

const rules = {
  type: [{ required: true, message: '请选择评论类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.type !== '' && searchForm.type != null) params.type = searchForm.type
    const res: any = await articleApi.listComment(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('获取评论列表失败') } finally { loading.value = false }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { searchForm.type = ''; pagination.page = 1; fetchData() }

function goOrder(orderId: number) {
  if (!orderId) return
  router.push({ path: '/product/order', query: { id: orderId } })
}

function handleAdd() {
  Object.assign(form, { ...defaultForm })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    const data: any = {
      type: form.type,
      usertel: form.usertel,
      content: form.content,
      mark: form.mark,
      ip: form.ip || undefined,
    }
    if (form.order_id) {
      data.order_id = parseInt(form.order_id) || undefined
    }
    await articleApi.createComment(data)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    fetchData()
  } catch { ElMessage.error('操作失败') } finally { submitLoading.value = false }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该评论吗？', '提示', { type: 'warning' })
    await articleApi.deleteComment(row.id)
    ElMessage.success('删除成功'); fetchData()
  } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>
