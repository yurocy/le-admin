<template>
  <div class="page-container">
    <!-- Search Bar -->
    <el-card shadow="hover" class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="操作人">
          <el-input
            v-model="searchForm.username"
            placeholder="用户名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="请求方法">
          <el-select v-model="searchForm.method" placeholder="全部方法" clearable style="width: 140px">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="hover" class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="username" label="操作人" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">{{ row.username || '-' }}</template>
        </el-table-column>
        <el-table-column prop="method" label="请求方法" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getMethodTagType(row.method)" size="small" effect="dark">
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="请求路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.ip || '-' }}</template>
        </el-table-column>
        <el-table-column prop="result" label="结果" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === 0 ? 'success' : 'danger'" size="small">
              {{ row.result === 0 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="操作时间" min-width="170" show-overflow-tooltip />
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { listLogs } from '@/api/system'

const loading = ref(false)
const tableData = ref<any[]>([])

const searchForm = reactive({
  username: '',
  method: '' as string,
  dateRange: null as string[] | null,
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      const dateStr = today.toISOString().slice(0, 10)
      return [dateStr, dateStr]
    },
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
    },
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
    },
  },
  {
    text: '本月',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return [start.toISOString().slice(0, 10), now.toISOString().slice(0, 10)]
    },
  },
]

function getMethodTagType(method: string): '' | 'success' | 'warning' | 'primary' | 'danger' {
  const map: Record<string, '' | 'success' | 'warning' | 'primary' | 'danger'> = {
    GET: 'success',
    POST: 'warning',
    PUT: 'primary',
    DELETE: 'danger',
  }
  return map[method] || 'info'
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      page_size: pagination.page_size,
    }
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.method) params.method = searchForm.method
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.start_date = searchForm.dateRange[0]
      params.end_date = searchForm.dateRange[1]
    }

    const { data } = await listLogs(params)
    tableData.value = data?.list || data?.items || []
    pagination.total = data?.total || 0
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handleReset() {
  searchForm.username = ''
  searchForm.method = ''
  searchForm.dateRange = null
  pagination.page = 1
  fetchList()
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
