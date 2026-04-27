<template>
  <div class="page-container">
    <div class="search-bar">
      <el-date-picker
        v-model="filterForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px"
      />
      <el-input v-model="filterForm.days" placeholder="天数" clearable style="width: 120px" />
      <el-input v-model="filterForm.agent_id" placeholder="代理商ID" clearable style="width: 140px" />
      <el-button type="primary" @click="fetchData">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- Summary Cards -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="4" v-for="card in summaryCards" :key="card.key">
        <el-card shadow="hover" class="summary-card">
          <div class="card-value">{{ stats[card.key as keyof typeof stats] ?? '-' }}</div>
          <div class="card-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Daily Statistics Table -->
    <el-table :data="dailyList" v-loading="loading" border stripe>
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="in_count" label="入库数" width="100" align="right" />
      <el-table-column prop="out_count" label="出库数" width="100" align="right" />
      <el-table-column prop="profit" label="利润" width="120" align="right" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { stockApi } from '@/api/business'

const loading = ref(false)
const stats = reactive({
  total_count: 0,
  out_count: 0,
  stock_count: 0,
  total_profit: 0,
  total_fees: 0,
  total_all_pay: 0,
})

const dailyList = ref<any[]>([])

const filterForm = reactive({
  dateRange: null as string[] | null,
  days: '',
  agent_id: '',
})

const summaryCards = [
  { key: 'total_count', label: '总数量' },
  { key: 'out_count', label: '出库数量' },
  { key: 'stock_count', label: '在库数量' },
  { key: 'total_profit', label: '总利润' },
  { key: 'total_fees', label: '总费用' },
  { key: 'total_all_pay', label: '总支付' },
]

async function fetchData() {
  loading.value = true
  try {
    const params: any = {}
    if (filterForm.dateRange?.length === 2) {
      params.start_date = filterForm.dateRange[0]
      params.end_date = filterForm.dateRange[1]
    }
    if (filterForm.days) params.days = filterForm.days
    if (filterForm.agent_id) params.agent_id = filterForm.agent_id

    const res: any = await stockApi.getStatistics(params)
    const data = res.data || res
    Object.assign(stats, {
      total_count: data.total_count ?? 0,
      out_count: data.out_count ?? 0,
      stock_count: data.stock_count ?? 0,
      total_profit: data.total_profit ?? 0,
      total_fees: data.total_fees ?? 0,
      total_all_pay: data.total_all_pay ?? 0,
    })
    dailyList.value = data.daily || data.list || []
  } catch {
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  Object.assign(filterForm, { dateRange: null, days: '', agent_id: '' })
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.summary-card {
  text-align: center;

  .card-value {
    font-size: 28px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 8px;
  }

  .card-label {
    font-size: 13px;
    color: #909399;
  }
}
</style>
