<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="关键词" clearable style="width: 180px" />
      <el-select v-model="searchForm.category_id" placeholder="分类" clearable style="width: 160px">
        <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="searchForm.brand_id" placeholder="品牌" clearable style="width: 160px">
        <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="searchForm.display" placeholder="显示" clearable style="width: 120px">
        <el-option label="显示" :value="1" />
        <el-option label="隐藏" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加商品</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="product_name" label="商品名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="brand" label="品牌" width="100" />
      <el-table-column prop="model" label="型号" width="120" show-overflow-tooltip />
      <el-table-column prop="desc_name" label="描述包" width="120" show-overflow-tooltip />
      <el-table-column prop="product_price" label="商品价" width="100" align="right" />
      <el-table-column prop="lowest_price" label="最低价" width="100" align="right" />
      <el-table-column prop="new_price" label="全新价" width="100" align="right" />
      <el-table-column prop="price7" label="价格走势" width="150" show-overflow-tooltip />
      <el-table-column prop="success" label="已回收" width="80" align="center" />
      <el-table-column label="热门" width="80">
        <template #default="{ row }">
          <el-tag :type="row.ishot ? 'danger' : 'info'">{{ row.ishot ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="显示" width="80">
        <template #default="{ row }">
          <el-tag :type="row.display ? 'success' : 'info'">{{ row.display ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '添加商品'" width="650px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="product_name">
          <el-input v-model="form.product_name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="form.model" placeholder="请输入型号" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand_id">
          <el-select v-model="form.brand_id" placeholder="选择品牌" style="width: 100%">
            <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述包" prop="desc_id">
          <el-select v-model="form.desc_id" placeholder="选择描述包" clearable style="width: 100%">
            <el-option v-for="item in descList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格" prop="product_price">
          <el-input-number v-model="form.product_price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="最低价格" prop="lowest_price">
          <el-input-number v-model="form.lowest_price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="全新价格" prop="new_price">
          <el-input-number v-model="form.new_price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="价格走势" prop="price7">
          <el-input v-model="form.price7" placeholder="价格走势URL" />
        </el-form-item>
        <el-form-item label="商品图片" prop="product_img">
          <el-input v-model="form.product_img" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="热门" prop="ishot">
          <el-switch v-model="form.ishot" />
        </el-form-item>
        <el-form-item label="显示" prop="display">
          <el-switch v-model="form.display" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="搜索文本" prop="search_text">
          <el-input v-model="form.search_text" type="textarea" :rows="2" placeholder="搜索关键词" />
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
import { productApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const categoryList = ref<any[]>([])
const brandList = ref<any[]>([])
const descList = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ keyword: '', category_id: '' as any, brand_id: '' as any, display: '' as any })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const form = reactive({
  product_name: '',
  model: '',
  brand_id: '' as any,
  desc_id: '' as any,
  product_price: 0,
  lowest_price: 0,
  new_price: 0,
  price7: '',
  product_img: '',
  ishot: false,
  display: true,
  sort: 0,
  search_text: '',
})

const rules = {
  product_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  brand_id: [{ required: true, message: '请选择品牌', trigger: 'change' }],
}

async function fetchOptions() {
  try {
    const [catRes, brandRes, descRes]: any[] = await Promise.all([
      productApi.listCategory(),
      productApi.listBrand({ page: 1, page_size: 100 }),
      productApi.listDesc({ page: 1, page_size: 100 }),
    ])
    categoryList.value = catRes.data || catRes || []
    brandList.value = brandRes.data?.list || brandRes.data || brandRes || []
    descList.value = descRes.data?.list || descRes.data || descRes || []
  } catch {
    // ignore
  }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.category_id) params.category_id = searchForm.category_id
    if (searchForm.brand_id) params.brand_id = searchForm.brand_id
    if (searchForm.display !== '') params.display = searchForm.display
    const res: any = await productApi.listProduct(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  Object.assign(searchForm, { keyword: '', category_id: '', brand_id: '', display: '' })
  pagination.page = 1
  fetchData()
}

function handleAdd() {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, {
    product_name: '', model: '', brand_id: '', desc_id: '',
    product_price: 0, lowest_price: 0, new_price: 0, price7: '',
    product_img: '', ishot: false, display: true, sort: 0, search_text: '',
  })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    product_name: row.product_name, model: row.model, brand_id: row.brand_id, desc_id: row.desc_id,
    product_price: row.product_price, lowest_price: row.lowest_price, new_price: row.new_price, price7: row.price7,
    product_img: row.product_img, ishot: row.ishot, display: row.display, sort: row.sort, search_text: row.search_text,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await productApi.updateProduct(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await productApi.createProduct({ ...form })
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
    await productApi.deleteProduct(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled or error
  }
}

onMounted(() => {
  fetchOptions()
  fetchData()
})
</script>
