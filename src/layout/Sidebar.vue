<template>
  <div class="sidebar">
    <div class="logo">
      <img src="/logo.png" alt="乐回收" class="logo-img" />
      <h1 v-if="!appStore.sidebarCollapsed">乐回收管理</h1>
    </div>
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        background-color="#001529"
        text-color="#ffffffb3"
        active-text-color="#409eff"
        :collapse-transition="false"
        router
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- Single child or direct route -->
          <template v-if="!route.children || route.children.length === 1">
            <el-menu-item
              v-if="!route.meta?.hidden"
              :index="route.children ? (route.path === '/' ? '/' + route.children[0].path : route.path + '/' + route.children[0].path) : route.path"
            >
              <el-icon v-if="getIcon(route)">
                <component :is="getIcon(route)" />
              </el-icon>
              <template #title>{{ getSingleTitle(route) }}</template>
            </el-menu-item>
          </template>

          <!-- Multiple children -->
          <el-sub-menu v-else-if="!route.meta?.hidden" :index="route.path">
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="route.path + '/' + child.path"
            >
              <el-icon v-if="child.meta?.icon">
                <component :is="child.meta.icon" />
              </el-icon>
              <template #title>{{ child.meta?.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import router from '@/router'

const route = useRoute()
const appStore = useAppStore()

const menuRoutes = computed(() => {
  return router.options.routes.filter(r => !r.meta?.hidden)
})

const activeMenu = computed(() => route.path)

function getIcon(route: any) {
  if (route.meta?.icon) return route.meta.icon
  if (route.children?.[0]?.meta?.icon) return route.children[0].meta.icon
  return null
}

function getSingleTitle(route: any) {
  if (route.children?.length === 1) return route.children[0].meta?.title
  return route.meta?.title
}
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid #ffffff1a;
  flex-shrink: 0;

  .logo-img {
    height: 36px;
    width: auto;
    object-fit: contain;
  }

  h1 {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }
}

.el-menu {
  border-right: none;
}
</style>
