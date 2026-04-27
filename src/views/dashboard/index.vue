<template>
  <div class="page-container" v-loading="loading">
    <!-- Stat Cards Row 1 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card stat-card--blue">
          <div class="stat-card__inner">
            <div class="stat-card__icon">
              <el-icon :size="28"><Document /></el-icon>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">总订单数</div>
              <div class="stat-card__value">{{ dashboard.total_orders || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card stat-card--cyan">
          <div class="stat-card__inner">
            <div class="stat-card__icon">
              <el-icon :size="28"><Tickets /></el-icon>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">今日订单</div>
              <div class="stat-card__value">{{ dashboard.today_orders || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card stat-card--green">
          <div class="stat-card__inner">
            <div class="stat-card__icon">
              <el-icon :size="28"><User /></el-icon>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">总会员数</div>
              <div class="stat-card__value">{{ dashboard.total_members || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card stat-card--purple">
          <div class="stat-card__inner">
            <div class="stat-card__icon">
              <el-icon :size="28"><UserFilled /></el-icon>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">今日新增会员</div>
              <div class="stat-card__value">{{ dashboard.today_members || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Stat Cards Row 2 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card stat-card--orange">
          <div class="stat-card__inner">
            <div class="stat-card__icon">
              <el-icon :size="28"><Wallet /></el-icon>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">总营收</div>
              <div class="stat-card__value">&yen;{{ formatMoney(dashboard.total_revenue || 0) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card stat-card--red">
          <div class="stat-card__inner">
            <div class="stat-card__icon">
              <el-icon :size="28"><Coin /></el-icon>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">今日营收</div>
              <div class="stat-card__value">&yen;{{ formatMoney(dashboard.today_revenue || 0) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card stat-card--teal">
          <div class="stat-card__inner">
            <div class="stat-card__icon">
              <el-icon :size="28"><Box /></el-icon>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">库存商品</div>
              <div class="stat-card__value">{{ dashboard.stock_count || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card stat-card--indigo">
          <div class="stat-card__inner">
            <div class="stat-card__icon">
              <el-icon :size="28"><Goods /></el-icon>
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">库存价值</div>
              <div class="stat-card__value">&yen;{{ formatMoney(dashboard.stock_value || 0) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Bottom Row -->
    <el-row :gutter="16">
      <!-- Order Status Distribution -->
      <el-col :xs="24" :md="8">
        <el-card shadow="hover">
          <template #header>
            <span class="card-header-title">订单状态分布</span>
          </template>
          <div class="status-distribution">
            <div
              v-for="(item, key) in dashboard.order_status_distribution || {}"
              :key="key"
              class="status-item"
            >
              <el-tag
                :type="getOrderStatusType(key)"
                size="large"
                class="status-tag"
              >
                {{ getOrderStatusLabel(key) }}
              </el-tag>
              <span class="status-count">{{ item }}</span>
            </div>
            <el-empty
              v-if="!dashboard.order_status_distribution || Object.keys(dashboard.order_status_distribution || {}).length === 0"
              description="暂无数据"
              :image-size="60"
            />
          </div>
        </el-card>
      </el-col>

      <!-- Recent Orders -->
      <el-col :xs="24" :md="16">
        <el-card shadow="hover">
          <template #header>
            <span class="card-header-title">最近订单</span>
          </template>
          <el-table :data="dashboard.recent_orders || []" stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="order_no" label="订单号" min-width="160" show-overflow-tooltip />
            <el-table-column prop="member_name" label="会员" min-width="100" show-overflow-tooltip />
            <el-table-column prop="product_name" label="商品" min-width="120" show-overflow-tooltip />
            <el-table-column prop="total_price" label="金额" width="100">
              <template #default="{ row }">
                <span>&yen;{{ Number(row.total_price || 0).toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusType(row.status)" size="small">
                  {{ getOrderStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="170" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboard } from '@/api/system'
import {
  Document,
  Tickets,
  User,
  UserFilled,
  Wallet,
  Coin,
  Box,
  Goods,
} from '@element-plus/icons-vue'

const loading = ref(false)
const dashboard = ref<Record<string, any>>({})

const ORDER_STATUS_MAP: Record<string, { label: string; type: string }> = {
  pending: { label: '待付款', type: 'warning' },
  paid: { label: '已付款', type: 'primary' },
  processing: { label: '处理中', type: '' },
  shipped: { label: '已发货', type: '' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'info' },
  refunded: { label: '已退款', type: 'danger' },
}

function getOrderStatusLabel(status: string | number) {
  const s = String(status)
  return ORDER_STATUS_MAP[s]?.label || s
}

function getOrderStatusType(status: string | number) {
  const s = String(status)
  return (ORDER_STATUS_MAP[s]?.type || 'info') as any
}

function formatMoney(value: number) {
  if (typeof value !== 'number') return '0.00'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function fetchDashboard() {
  loading.value = true
  try {
    const { data } = await getDashboard()
    dashboard.value = data || {}
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 0;
  }

  &__inner {
    display: flex;
    align-items: center;
    padding: 20px;
  }

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    flex-shrink: 0;
    color: #fff;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 4px;
  }

  &__value {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &--blue .stat-card__icon { background: linear-gradient(135deg, #409eff, #337ecc); }
  &--cyan .stat-card__icon { background: linear-gradient(135deg, #20b2aa, #17a2b8); }
  &--green .stat-card__icon { background: linear-gradient(135deg, #67c23a, #529b2e); }
  &--purple .stat-card__icon { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
  &--orange .stat-card__icon { background: linear-gradient(135deg, #e6a23c, #d4941a); }
  &--red .stat-card__icon { background: linear-gradient(135deg, #f56c6c, #e04a4a); }
  &--teal .stat-card__icon { background: linear-gradient(135deg, #13c2c2, #08979c); }
  &--indigo .stat-card__icon { background: linear-gradient(135deg, #597ef7, #2f54eb); }
}

.card-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.status-distribution {
  .status-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .status-tag {
    min-width: 80px;
    text-align: center;
  }

  .status-count {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
