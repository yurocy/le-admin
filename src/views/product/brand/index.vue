<template>
  <div class="page-container">
    <div class="search-bar">
      <el-select v-model="searchForm.category_id" placeholder="选择分类" clearable style="width: 200px">
        <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加品牌</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          {{ getCategoryName(row.type_id) }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="image" label="图片" min-width="200" show-overflow-tooltip />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="热门" width="80">
        <template #default="{ row }">
          <el-tag :type="row.ishot ? 'danger' : 'info'">{{ row.ishot ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上架" width="80">
        <template #default="{ row }">
          <el-tag :type="row.onsale ? 'success' : 'info'">{{ row.onsale ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑品牌' : '添加品牌'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类" prop="type_id">
          <el-select v-model="form.type_id" placeholder="选择分类" style="width: 100%">
            <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-input v-model="form.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="热门" prop="ishot">
          <el-switch v-model="form.ishot" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="上架" prop="onsale">
          <el-switch v-model="form.onsale" :active-value="1" :inactive-value="0" />
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
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ category_id: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const form = reactive({
  type_id: '' as any,
  name: '',
  image: '',
  sort: 0,
  ishot: 0,
  onsale: 1,
})

const rules = {
  type_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
}

async function fetchCategories() {
  try {
    const res: any = await productApi.listCategory()
    categoryList.value = res.data || res || []
  } catch {
    // ignore
  }
}

function getCategoryName(typeId: number): string {
  const cat = categoryList.value.find((item: any) => item.id === typeId)
  return cat ? cat.name : String(typeId)
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.category_id) params.category_id = searchForm.category_id
    const res: any = await productApi.listBrand(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch {
    ElMessage.error('获取品牌列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleAdd() {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, { type_id: '', name: '', image: '', sort: 0, ishot: 0, onsale: 1 })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    type_id: row.type_id,
    name: row.name,
    image: row.image,
    sort: row.sort,
    ishot: row.ishot,
    onsale: row.onsale,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await productApi.updateBrand(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await productApi.createBrand({ ...form })
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
    await ElMessageBox.confirm('确定删除该品牌吗？', '提示', { type: 'warning' })
    await productApi.deleteBrand(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled or error
  }
}

onMounted(() => {
  fetchCategories()
  fetchData()
})
</script>
