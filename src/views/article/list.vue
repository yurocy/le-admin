<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="关键词" clearable style="width: 180px" />
      <el-select v-model="searchForm.category_id" placeholder="分类" clearable style="width: 160px">
        <el-option v-for="item in categoryList" :key="item.id" :label="item.classname" :value="item.id" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加文章</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="category_name" label="分类" width="120" />
      <el-table-column prop="keyword" label="关键词" width="120" show-overflow-tooltip />
      <el-table-column prop="info" label="摘要" min-width="180" show-overflow-tooltip />
      <el-table-column label="热门" width="70">
        <template #default="{ row }">
          <el-tag :type="row.ishot ? 'danger' : 'info'" size="small">{{ row.ishot ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="日期" width="120" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑文章' : '添加文章'" width="700px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select v-model="form.category_id" placeholder="选择分类" style="width: 100%">
                <el-option v-for="item in categoryList" :key="item.id" :label="item.classname" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="日期" prop="date">
              <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关键词">
              <el-input v-model="form.keyword" placeholder="关键词" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="热门">
              <el-switch v-model="form.ishot" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="摘要">
          <el-input v-model="form.info" type="textarea" :rows="2" placeholder="文章摘要" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="文章内容" />
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
import { articleApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const categoryList = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ keyword: '', category_id: '' as any })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const defaultForm = { title: '', category_id: '' as any, date: '', keyword: '', info: '', content: '', ishot: false }
const form = reactive({ ...defaultForm })

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

async function fetchCategories() {
  try { const res: any = await articleApi.listCategory(); categoryList.value = res.data || res || [] } catch { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.category_id) params.category_id = searchForm.category_id
    const res: any = await articleApi.listArticle(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('获取文章列表失败') } finally { loading.value = false }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { Object.assign(searchForm, { keyword: '', category_id: '' }); pagination.page = 1; fetchData() }

function handleAdd() { isEdit.value = false; editId.value = 0; Object.assign(form, { ...defaultForm }); dialogVisible.value = true }

function handleEdit(row: any) {
  isEdit.value = true; editId.value = row.id
  Object.assign(form, {
    title: row.title, category_id: row.category_id, date: row.date,
    keyword: row.keyword, info: row.info, content: row.content, ishot: !!row.ishot,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) { await articleApi.updateArticle(editId.value, { ...form }); ElMessage.success('更新成功') }
    else { await articleApi.createArticle({ ...form }); ElMessage.success('添加成功') }
    dialogVisible.value = false; fetchData()
  } catch { ElMessage.error('操作失败') } finally { submitLoading.value = false }
}

async function handleDelete(row: any) {
  try { await ElMessageBox.confirm('确定删除该文章吗？', '提示', { type: 'warning' }); await articleApi.deleteArticle(row.id); ElMessage.success('删除成功'); fetchData() } catch { /* cancelled */ }
}

onMounted(() => { fetchCategories(); fetchData() })
</script>
