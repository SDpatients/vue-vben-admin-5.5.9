## 前端许可证管理方案
### 一、用户操作流程
```
┌───────────────────────────────────
──────────────────────────────┐
│                    许可证管理用户流
程                            │
├───────────────────────────────────
──────────────────────────────┤
│                                   
                              │
│  首次部署/许可证失
效                                  
            │
│       
│                                   
                      │
│       
▼                                   
                      │
│  
┌─────────────────┐                 
                           │
│  │  显示许可证提示页 │  ← 友好提示，
非错误页面                     │
│  │                 
│                                   
         │
│  │  1. 显示机器码    │  ← 一键复制按
钮                            │
│  │  2. 联系客服按钮  │  ← 打开邮箱/企
业微信                         │
│  │  3. 上传许可证按钮 │  ← 拖拽上传许
可证文件                        │
│  
└─────────────────┘                 
                           │
│       
│                                   
                      │
│       
▼                                   
                      │
│  用户将机器码发送给你 → 你生成许可证 
→ 用户上传许可证文件              │
│       
│                                   
                      │
│       
▼                                   
                      │
│  验证成功 → 自动跳转到登录
页                                  
     │
│                                   
                              │
└───────────────────────────────────
──────────────────────────────┘
```
### 二、前端 API 接口封装
```
// api/license.js
import request from '@/utils/
request'

export const licenseApi = {
  // 获取许可证状态
  getStatus() {
    return request({
      url: '/system/license/status',
      method: 'get'
    })
  },

  // 获取机器码
  getMachineCode() {
    return request({
      url: '/system/license/
      machine-code',
      method: 'get'
    })
  },

  // 验证许可证
  validateLicense() {
    return request({
      url: '/system/license/
      validate',
      method: 'post'
    })
  },

  // 检查模块授权
  checkModule(module) {
    return request({
      url: `/system/license/modules/
      ${module}`,
      method: 'get'
    })
  },

  // 上传许可证文件
  uploadLicense(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
      url: '/system/license/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/
        form-data'
      }
    })
  }
}
```
### 三、Vue 组件实现 1. 许可证状态检查组件（路由守卫用）
```
<!-- components/LicenseGuard.vue -->
<template>
  <div>
    <slot v-if="licenseValid" />
    <LicenseRequired v-else 
    :reason="licenseReason" />
  </div>
</template>

<script>
import { licenseApi } from '@/api/
license'

export default {
  name: 'LicenseGuard',
  data() {
    return {
      licenseValid: false,
      licenseReason: ''
    }
  },
  async created() {
    await this.checkLicense()
  },
  methods: {
    async checkLicense() {
      try {
        const res = await 
        licenseApi.getStatus()
        if (res.data.valid) {
          this.licenseValid = true
          // 保存到全局状态
          this.$store.commit
          ('SET_LICENSE_INFO', res.
          data)
        } else {
          this.licenseValid = false
          this.licenseReason = res.
          data.expired ? '许可证已过
          期' : '许可证无效'
        }
      } catch (error) {
        this.licenseValid = false
        this.licenseReason = '许可证
        验证失败'
      }
    }
  }
}
</script>
``` 2. 许可证提示页面
```
<!-- views/license/LicenseRequired.
vue -->
<template>
  <div class="license-container">
    <div class="license-card">
      <div class="license-header">
        <i class="el-icon-lock 
        license-icon"></i>
        <h2>软件授权激活</h2>
        <p class="subtitle">请完成授
        权激活以继续使用系统</p>
      </div>

      <!-- 步骤条 -->
      <el-steps 
      :active="currentStep" 
      finish-status="success" 
      simple>
        <el-step title="获取机器码" /
        >
        <el-step title="联系客服" />
        <el-step title="上传许可证" /
        >
      </el-steps>

      <!-- 步骤1: 获取机器码 -->
      <div v-if="currentStep === 0" 
      class="step-content">
        <div 
        class="machine-code-box">
          <label>您的机器码（请复制发送
          给客服）</label>
          <div class="code-display">
            <code>{{ machineCode }}
            </code>
            <el-button 
              type="primary" 
              size="small" 
              @click="copyMachineCod
              e"
              :icon="copied ? 
              'el-icon-check' : 
              'el-icon-document-copy
              '"
            >
              {{ copied ? '已复制' 
              : '复制' }}
            </el-button>
          </div>
          <p class="tip">此机器码唯一
          标识您的服务器，请勿泄露给他人
          </p>
        </div>

        <div class="action-buttons">
          <el-button type="success" 
          @click="contactService">
            <i 
            class="el-icon-service">
            </i>
            联系客服获取许可证
          </el-button>
          <el-button 
          @click="currentStep = 2" 
          type="text">
            已有许可证？直接上传
          </el-button>
        </div>
      </div>

      <!-- 步骤2: 联系客服 -->
      <div v-if="currentStep === 1" 
      class="step-content">
        <div class="contact-info">
          <h3>请联系客服获取许可证</
          h3>
          <p>请将以下信息发送给客服：</
          p>
          <ul>
            <li>机器码：{{ 
            machineCode }}</li>
            <li>客户名称：您的公司/律所
            名称</li>
            <li>需要的功能模块</li>
            <li>授权用户数</li>
          </ul>
          
          <div 
          class="contact-methods">
            <el-button 
            type="primary" 
            @click="openEmail">
              <i 
              class="el-icon-message
              "></i>
              发送邮件
            </el-button>
            <el-button 
            type="success" 
            @click="openWeChat">
              <i 
              class="el-icon-chat-do
              t-round"></i>
              企业微信
            </el-button>
            <el-button 
            type="warning" 
            @click="openPhone">
              <i 
              class="el-icon-phone">
              </i>
              电话联系
            </el-button>
          </div>
        </div>
        
        <el-button 
        @click="currentStep = 2" 
        type="primary">
          下一步：上传许可证
          <i 
          class="el-icon-arrow-right
          "></i>
        </el-button>
      </div>

      <!-- 步骤3: 上传许可证 -->
      <div v-if="currentStep === 2" 
      class="step-content">
        <el-upload
          class="license-uploader"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChan
          ge"
          :show-file-list="false"
          accept=".lic,.json"
        >
          <i 
          class="el-icon-upload"></
          i>
          <div 
          class="el-upload__text">
            将许可证文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div 
          class="el-upload__tip" 
          slot="tip">
            支持 .lic 或 .json 格式的
            许可证文件
          </div>
        </el-upload>

        <div v-if="uploadResult" 
        class="upload-result" 
        :class="uploadResult.type">
          <i :class="uploadResult.
          icon"></i>
          <span>{{ uploadResult.
          message }}</span>
        </div>

        <div class="action-buttons">
          <el-button 
          @click="currentStep = 0" 
          type="text">
            <i 
            class="el-icon-arrow-lef
            t"></i>
            返回上一步
          </el-button>
        </div>
      </div>

      <!-- 许可证信息展示（已激活） -->
      <div v-if="licenseInfo && 
      licenseInfo.valid" 
      class="license-info">
        <el-divider></el-divider>
        <h3>当前许可证信息</h3>
        <el-descriptions 
        :column="2" border>
          <el-descriptions-item 
          label="客户名称">
            {{ licenseInfo.
            licenseInfo?.
            customerName }}
          </el-descriptions-item>
          <el-descriptions-item 
          label="许可证编号">
            {{ licenseInfo.
            licenseInfo?.
            licenseId }}
          </el-descriptions-item>
          <el-descriptions-item 
          label="授权模块">
            <el-tag 
              v-for="mod in 
              licenseInfo.
              licenseInfo?.modules" 
              :key="mod"
              size="small"
              class="module-tag"
            >
              {{ getModuleName
              (mod) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item 
          label="最大用户数">
            {{ licenseInfo.
            licenseInfo?.maxUsers }}
          </el-descriptions-item>
          <el-descriptions-item 
          label="到期时间" :span="2">
            <span :class="{ 
            'text-danger': 
            licenseInfo.
            remainingDays < 30 }">
              {{ formatDate
              (licenseInfo.
              licenseInfo?.
              expireDate) }}
              <el-tag 
                v-if="licenseInfo.
                remainingDays < 30" 
                type="danger"
                size="small"
              >
                剩余 {{ licenseInfo.
                remainingDays }} 天
              </el-tag>
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script>
import { licenseApi } from '@/api/
license'
import { copyToClipboard } from '@/
utils/clipboard'

export default {
  name: 'LicenseRequired',
  data() {
    return {
      currentStep: 0,
      machineCode: '',
      copied: false,
      licenseInfo: null,
      uploadResult: null
    }
  },
  async created() {
    await this.getMachineCode()
    await this.checkLicenseStatus()
  },
  methods: {
    async getMachineCode() {
      try {
        const res = await 
        licenseApi.getMachineCode()
        this.machineCode = res.data.
        machineCode
      } catch (error) {
        this.$message.error('获取机器
        码失败')
      }
    },
    async checkLicenseStatus() {
      try {
        const res = await 
        licenseApi.getStatus()
        this.licenseInfo = res.data
        if (res.data.valid) {
          this.$message.success('许
          可证验证通过')
          setTimeout(() => {
            this.$router.push('/
            login')
          }, 2000)
        }
      } catch (error) {
        console.error('检查许可证状态
        失败', error)
      }
    },
    async copyMachineCode() {
      try {
        await copyToClipboard(this.
        machineCode)
        this.copied = true
        this.$message.success('机器
        码已复制到剪贴板')
        setTimeout(() => {
          this.copied = false
        }, 2000)
      } catch (error) {
        this.$message.error('复制失败
        ')
      }
    },
    contactService() {
      this.currentStep = 1
    },
    openEmail() {
      const subject = 
      encodeURIComponent('申请法律案
      件管理系统许可证')
      const body = 
      encodeURIComponent(
        `机器码：${this.machineCode}
        \n` +
        `客户名称：\n` +
        `需要的功能模块：\n` +
        `授权用户数：\n`
      )
      window.open
      (`mailto:support@yourcompany.
      com?subject=${subject}&body=$
      {body}`)
    },
    openWeChat() {
      this.$message.info('请添加客服
      微信：support123')
    },
    openPhone() {
      this.$message.info('客服电话：
      400-123-4567')
    },
    async handleFileChange(file) {
      try {
        const res = await 
        licenseApi.uploadLicense
        (file.raw)
        if (res.success) {
          this.uploadResult = {
            type: 'success',
            icon: 'el-icon-check',
            message: '许可证上传成功，
            正在验证...'
          }
          await this.
          checkLicenseStatus()
        } else {
          this.uploadResult = {
            type: 'error',
            icon: 'el-icon-close',
            message: res.message || 
            '许可证验证失败'
          }
        }
      } catch (error) {
        this.uploadResult = {
          type: 'error',
          icon: 'el-icon-close',
          message: error.message || 
          '上传失败'
        }
      }
    },
    getModuleName(module) {
      const moduleNames = {
        case: '案件管理',
        fund: '资金管理',
        document: '文档管理',
        creditor: '债权人管理',
        approval: '审批流程',
        report: '统计报表',
        ai: 'AI助手',
        chat: '实时聊天'
      }
      return moduleNames[module] || 
      module
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).
      toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.license-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.license-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,
  0,0.1);
  padding: 40px;
  width: 100%;
  max-width: 600px;
}

.license-header {
  text-align: center;
  margin-bottom: 30px;
}

.license-icon {
  font-size: 64px;
  color: #409EFF;
  margin-bottom: 20px;
}

.subtitle {
  color: #909399;
  margin-top: 10px;
}

.step-content {
  margin-top: 30px;
}

.machine-code-box {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.code-display {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.code-display code {
  flex: 1;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
  border: 1px solid #dcdfe6;
}

.tip {
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.license-uploader {
  text-align: center;
}

.upload-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

.upload-result.success {
  background: #f0f9eb;
  color: #67c23a;
}

.upload-result.error {
  background: #fef0f0;
  color: #f56c6c;
}

.module-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.text-danger {
  color: #f56c6c;
}
</style>
``` 3. 路由守卫配置
```
// router/index.js
import Vue from 'vue'
import Router from 'vue-router'
import { licenseApi } from '@/api/
license'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/license',
      name: 'License',
      component: () => import('@/
      views/license/LicenseRequired.
      vue'),
      meta: { public: true }
    },
    // ... 其他路由
  ]
})

// 路由守卫 - 检查许可证
router.beforeEach(async (to, from, 
next) => {
  // 公开页面直接放行
  if (to.meta && to.meta.public) {
    return next()
  }

  try {
    const res = await licenseApi.
    getStatus()
    if (!res.data.valid) {
      // 许可证无效，跳转到许可证页面
      return next('/license')
    }
    
    // 保存许可证信息到全局
    Vue.prototype.$license = res.
    data
    
    // 检查页面是否需要特定模块授权
    if (to.meta && to.meta.
    requiredModules) {
      const requiredModules = to.
      meta.requiredModules
      const enabledModules = res.
      data.licenseInfo?.modules || 
      []
      
      const hasAllModules = 
      requiredModules.every(mod => 
        enabledModules.includes(mod)
      )
      
      if (!hasAllModules) {
        Vue.prototype.$message.
        warning('该功能需要授权才能使用
        ')
        return next(false)
      }
    }
    
    next()
  } catch (error) {
    // API 调用失败，可能是未登录，继续
    正常流程
    next()
  }
})

export default router
``` 4. 顶部导航栏许可证状态组件
```
<!-- components/LicenseStatus.vue 
-->
<template>
  <div v-if="licenseInfo" 
  class="license-status">
    <el-tooltip 
      :content="`许可证剩余 $
      {licenseInfo.remainingDays} 天
      `" 
      placement="bottom"
    >
      <el-tag 
        :type="licenseInfo.
        remainingDays < 30 ? 
        'danger' : 'success'"
        size="small"
        effect="plain"
      >
        <i class="el-icon-key"></i>
        {{ licenseInfo.
        remainingDays < 30 ? '即将过
        期' : '已授权' }}
      </el-tag>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'LicenseStatus',
  computed: {
    licenseInfo() {
      return this.$store.state.
      licenseInfo
    }
  }
}
</script>

<style scoped>
.license-status {
  margin-right: 15px;
}
</style>
```
### 四、后端上传接口（补充）
需要在 LicenseController.java 中添加文件上传接口：

