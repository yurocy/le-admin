<template>
  <div class="page-container">
    <div class="search-bar">
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
        <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="product_name" label="商品" min-width="140" show-overflow-tooltip />
      <el-table-column prop="user_name" label="用户" width="100" />
      <el-table-column prop="price" label="出价" width="120" align="right" />
      <el-table-column prop="exp_order" label="快递单号" width="150" />
      <el-table-column prop="exp_com_name" label="快递公司" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusMap[row.status] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="addtime" label="下单时间" width="170" />
      <el-table-column label="操作" width="100" fixed="right">
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

    <el-dialog v-model="dialogVisible" title="编辑订单" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" label-width="90px">
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="form.exp_order" placeholder="快递单号" />
        </el-form-item>
        <el-form-item label="快递公司">
          <el-select v-model="form.exp_com_id" placeholder="选择快递公司" clearable filterable style="width: 100%">
            <el-option v-for="item in expressList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" style="width: 100%" />
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
import { biddingApi, webApi } from '@/api/business'

const statusMap: Record<number, string> = { 0: '待确认', 1: '已中标', 2: '未中标', 3: '已取消', 4: '已付款', 5: '已发货', 6: '已收货', 7: '已完成' }

function statusTagType(status: number) {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'info', 3: 'danger', 4: '', 5: '', 6: '', 7: 'success' }
  return map[status] || 'info'
}

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const expressList = ref<any[]>([])
const dialogVisible = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ status: '' as any })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({ status: 0, exp_order: '', exp_com_id: '' as any, price: 0 })

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.status !== '' && searchForm.status != null) params.status = searchForm.status
    const res: any = await biddingApi.listOrder(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('获取竞拍订单失败') } finally { loading.value = false }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { searchForm.status = ''; pagination.page = 1; fetchData() }

function handleEdit(row: any) {
  editId.value = row.id
  Object.assign(form, { status: row.status, exp_order: row.exp_order || '', exp_com_id: row.exp_com_id || '', price: row.price || 0 })
  dialogVisible.value = true
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    const payload: any = { status: form.status, price: form.price }
    if (form.exp_order) payload.exp_order = form.exp_order
    if (form.exp_com_id) payload.exp_com_id = form.exp_com_id
    await biddingApi.updateOrder(editId.value, payload)
    ElMessage.success('更新成功'); dialogVisible.value = false; fetchData()
  } catch { ElMessage.error('操作失败') } finally { submitLoading.value = false }
}

async function fetchExpress() {
  try {
    const res: any = await webApi.listExpress()
    expressList.value = res.data || res || []
  } catch { /* ignore */ }
}

onMounted(() => { fetchExpress(); fetchData() })
</script>
