<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="关键词" clearable style="width: 180px" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加合作伙伴</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="company" label="公司" min-width="140" show-overflow-tooltip />
      <el-table-column prop="contact" label="联系人" width="100" />
      <el-table-column prop="usertel" label="电话" width="130" />
      <el-table-column prop="city_name" label="城市" width="100" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="regtime" label="添加时间" width="170" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑合作伙伴' : '添加合作伙伴'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" placeholder="联系人" />
        </el-form-item>
        <el-form-item label="电话" prop="usertel">
          <el-input v-model="form.usertel" placeholder="电话" />
        </el-form-item>
        <el-form-item label="城市">
          <el-select v-model="form.city_id" placeholder="选择城市" clearable filterable style="width: 100%">
            <el-option v-for="item in cityList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="详细地址" />
        </el-form-item>
        <el-form-item label="信息">
          <el-input v-model="form.info" type="textarea" :rows="2" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch v-model="form.status" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代理商ID">
              <el-input v-model="form.agent_id" placeholder="代理商ID" />
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
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { partnerApi, webApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const defaultForm = { name: '', contact: '', usertel: '', city_id: '' as any, address: '', info: '', status: true, agent_id: '' }
const form = reactive({ ...defaultForm })
const cityList = ref<any[]>([])

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    const res: any = await partnerApi.listPartner(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('获取列表失败') } finally { loading.value = false }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { searchForm.keyword = ''; pagination.page = 1; fetchData() }

function handleAdd() {
  isEdit.value = false; editId.value = 0
  Object.assign(form, { ...defaultForm })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true; editId.value = row.id
  Object.assign(form, {
    name: row.name, contact: row.contact, usertel: row.usertel, city_id: row.city_id,
    address: row.address, info: row.info, status: !!row.status, agent_id: row.agent_id ?? '',
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await partnerApi.updatePartner(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await partnerApi.createPartner({ ...form })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false; fetchData()
  } catch { ElMessage.error('操作失败') } finally { submitLoading.value = false }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该合作伙伴吗？', '提示', { type: 'warning' })
    await partnerApi.deletePartner(row.id)
    ElMessage.success('删除成功'); fetchData()
  } catch { /* cancelled */ }
}

async function fetchCity() {
  try {
    const res: any = await webApi.listCity()
    cityList.value = res.data?.list || res.data || res || []
  } catch { /* ignore */ }
}

onMounted(() => { fetchCity(); fetchData() })
</script>