```
@PostMapping("/upload")
@Operation(summary = "上传许可证文件
", description = "上传许可证文件并验证
")
public Result<Map<String, Object>> 
uploadLicense(@RequestParam("file") 
MultipartFile file) {
    try {
        // 保存文件到配置路径
        Path targetPath = Paths.get
        (licenseProperties.
        getFilePath());
        Files.createDirectories
        (targetPath.getParent());
        Files.write(targetPath, 
        file.getBytes());
        
        // 重新验证许可证
        licenseService.
        validateLicense();
        
        Map<String, Object> result 
        = new HashMap<>();
        result.put("valid", 
        licenseService.isValid());
        result.put("message", 
        licenseService.isValid() ? "
        许可证验证成功" : "许可证验证失
        败");
        
        return Result.success
        (result);
    } catch (Exception e) {
        return Result.error("许可证上
        传失败: " + e.getMessage());
    }
}
```
### 五、用户使用流程总结
```
1. 用户首次访问系统
   ↓
2. 后端返回 403 或前端检测到许可证无效
   ↓
3. 前端自动跳转到 /license 页面
   ↓
4. 显示友好的三步引导：
   ├─ 第1步：一键复制机器码
   ├─ 第2步：联系客服（邮件/微信/电话）
   └─ 第3步：拖拽上传许可证文件
   ↓
5. 验证成功后自动跳转到登录页
   ↓
6. 顶部导航栏显示许可证状态
```
这样设计的好处：

- 非技术人员也能操作 ：三步引导，清晰明了
- 一键复制 ：避免手动复制出错
- 多种联系方式 ：邮件、微信、电话任选
- 拖拽上传 ：操作简单直观
- 状态可视化 ：顶部显示授权状态和剩余天数
