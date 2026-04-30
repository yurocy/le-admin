<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="姓名/电话/QQ" clearable style="width: 180px" />
      <el-select v-model="searchForm.type" placeholder="申请类型" clearable style="width: 120px">
        <el-option label="加盟商" :value="1" />
        <el-option label="代理商" :value="2" />
      </el-select>
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="待审核" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="已拒绝" :value="2" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? '' : 'warning'">{{ row.type === 1 ? '加盟商' : '代理商' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="姓名" width="100" />
      <el-table-column prop="usertel" label="电话" width="130" />
      <el-table-column prop="qq" label="QQ" width="120" />
      <el-table-column prop="address" label="地址" min-width="160" show-overflow-tooltip />
      <el-table-column prop="info" label="信息" min-width="140" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusMap[row.status] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="mark" label="备注" width="120" show-overflow-tooltip />
      <el-table-column prop="addtime" label="申请时间" width="170" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">详情</el-button>
          <el-button type="success" link @click="handleApprove(row)" :disabled="row.status !== 0">通过</el-button>
          <el-button type="danger" link @click="handleReject(row)" :disabled="row.status !== 0">拒绝</el-button>
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

    <!-- 详情/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="申请详情" width="500px" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ viewRow.id }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ viewRow.type === 1 ? '加盟商' : '代理商' }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ viewRow.username }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ viewRow.usertel }}</el-descriptions-item>
        <el-descriptions-item label="QQ">{{ viewRow.qq || '-' }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ viewRow.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="信息">{{ viewRow.info || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(viewRow.status)">{{ statusMap[viewRow.status] || '未知' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ viewRow.mark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ viewRow.addtime }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="viewRow.status === 0" style="margin-top: 16px">
        <el-form :model="auditForm" label-width="60px">
          <el-form-item label="备注">
            <el-input v-model="auditForm.mark" type="textarea" :rows="2" placeholder="审核备注（可选）" />
          </el-form-item>
        </el-form>
        <div style="text-align: right">
          <el-button type="success" @click="handleApprove(viewRow)">通过</el-button>
          <el-button type="danger" @click="handleReject(viewRow)">拒绝</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { partnerApi } from '@/api/business'

const statusMap: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝' }

function statusType(status: number) {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const loading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const viewRow = ref<any>({})
const auditForm = reactive({ mark: '' })

const searchForm = reactive({ keyword: '', type: '' as any, status: '' as any })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.type !== '' && searchForm.type != null) params.type = searchForm.type
    if (searchForm.status !== '' && searchForm.status != null) params.status = searchForm.status
    const res: any = await partnerApi.listJoinIn(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('获取入驻列表失败') } finally { loading.value = false }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { Object.assign(searchForm, { keyword: '', type: '', status: '' }); pagination.page = 1; fetchData() }

function handleView(row: any) {
  viewRow.value = { ...row }
  auditForm.mark = row.mark || ''
  dialogVisible.value = true
}

async function handleApprove(row: any) {
  try {
    const mark = auditForm.mark
    if (row.status === 0) {
      await ElMessageBox.confirm('确定通过该申请吗？', '提示', { type: 'info' })
    }
    await partnerApi.updateJoinInStatus(row.id, { status: 1, mark })
    ElMessage.success('已通过')
    dialogVisible.value = false
    fetchData()
  } catch { /* cancelled */ }
}

async function handleReject(row: any) {
  try {
    const mark = auditForm.mark
    if (row.status === 0) {
      await ElMessageBox.confirm('确定拒绝该申请吗？', '提示', { type: 'warning' })
    }
    await partnerApi.updateJoinInStatus(row.id, { status: 2, mark })
    ElMessage.success('已拒绝')
    dialogVisible.value = false
    fetchData()
  } catch { /* cancelled */ }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该申请吗？', '提示', { type: 'warning' })
    await partnerApi.deleteJoinIn(row.id)
    ElMessage.success('删除成功'); fetchData()
  } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>
