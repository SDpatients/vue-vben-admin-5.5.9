import { ref } from 'vue'
import { viewSensitiveData, type SensitiveDataType } from '@/utils/sensitiveData'

export function useSensitiveDataView() {
  const isViewing = ref(false)
  const resultText = ref('')
  const errorText = ref('')

  function viewMaskedData(dataType: SensitiveDataType, id: number, typeLabel: string): Promise<string | null> {
    return new Promise((resolve) => {
      uni.showModal({
        title: `查看${typeLabel}`,
        content: '请输入您的登录密码以验证身份',
        editable: true,
        placeholderText: '请输入登录密码',
        success: async (res) => {
          if (!res.confirm || !res.content) {
            resolve(null)
            return
          }

          isViewing.value = true
          resultText.value = ''
          errorText.value = ''

          try {
            const apiRes = await viewSensitiveData(dataType, id, res.content)
            if (apiRes.code === 200 && apiRes.data) {
              resultText.value = apiRes.data.plainTextValue
              uni.showModal({
                title: typeLabel,
                content: `完整内容：${apiRes.data.plainTextValue}`,
                showCancel: false,
                confirmText: '关闭',
              })
              resolve(apiRes.data.plainTextValue)
            } else {
              errorText.value = apiRes.message || '验证失败'
              uni.showToast({ title: errorText.value, icon: 'none' })
              resolve(null)
            }
          } catch (error: any) {
            errorText.value = error?.message || '请求失败，请检查网络或密码是否正确'
            uni.showToast({ title: errorText.value, icon: 'none' })
            resolve(null)
          } finally {
            isViewing.value = false
          }
        },
      })
    })
  }

  return {
    isViewing,
    resultText,
    errorText,
    viewMaskedData,
  }
}