<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="订单号/IMEI" clearable style="width: 160px" />
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
        <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
      </el-select>
      <el-select v-model="searchForm.method" placeholder="方式" clearable style="width: 120px">
        <el-option label="邮寄" :value="0" />
        <el-option label="上门" :value="1" />
        <el-option label="到店" :value="2" />
      </el-select>
      <el-select v-model="searchForm.source" placeholder="来源" clearable style="width: 120px">
        <el-option v-for="(label, val) in sourceMap" :key="val" :label="label" :value="Number(val)" />
      </el-select>
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 240px"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="orderid" label="订单号" width="140" show-overflow-tooltip />
      <el-table-column prop="product_name" label="商品" min-width="130" show-overflow-tooltip />
      <el-table-column prop="number" label="编号" width="100" show-overflow-tooltip />
      <el-table-column prop="imei" label="IMEI" width="130" show-overflow-tooltip />
      <el-table-column prop="referee" label="推荐人" width="100" show-overflow-tooltip />
      <el-table-column prop="assessprice" label="预估价" width="90" align="right" />
      <el-table-column prop="actualprice" label="评估价" width="90" align="right" />
      <el-table-column prop="applyprice" label="申请价" width="90" align="right" />
      <el-table-column label="方式" width="70" align="center">
        <template #default="{ row }">{{ methodMap[row.method] || '-' }}</template>
      </el-table-column>
      <el-table-column label="来源" width="90" align="center">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ sourceMap[row.source] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusMap[row.status] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="快递上门" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.exp_on ? 'success' : 'info'" size="small">{{ row.exp_on ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="info" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column prop="tratime" label="下单时间" width="160" show-overflow-tooltip />
      <el-table-column label="操作" width="80" fixed="right">
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

    <!-- 编辑订单弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑订单" width="780px" destroy-on-close>
      <el-form ref="formRef" :model="form" label-width="100px">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号">
              <el-input v-model="form.orderid" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品">
              <el-input :model-value="form.product_name || '-'" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="方式">
              <el-select v-model="form.method" style="width: 100%">
                <el-option label="邮寄" :value="0" />
                <el-option label="上门" :value="1" />
                <el-option label="到店" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源">
              <el-select v-model="form.source" style="width: 100%">
                <el-option v-for="(label, val) in sourceMap" :key="val" :label="label" :value="Number(val)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="编号">
              <el-input v-model="form.number" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="IMEI">
              <el-input v-model="form.imei" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="推荐人">
              <el-input v-model="form.referee" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="优惠券">
              <el-input v-model="form.ticket" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="加价券">
              <el-input-number v-model="form.coupon" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="评价">
              <el-select v-model="form.evaluate" style="width: 100%">
                <el-option label="未评" :value="0" />
                <el-option label="已评" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 价格信息 -->
        <el-divider content-position="left">价格信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="预估价">
              <el-input-number v-model="form.assessprice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="评估价">
              <el-input-number v-model="form.actualprice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请价">
              <el-input-number v-model="form.applyprice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 快递信息 -->
        <el-divider content-position="left">快递信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="快递单号">
              <el-input v-model="form.exp_order" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="快递费">
              <el-input-number v-model="form.exp_fee" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="支付方式">
              <el-select v-model="form.exp_pay" style="width: 100%">
                <el-option label="到付" :value="0" />
                <el-option label="寄付" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="上门时间">
              <el-input v-model="form.atime" placeholder="如：2024-01-01 14:00" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检测人">
              <el-input v-model="form.tester" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 描述信息 -->
        <el-divider content-position="left">描述信息</el-divider>
        <el-form-item label="用户描述">
          <el-input v-model="form.desctext" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="实际描述">
          <el-input v-model="form.actualdesc" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.info" type="textarea" :rows="2" />
        </el-form-item>

        <!-- 图片 -->
        <el-divider content-position="left">检测图片</el-divider>
        <el-row :gutter="16">
          <el-col :span="6" v-for="(img, idx) in [form.image1, form.image2, form.image3, form.image4]" :key="idx">
            <el-form-item :label="`图片${idx + 1}`">
              <div class="order-image-item">
                <el-image
                  v-if="img"
                  :src="img"
                  style="width: 80px; height: 80px"
                  fit="cover"
                  :preview-src-list="[img]"
                />
                <span v-else class="no-image">暂无</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 状态标记 -->
        <el-divider content-position="left">状态标记</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="问题单">
              <el-switch v-model="form.is_problem" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="已举报">
              <el-switch v-model="form.is_reported" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="已发货">
              <el-switch v-model="form.exp_on" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="发送短信">
              <el-switch v-model="form.send_sms" />
            </el-form-item>
          </el-col>
        </el-row>
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
  0: '未提交',
  1: '订单受理',
  2: '已发货',
  3: '已签收',
  4: '已检测',
  5: '已接单(上门/到店)',
  8: '完成交易',
  9: '订单取消',
  10: '已退货',
}

