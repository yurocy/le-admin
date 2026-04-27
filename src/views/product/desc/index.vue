<template>
  <div class="page-container">
    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加描述包</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column label="标题数" width="100">
        <template #default="{ row }">
          <el-tag>{{ row.titles?.length || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑描述包' : '添加描述包'" width="800px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入描述包名称" />
        </el-form-item>

        <el-divider content-position="left">标题列表</el-divider>

        <div v-for="(title, tIdx) in form.titles" :key="tIdx" class="title-block">
          <div class="title-header">
            <span class="title-label">标题 {{ tIdx + 1 }}</span>
            <el-button type="danger" link size="small" @click="removeTitle(tIdx)">删除标题</el-button>
          </div>
          <el-row :gutter="12">
            <el-col :span="6">
              <el-form-item label="类型" label-width="50px">
                <el-select v-model="title.type" style="width: 100%">
                  <el-option label="单选" :value="1" />
                  <el-option label="多选" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="标题" label-width="50px">
                <el-input v-model="title.title" placeholder="标题名称" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="排序" label-width="50px">
                <el-input-number v-model="title.sort" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="options-block">
            <span class="options-label">选项：</span>
            <div v-for="(opt, oIdx) in title.options" :key="oIdx" class="option-row">
              <el-row :gutter="8">
                <el-col :span="4">
                  <el-input v-model="opt.text" placeholder="文本" size="small" />
                </el-col>
                <el-col :span="4">
                  <el-input v-model="opt.info" placeholder="信息" size="small" />
                </el-col>
                <el-col :span="3">
                  <el-input-number v-model="opt.sort" :min="0" size="small" style="width: 100%" placeholder="排序" />
                </el-col>
                <el-col :span="3">
                  <el-input-number v-model="opt.ratio" :min="0" size="small" style="width: 100%" placeholder="比例" />
                </el-col>
                <el-col :span="2">
                  <el-button type="danger" link size="small" @click="removeOption(tIdx, oIdx)">删除</el-button>
                </el-col>
              </el-row>
            </div>
            <el-button size="small" @click="addOption(tIdx)">+ 添加选项</el-button>
          </div>
        </div>

        <el-button type="primary" plain @click="addTitle" style="margin-top: 12px">+ 添加标题</el-button>
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

interface TitleOption {
  text: string
  info: string
  sort: number
  ratio: number
}

interface DescTitle {
  type: number
  title: string
  sort: number
  options: TitleOption[]
}

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  titles: [] as DescTitle[],
})

const rules = {
  name: [{ required: true, message: '请输入描述包名称', trigger: 'blur' }],
}

function createEmptyTitle(): DescTitle {
  return { type: 1, title: '', sort: 0, options: [] }
}

function createEmptyOption(): TitleOption {
  return { text: '', info: '', sort: 0, ratio: 0 }
}

function addTitle() {
  form.titles.push(createEmptyTitle())
}

function removeTitle(idx: number) {
  form.titles.splice(idx, 1)
}

function addOption(tIdx: number) {
  form.titles[tIdx].options.push(createEmptyOption())
}

function removeOption(tIdx: number, oIdx: number) {
  form.titles[tIdx].options.splice(oIdx, 1)
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await productApi.listDesc()
    tableData.value = res.data || res || []
  } catch {
    ElMessage.error('获取描述包列表失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  editId.value = 0
  form.name = ''
  form.titles = []
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  form.name = row.name
  form.titles = (row.titles || []).map((t: any) => ({
    type: t.type ?? 1,
    title: t.title ?? '',
    sort: t.sort ?? 0,
    options: (t.options || []).map((o: any) => ({
      text: o.text ?? '',
      info: o.info ?? '',
      sort: o.sort ?? 0,
      ratio: o.ratio ?? 0,
    })),
  }))
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    const payload = { name: form.name, titles: form.titles }
    if (isEdit.value) {
      await productApi.updateDesc(editId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await productApi.createDesc(payload)
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
    await ElMessageBox.confirm('确定删除该描述包吗？', '提示', { type: 'warning' })
    await productApi.deleteDesc(row.id)
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

<style lang="scss" scoped>
.title-block {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fafafa;
}

.title-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title-label {
  font-weight: bold;
  font-size: 14px;
}

.options-block {
  margin-top: 8px;
  padding-left: 16px;
  border-left: 2px solid #dcdfe6;
}

.options-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  display: block;
}

.option-row {
  margin-bottom: 8px;
}
</style>
