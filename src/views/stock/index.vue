<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="关键词" clearable style="width: 180px" />
      <el-input v-model="searchForm.agent_id" placeholder="代理商ID" clearable style="width: 140px" />
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
        <el-option label="在库" value="in_stock" />
        <el-option label="已售" value="sold" />
      </el-select>
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

    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加商品</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="productname" label="商品名称" min-width="140" show-overflow-tooltip />
      <el-table-column prop="imei" label="IMEI" width="150" />
      <el-table-column prop="number" label="编号" width="120" />
      <el-table-column prop="assprice" label="评估价" width="100" align="right" />
      <el-table-column prop="allpay" label="总支付" width="100" align="right" />
      <el-table-column prop="outprice" label="出库价" width="100" align="right" />
      <el-table-column prop="profit" label="利润" width="100" align="right" />
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '在库' : '已售' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="agent_id" label="代理商ID" width="100" />
      <el-table-column prop="addtime" label="入库时间" width="170" />
      <el-table-column prop="saletime" label="售出时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '添加商品'" width="700px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="productname">
          <el-input v-model="form.productname" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="IMEI" prop="imei">
          <el-input v-model="form.imei" placeholder="请输入IMEI" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="编号">
              <el-input v-model="form.number" placeholder="编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款状态">
              <el-input v-model="form.pay" placeholder="付款状态" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="评估价">
              <el-input-number v-model="form.assprice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检测价">
              <el-input-number v-model="form.checkprice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="回收价">
              <el-input-number v-model="form.repay" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最终价">
              <el-input-number v-model="form.lastprice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总支付">
              <el-input-number v-model="form.allpay" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出库价">
              <el-input-number v-model="form.outprice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="应付总款">
          <el-input-number v-model="form.dues" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="活动">
          <el-input v-model="form.activity" placeholder="活动名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="信息">
          <el-input v-model="form.info" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="代理商ID">
          <el-input v-model="form.agent_id" placeholder="代理商ID" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="0">已售</el-radio>
            <el-radio :value="1">在库</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-divider content-position="left">快递信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="快递公司">
              <el-input v-model="form.exp_com" placeholder="快递公司" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="快递单号">
              <el-input v-model="form.exp_order" placeholder="快递单号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="快递费">
              <el-input-number v-model="form.exp_fee" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保价费">
              <el-input-number v-model="form.exp_safe" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="快递支付">
          <el-input-number v-model="form.exp_pay" :min="0" :precision="2" style="width: 100%" />
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
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { stockApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  agent_id: '',
  status: '' as any,
  dateRange: null as string[] | null,
})

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const defaultForm = {
  number: '', productname: '', imei: '', assprice: 0, checkprice: 0, repay: 0,
  lastprice: 0, allpay: 0, outprice: 0, pay: '', dues: 0, activity: '', desc: '', info: '',
  agent_id: '', status: 1, exp_com: '', exp_order: '', exp_fee: 0, exp_safe: 0, exp_pay: 0,
}

const form = reactive({ ...defaultForm })

const rules = {
  productname: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.agent_id) params.agent_id = searchForm.agent_id
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.dateRange?.length === 2) {
      params.start_date = searchForm.dateRange[0]
      params.end_date = searchForm.dateRange[1]
    }
    const res: any = await stockApi.listGoods(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch {
    ElMessage.error('获取库存列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  Object.assign(searchForm, { keyword: '', agent_id: '', status: '', dateRange: null })
  pagination.page = 1
  fetchData()
}

function handleAdd() {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, { ...defaultForm })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    number: row.number ?? '', productname: row.productname ?? '', imei: row.imei ?? '',
    assprice: row.assprice ?? 0, checkprice: row.checkprice ?? 0, repay: row.repay ?? 0,
    lastprice: row.lastprice ?? 0, allpay: row.allpay ?? 0, outprice: row.outprice ?? 0,
    pay: row.pay ?? '', dues: row.dues ?? 0, activity: row.activity ?? '',
    desc: row.desc ?? '', info: row.info ?? '', agent_id: row.agent_id ?? '',
    status: row.status ?? 0,
    exp_com: row.exp_com ?? '', exp_order: row.exp_order ?? '',
    exp_fee: row.exp_fee ?? 0, exp_safe: row.exp_safe ?? 0, exp_pay: row.exp_pay ?? 0,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await stockApi.updateGoods(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await stockApi.createGoods({ ...form })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该商品吗？', '提示', { type: 'warning' })
    await stockApi.deleteGoods(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled or error
  }
}

onMounted(() => {
  fetchData()
})
</script>