const sourceMap: Record<number, string> = {
  0: '未知',
  1: '电脑版',
  2: '手机版',
  3: 'APP',
  4: '商家',
  5: '迪信通',
  6: '小程序',
}

const methodMap: Record<number, string> = {
  0: '邮寄',
  1: '上门',
  2: '到店',
}

function statusTagType(status: number) {
  const map: Record<number, string> = {
    0: 'info', 1: 'warning', 2: '', 3: '', 4: 'success', 5: '', 8: 'success', 9: 'danger', 10: 'danger',
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
  method: '' as any,
  source: '' as any,
  dateRange: null as string[] | null,
})

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const defaultForm = {
  orderid: '',
  product_name: '',
  status: 0,
  method: 0,
  source: 0,
  number: '',
  imei: '',
  referee: '',
  ticket: '',
  coupon: 0,
  evaluate: 0,
  assessprice: 0,
  actualprice: 0,
  applyprice: 0,
  exp_order: '',
  exp_fee: 0,
  exp_pay: 0,
  atime: '',
  tester: '',
  desctext: '',
  actualdesc: '',
  info: '',
  image1: '',
  image2: '',
  image3: '',
  image4: '',
  is_problem: false,
  is_reported: false,
  exp_on: false,
  send_sms: false,
}

const form = reactive({ ...defaultForm })

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, page_size: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.status !== '') params.status = searchForm.status
    if (searchForm.method !== '') params.method = searchForm.method
    if (searchForm.source !== '') params.source = searchForm.source
    if (searchForm.dateRange?.length === 2) {
      params.date_from = searchForm.dateRange[0]
      params.date_to = searchForm.dateRange[1]
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
      orderid: data.orderid || row.orderid || '',
      product_name: row.product_name || '',
      status: data.status ?? row.status ?? 0,
      method: data.method ?? row.method ?? 0,
      source: data.source ?? row.source ?? 0,
      number: data.number ?? '',
      imei: data.imei ?? '',
      referee: data.referee ?? '',
      ticket: data.ticket ?? '',
      coupon: data.coupon ?? 0,
      evaluate: data.evaluate ?? 0,
      assessprice: data.assessprice ?? row.assessprice ?? 0,
      actualprice: data.actualprice ?? row.actualprice ?? 0,
      applyprice: data.applyprice ?? row.applyprice ?? 0,
      exp_order: data.exp_order ?? '',
      exp_fee: data.exp_fee ?? 0,
      exp_pay: data.exp_pay ?? 0,
      atime: data.atime ?? '',
      tester: data.tester ?? '',
      desctext: data.desctext ?? '',
      actualdesc: data.actualdesc ?? '',
      info: data.info ?? '',
      image1: data.image1 ?? '',
      image2: data.image2 ?? '',
      image3: data.image3 ?? '',
      image4: data.image4 ?? '',
      is_problem: !!(data.isproblem ?? row.isproblem),
      is_reported: !!(data.isreported ?? row.isreported),
      exp_on: !!(data.exp_on ?? row.exp_on),
      send_sms: !!(data.sendsms ?? row.sendsms),
    })
  } catch {
    Object.assign(form, {
      ...defaultForm,
      orderid: row.orderid || '',
      product_name: row.product_name || '',
      status: row.status ?? 0,
      method: row.method ?? 0,
      source: row.source ?? 0,
      assessprice: row.assessprice ?? 0,
      actualprice: row.actualprice ?? 0,
      applyprice: row.applyprice ?? 0,
    })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    const payload: any = {
      status: form.status,
      method: form.method,
      source: form.source,
      number: form.number,
      imei: form.imei,
      referee: form.referee,
      ticket: form.ticket,
      coupon: form.coupon,
      evaluate: form.evaluate,
      assessprice: form.assessprice,
      actualprice: form.actualprice,
      applyprice: form.applyprice,
      exp_order: form.exp_order,
      exp_fee: form.exp_fee,
      exp_pay: form.exp_pay,
      atime: form.atime,
      tester: form.tester,
      desctext: form.desctext,
      actualdesc: form.actualdesc,
      info: form.info,
      image1: form.image1,
      image2: form.image2,
      image3: form.image3,
      image4: form.image4,
      is_problem: form.is_problem,
      is_reported: form.is_reported,
      exp_on: form.exp_on,
      send_sms: form.send_sms,
    }
    await productApi.updateOrder(editId.value, payload)
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

<style lang="scss" scoped>
.order-image-item {
  .no-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: #f5f7fa;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    color: #c0c4cc;
    font-size: 12px;
  }
}
</style>
