<template>
  <div>
    <el-card>
      <div slot="header">
        <span>EasyExcel 功能测试</span>
      </div>
      
      <el-form :inline="true">
        <el-form-item label="案件ID">
          <el-input v-model="caseId" placeholder="请输入案件ID"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="downloadTemplate">下载模板</el-button>
          <el-button type="success" @click="exportExcel">导出数据</el-button>
        </el-form-item>
      </el-form>
      
      <el-upload
        ref="upload"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xlsx,.xls"
        action="#">
        <el-button slot="trigger" type="warning">选择 Excel 文件</el-button>
        <el-button type="primary" @click="importExcel" :loading="importing">导入</el-button>
      </el-upload>
      
      <el-divider content-position="left">导入已申报债权登记簿格式</el-divider>
      
      <el-upload
        ref="declaredUpload"
        :auto-upload="false"
        :on-change="handleDeclaredFileChange"
        :limit="1"
        accept=".xlsx,.xls"
        action="#">
        <el-button slot="trigger" type="info">选择已申报债权登记簿文件</el-button>
        <el-button type="primary" @click="importDeclaredClaims" :loading="declaredImporting">导入</el-button>
      </el-upload>
      
      <el-alert
        v-if="importResult"
        :title="importResult.message"
        :type="importResult.failCount > 0 ? 'warning' : 'success'"
        :closable="false"
        style="margin-top: 20px">
      </el-alert>
      
      <el-table
        v-if="importResult && importResult.errors.length > 0"
        :data="importResult.errors"
        style="margin-top: 20px">
        <el-table-column prop="rowNum" label="行号" width="80"></el-table-column>
        <el-table-column prop="creditorName" label="债权人" width="150"></el-table-column>
        <el-table-column prop="errorMsg" label="错误信息"></el-table-column>
      </el-table>
      
      <el-alert
        v-if="declaredImportResult"
        :title="declaredImportResult.message"
        :type="declaredImportResult.failCount > 0 ? 'warning' : 'success'"
        :closable="false"
        style="margin-top: 20px">
      </el-alert>
      
      <el-table
        v-if="declaredImportResult && declaredImportResult.errors.length > 0"
        :data="declaredImportResult.errors"
        style="margin-top: 20px">
        <el-table-column prop="rowNum" label="行号" width="80"></el-table-column>
        <el-table-column prop="creditorName" label="债权人" width="150"></el-table-column>
        <el-table-column prop="errorMsg" label="错误信息"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { downloadClaimRegistrationTemplateApi, importClaimRegistrationEasyApi, exportClaimRegistrationApi, importDeclaredClaimsApi } from '#/api/core/claim-registration';

export default {
  name: 'EasyExcelTest',
  data() {
    return {
      caseId: '',
      selectedFile: null,
      importing: false,
      importResult: null,
      declaredSelectedFile: null,
      declaredImporting: false,
      declaredImportResult: null
    };
  },
  methods: {
    async downloadTemplate() {
      try {
        const response = await downloadClaimRegistrationTemplateApi();
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '债权登记导入模板.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        this.$message.error('下载模板失败：' + (error.response?.data?.message || error.message));
      }
    },
    
    handleFileChange(file) {
      this.selectedFile = file.raw;
    },
    
    async importExcel() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择 Excel 文件');
        return;
      }
      
      if (!this.caseId) {
        this.$message.warning('请输入案件ID');
        return;
      }
      
      this.importing = true;
      this.importResult = null;
      
      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('caseId', this.caseId);
        
        const response = await importClaimRegistrationEasyApi(formData);
        
        this.importResult = response.data;
        
        if (this.importResult.failCount === 0) {
          this.$message.success('导入成功！');
        } else {
          this.$message.warning(`导入完成，成功${this.importResult.successCount}条，失败${this.importResult.failCount}条`);
        }
      } catch (error) {
        this.$message.error('导入失败：' + (error.response?.data?.message || error.message));
      } finally {
        this.importing = false;
      }
    },
    
    async exportExcel() {
      try {
        const params = this.caseId ? { caseId: Number(this.caseId) } : {};
        const response = await exportClaimRegistrationApi(params);
        
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `债权登记表_${new Date().getTime()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        this.$message.success('导出成功！');
      } catch (error) {
        this.$message.error('导出失败：' + (error.response?.data?.message || error.message));
      }
    },
    
    handleDeclaredFileChange(file) {
      this.declaredSelectedFile = file.raw;
    },
    
    async importDeclaredClaims() {
      if (!this.declaredSelectedFile) {
        this.$message.warning('请先选择已申报债权登记簿文件');
        return;
      }
      
      if (!this.caseId) {
        this.$message.warning('请输入案件ID');
        return;
      }
      
      this.declaredImporting = true;
      this.declaredImportResult = null;
      
      try {
        const formData = new FormData();
        formData.append('file', this.declaredSelectedFile);
        formData.append('caseId', this.caseId);
        
        const response = await importDeclaredClaimsApi(formData);
        
        this.declaredImportResult = response.data;
        
        if (this.declaredImportResult.failCount === 0) {
          this.$message.success('导入成功！');
        } else {
          this.$message.warning(`导入完成，成功${this.declaredImportResult.successCount}条，失败${this.declaredImportResult.failCount}条`);
        }
      } catch (error) {
        this.$message.error('导入失败：' + (error.response?.data?.message || error.message));
      } finally {
        this.declaredImporting = false;
      }
    }
  }
};
</script>
