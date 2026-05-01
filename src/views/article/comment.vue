<template>
  <div class="page-container">
    <div class="search-bar">
      <el-select v-model="searchForm.type" placeholder="类型" clearable style="width: 120px">
        <el-option label="产品评论" :value="1" />
        <el-option label="文章评论" :value="2" />
        <el-option label="其他" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? '' : row.type === 2 ? 'success' : 'info'">{{ typeMap[row.type] || '其他' }}</el-tag>
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
      <el-table-column label="评分" width="80">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { articleApi } from '@/api/business'

const router = useRouter()

const typeMap: Record<number, string> = { 0: '其他', 1: '产品评论', 2: '文章评论' }

const loading = ref(false)
const tableData = ref<any[]>([])

const searchForm = reactive({ type: '' as any })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

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

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该评论吗？', '提示', { type: 'warning' })
    await articleApi.deleteComment(row.id)
    ElMessage.success('删除成功'); fetchData()
  } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>
