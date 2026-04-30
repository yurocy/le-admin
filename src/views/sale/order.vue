<template>
  <div class="page-container">
    <div class="search-bar">
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
        <el-option label="待处理" :value="0" />
        <el-option label="处理中" :value="1" />
        <el-option label="已完成" :value="2" />
        <el-option label="已取消" :value="3" />
      </el-select>
      <el-input v-model="searchForm.user_id" placeholder="用户ID" clearable style="width: 120px" />
      <el-input v-model="searchForm.goods_id" placeholder="商品ID" clearable style="width: 120px" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="user_id" label="用户ID" width="100" />
      <el-table-column prop="goods_id" label="商品ID" width="100" />
      <el-table-column prop="amount" label="数量" width="80" align="right" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusMap[row.status] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="express_no" label="快递单号" width="150" show-overflow-tooltip />
      <el-table-column prop="info" label="信息" min-width="150" show-overflow-tooltip />
      <el-table-column prop="addtime" label="添加时间" width="170" />
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
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递公司">
          <el-input v-model="form.express_id" placeholder="快递公司ID" />
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="form.express_no" placeholder="快递单号" />
        </el-form-item>
        <el-form-item label="信息">
          <el-input v-model="form.info" type="textarea" :rows="3" />
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
import { saleApi } from '@/api/business'

const statusMap: Record<number, string> = { 0: '待处理', 1: '处理中', 2: '已完成', 3: '已取消' }

function statusTagType(status: number) {
  const map: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ status: '' as any, user_id: '', goods_id: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const form = reactive({ status: 0, express_id: 0, express_no: '', info: '' })

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.status !== '') params.status = searchForm.status
    if (searchForm.user_id) params.user_id = searchForm.user_id
    if (searchForm.goods_id) params.goods_id = searchForm.goods_id
    const res: any = await saleApi.listOrder(params)
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
  Object.assign(searchForm, { status: '', user_id: '', goods_id: '' })
  pagination.page = 1
  fetchData()
}

function handleEdit(row: any) {
  editId.value = row.id
  Object.assign(form, {
    status: row.status, express_id: row.express_id ?? 0, express_no: row.express_no ?? '', info: row.info ?? '',
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    await saleApi.updateOrder(editId.value, { ...form })
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
