<template>
  <div class="page-container">
    <div class="search-bar">
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="竞拍中" :value="1" />
        <el-option label="已结束" :value="2" />
        <el-option label="已取消" :value="3" />
      </el-select>
      <el-select v-model="searchForm.category_id" placeholder="分类" clearable style="width: 140px">
        <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="searchForm.brand_id" placeholder="品牌" clearable style="width: 140px">
        <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加竞拍商品</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
      <el-table-column prop="sn" label="SN" width="120" />
      <el-table-column prop="imei" label="IMEI" width="140" />
      <el-table-column prop="category_name" label="分类" width="100" />
      <el-table-column prop="brand_name" label="品牌" width="100" />
      <el-table-column prop="ctype_name" label="类型" width="100" />
      <el-table-column prop="image" label="主图" width="80">
        <template #default="{ row }">
          <el-image v-if="row.image" :src="row.image" style="width: 50px; height: 50px" fit="cover" :preview-src-list="[row.image]" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="100" align="right" />
      <el-table-column prop="amount" label="数量" width="80" align="right" />
      <el-table-column prop="grade" label="成色" width="80" />
      <el-table-column prop="options" label="竞价选项" width="90" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusMap[row.status] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="activetime" label="上架时间" width="170" />
      <el-table-column prop="addtime" label="添加时间" width="170" />
      <el-table-column prop="endtime" label="结束时间" width="170" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑竞拍商品' : '添加竞拍商品'" width="650px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SN" prop="sn">
              <el-input v-model="form.sn" placeholder="SN" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="IMEI" prop="imei">
              <el-input v-model="form.imei" placeholder="IMEI" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="分类" prop="category_id">
              <el-select v-model="form.category_id" placeholder="分类" style="width: 100%">
                <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="品牌" prop="brand_id">
              <el-select v-model="form.brand_id" placeholder="品牌" style="width: 100%">
                <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类型" prop="ctype_id">
              <el-select v-model="form.ctype_id" placeholder="类型" style="width: 100%">
                <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数量">
              <el-input-number v-model="form.amount" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="成色">
              <el-input-number v-model="form.grade" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结束时间">
              <el-date-picker v-model="form.endtime" type="datetime" placeholder="结束时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="竞拍中" :value="1" />
                <el-option label="已结束" :value="2" />
                <el-option label="已取消" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电池">
              <el-input v-model="form.battery" placeholder="电池信息" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保修">
              <el-input v-model="form.safeguard" placeholder="保修信息" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="配件">
          <el-input v-model="form.parts" placeholder="配件信息" />
        </el-form-item>
        <el-form-item label="图片">
          <el-input v-model="form.image" placeholder="主图URL" />
        </el-form-item>
        <el-form-item label="竞价选项">
          <el-input-number v-model="form.options" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="上架时间">
          <el-date-picker v-model="form.activetime" type="datetime" placeholder="上架时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="信息">
          <el-input v-model="form.info" type="textarea" :rows="2" />
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
import { biddingApi } from '@/api/business'

const statusMap: Record<number, string> = { 1: '竞拍中', 2: '已结束', 3: '已取消' }

function statusTagType(status: number) {
  const map: Record<number, string> = { 1: 'success', 2: 'info', 3: 'danger' }
  return map[status] || 'info'
}

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const categoryList = ref<any[]>([])
const brandList = ref<any[]>([])
const typeList = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ status: '' as any, category_id: '' as any, brand_id: '' as any })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const defaultForm = {
  title: '', sn: '', imei: '', category_id: '' as any, brand_id: '' as any, ctype_id: '' as any,
  price: 0, amount: 1, grade: 0, options: 0, battery: '', safeguard: '', parts: '',
  image: '', info: '', status: 1, activetime: '', endtime: '',
}
const form = reactive({ ...defaultForm })

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  sn: [{ required: true, message: '请输入SN', trigger: 'blur' }],
  imei: [{ required: true, message: '请输入IMEI', trigger: 'blur' }],
}

async function fetchOptions() {
  try {
    const [catRes, brandRes, typeRes]: any[] = await Promise.all([
      biddingApi.listCategory(), biddingApi.listBrand(), biddingApi.listType()
    ])
    categoryList.value = catRes.data || catRes || []
    brandList.value = brandRes.data || brandRes || []
    typeList.value = typeRes.data || typeRes || []
  } catch { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.status !== '' && searchForm.status != null) params.status = searchForm.status
    if (searchForm.category_id) params.category_id = searchForm.category_id
    if (searchForm.brand_id) params.brand_id = searchForm.brand_id
    const res: any = await biddingApi.listProduct(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('获取竞拍列表失败') } finally { loading.value = false }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { Object.assign(searchForm, { status: '', category_id: '', brand_id: '' }); pagination.page = 1; fetchData() }

function handleAdd() { isEdit.value = false; editId.value = 0; Object.assign(form, { ...defaultForm }); dialogVisible.value = true }

function handleEdit(row: any) {
  isEdit.value = true; editId.value = row.id
  Object.assign(form, {
    title: row.title, sn: row.sn, imei: row.imei, category_id: row.category_id,
    brand_id: row.brand_id, ctype_id: row.ctype_id, price: row.price, amount: row.amount,
    grade: row.grade, options: row.options, battery: row.battery, safeguard: row.safeguard, parts: row.parts,
    image: row.image, info: row.info, status: row.status, activetime: row.activetime, endtime: row.endtime,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) { await biddingApi.updateProduct(editId.value, { ...form }); ElMessage.success('更新成功') }
    else { await biddingApi.createProduct({ ...form }); ElMessage.success('添加成功') }
    dialogVisible.value = false; fetchData()
  } catch { ElMessage.error('操作失败') } finally { submitLoading.value = false }
}

async function handleDelete(row: any) {
  try { await ElMessageBox.confirm('确定删除该竞拍商品吗？', '提示', { type: 'warning' }); await biddingApi.deleteProduct(row.id); ElMessage.success('删除成功'); fetchData() } catch { /* cancelled */ }
}

onMounted(() => { fetchOptions(); fetchData() })
</script>
