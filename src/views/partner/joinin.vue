<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="关键词" clearable style="width: 180px" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="contact" label="联系人" width="100" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="city" label="城市" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="joininStatusType(row.status)">{{ joininStatusMap[row.status] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="addtime" label="申请时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="success" link @click="handleApprove(row)" :disabled="row.status !== 1">通过</el-button>
          <el-button type="danger" link @click="handleReject(row)" :disabled="row.status !== 1">拒绝</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { partnerApi } from '@/api/business'

const joininStatusMap: Record<number, string> = { 1: '待审核', 2: '通过', 3: '拒绝' }

function joininStatusType(status: number) {
  const map: Record<number, string> = { 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

const loading = ref(false)
const tableData = ref<any[]>([])

const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    const res: any = await partnerApi.listJoinIn(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('获取入驻列表失败') } finally { loading.value = false }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { searchForm.keyword = ''; pagination.page = 1; fetchData() }

async function handleApprove(row: any) {
  try {
    await ElMessageBox.confirm('确定通过该申请吗？', '提示', { type: 'info' })
    await partnerApi.updateJoinInStatus(row.id, { status: 2 })
    ElMessage.success('已通过'); fetchData()
  } catch { /* cancelled */ }
}

async function handleReject(row: any) {
  try {
    await ElMessageBox.confirm('确定拒绝该申请吗？', '提示', { type: 'warning' })
    await partnerApi.updateJoinInStatus(row.id, { status: 3 })
    ElMessage.success('已拒绝'); fetchData()
  } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>
