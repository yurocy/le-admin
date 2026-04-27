<template>
  <div class="page-container">
    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加优惠券</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="150" />
      <el-table-column prop="price" label="面额" width="100" align="right" />
      <el-table-column prop="limit" label="使用门槛" width="120" align="right" />
      <el-table-column prop="outtime" label="过期时间" width="170" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑优惠券' : '添加优惠券'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入优惠券标题" />
        </el-form-item>
        <el-form-item label="面额" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="门槛" prop="limit">
          <el-input-number v-model="form.limit" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="过期时间" prop="outtime">
          <el-date-picker v-model="form.outtime" type="datetime" placeholder="选择过期时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.info" type="textarea" :rows="3" placeholder="使用说明" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" />
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
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const form = reactive({
  title: '',
  price: 0,
  limit: 0,
  outtime: '',
  info: '',
  sort: 0,
  status: true,
})

const rules = {
  title: [{ required: true, message: '请输入优惠券标题', trigger: 'blur' }],
  outtime: [{ required: true, message: '请选择过期时间', trigger: 'change' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await productApi.listCoupon()
    tableData.value = res.data?.list || res.data || res || []
  } catch {
    ElMessage.error('获取优惠券列表失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, { title: '', price: 0, limit: 0, outtime: '', info: '', sort: 0, status: true })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    title: row.title, price: row.price, limit: row.limit, outtime: row.outtime,
    info: row.info, sort: row.sort, status: row.status,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await productApi.updateCoupon(editId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await productApi.createCoupon({ ...form })
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
    await ElMessageBox.confirm('确定删除该优惠券吗？', '提示', { type: 'warning' })
    await productApi.deleteCoupon(row.id)
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
