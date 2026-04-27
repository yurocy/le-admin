<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="关键词" clearable style="width: 180px" />
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
        <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
      </el-select>
      <el-input v-model="searchForm.method" placeholder="方式" clearable style="width: 140px" />
      <el-input v-model="searchForm.source" placeholder="来源" clearable style="width: 140px" />
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="order_id" label="订单ID" width="120" />
      <el-table-column prop="product_name" label="商品名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="assess_price" label="评估价" width="100" align="right" />
      <el-table-column prop="actual_price" label="实际价" width="100" align="right" />
      <el-table-column prop="apply_price" label="申请价" width="100" align="right" />
      <el-table-column prop="method" label="方式" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusMap[row.status] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" title="编辑订单" width="700px" destroy-on-close>
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="评估价">
              <el-input-number v-model="form.assess_price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际价">
              <el-input-number v-model="form.actual_price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="申请价">
          <el-input-number v-model="form.apply_price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="方式">
          <el-input v-model="form.method" placeholder="回收方式" />
        </el-form-item>
        <el-form-item label="实际描述">
          <el-input v-model="form.actual_desc" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="form.exp_order" placeholder="快递单号" />
        </el-form-item>
        <el-form-item label="检测人">
          <el-input v-model="form.tester" placeholder="检测人" />
        </el-form-item>
        <el-form-item label="信息">
          <el-input v-model="form.info" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc_text" type="textarea" :rows="2" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="问题单">
              <el-switch v-model="form.is_problem" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已发货">
              <el-switch v-model="form.exp_on" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="发送短信">
          <el-switch v-model="form.send_sms" />
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
import { ElMessage, type FormInstance } from 'element-plus'
import { productApi } from '@/api/business'

const statusMap: Record<number, string> = {
  0: '待提交',
  1: '待审核',
  2: '已审核',
  3: '已入库',
  4: '已出库',
  5: '已完成',
  6: '已取消',
}

function statusTagType(status: number) {
  const map: Record<number, string> = {
    0: 'info', 1: 'warning', 2: '', 3: 'success', 4: '', 5: 'success', 6: 'danger',
  }
  return map[status] || 'info'
}

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  status: '' as any,
  method: '',
  source: '',
  dateRange: null as string[] | null,
})

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const form = reactive({
  status: 0,
  assess_price: 0,
  actual_price: 0,
  apply_price: 0,
  method: '',
  actual_desc: '',
  exp_order: '',
  tester: '',
  info: '',
  desc_text: '',
  is_problem: false,
  exp_on: false,
  send_sms: false,
})

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.status !== '') params.status = searchForm.status
    if (searchForm.method) params.method = searchForm.method
    if (searchForm.source) params.source = searchForm.source
    if (searchForm.dateRange?.length === 2) {
      params.start_date = searchForm.dateRange[0]
      params.end_date = searchForm.dateRange[1]
    }
    const res: any = await productApi.listOrder(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  Object.assign(searchForm, { keyword: '', status: '', method: '', source: '', dateRange: null })
  pagination.page = 1
  fetchData()
}

async function handleEdit(row: any) {
  editId.value = row.id
  try {
    const res: any = await productApi.getOrder(row.id)
    const data = res.data || res
    Object.assign(form, {
      status: data.status ?? row.status,
      assess_price: data.assess_price ?? row.assess_price ?? 0,
      actual_price: data.actual_price ?? row.actual_price ?? 0,
      apply_price: data.apply_price ?? row.apply_price ?? 0,
      method: data.method ?? row.method ?? '',
      actual_desc: data.actual_desc ?? '',
      exp_order: data.exp_order ?? '',
      tester: data.tester ?? '',
      info: data.info ?? '',
      desc_text: data.desc_text ?? '',
      is_problem: data.is_problem ?? false,
      exp_on: data.exp_on ?? false,
      send_sms: data.send_sms ?? false,
    })
  } catch {
    Object.assign(form, {
      status: row.status, assess_price: row.assess_price ?? 0, actual_price: row.actual_price ?? 0,
      apply_price: row.apply_price ?? 0, method: row.method ?? '',
      actual_desc: '', exp_order: '', tester: '', info: '', desc_text: '',
      is_problem: false, exp_on: false, send_sms: false,
    })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    await productApi.updateOrder(editId.value, { ...form })
    ElMessage.success('更新成功')
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
