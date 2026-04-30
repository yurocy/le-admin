<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="关键词" clearable style="width: 180px" />
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-select v-model="searchForm.level_id" placeholder="等级" clearable style="width: 140px">
        <el-option v-for="item in levelList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加商品</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="productname" label="商品名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="amount" label="数量" width="80" align="right" />
      <el-table-column prop="brand" label="品牌" width="120" />
      <el-table-column prop="level" label="等级" width="120" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="addtime" label="添加时间" width="170" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '添加商品'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="品牌" prop="brand_id">
          <el-select v-model="form.brand_id" placeholder="选择品牌" style="width: 100%">
            <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" prop="productname">
          <el-input v-model="form.productname" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="数量" prop="amount">
          <el-input-number v-model="form.amount" :min="0" />
        </el-form-item>
        <el-form-item label="等级" prop="level_id">
          <el-select v-model="form.level_id" placeholder="选择等级" style="width: 100%">
            <el-option v-for="item in levelList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
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
import { saleApi, productApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const levelList = ref<any[]>([])
const brandList = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ keyword: '', status: '' as any, level_id: '' as any })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const form = reactive({
  brand_id: '' as any,
  productname: '',
  amount: 0,
  level_id: '' as any,
  desc: '',
  status: true,
  info: '',
})

const rules = {
  productname: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
}

async function fetchLevels() {
  try {
    const res: any = await saleApi.listLevel()
    levelList.value = res.data || res || []
  } catch {
    // ignore
  }
}

async function fetchBrands() {
  try {
    const res: any = await productApi.listBrand()
    brandList.value = res.data?.list || res.data || res || []
  } catch {
    // ignore
  }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.status !== '') params.status = searchForm.status
    if (searchForm.level_id) params.level_id = searchForm.level_id
    const res: any = await saleApi.listGoods(params)
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
  Object.assign(searchForm, { keyword: '', status: '', level_id: '' })
  pagination.page = 1
  fetchData()
}

function handleAdd() {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, { brand_id: '', productname: '', amount: 0, level_id: '', desc: '', status: true, info: '' })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    brand_id: row.brand_id, productname: row.productname, amount: row.amount,
    level_id: row.level_id, desc: row.desc, status: !!row.status, info: row.info,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await saleApi.updateGoods(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await saleApi.createGoods({ ...form })
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
    await saleApi.deleteGoods(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled or error
  }
}

onMounted(() => {
  fetchLevels()
  fetchBrands()
  fetchData()
})
</script>
