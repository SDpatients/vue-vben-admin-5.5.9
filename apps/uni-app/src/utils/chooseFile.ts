interface ChooseFileResult {
  path: string
  name: string
  size: number
}

interface ChooseFileOptions {
  count?: number
  extension?: string[]
}

export const chooseFilePlatform = (options: ChooseFileOptions = {}): Promise<ChooseFileResult[]> => {
  const { count = 10, extension } = options

  console.log('[chooseFilePlatform] 开始选择文件, options:', JSON.stringify({ count, extension }))

  return new Promise((resolve, reject) => {
    // #ifdef H5
    uni.chooseFile({
      count,
      type: 'all',
      extension,
      success: (res: any) => {
        console.log('[chooseFilePlatform][H5] uni.chooseFile success:', JSON.stringify({ tempFilesCount: res.tempFiles?.length, tempFilePathsCount: res.tempFilePaths?.length }))
        const files = (res.tempFiles || []).map((file: any) => ({
          path: file.path || file.tempFilePath,
          name: file.name || file.path?.split('/').pop() || '未知文件',
          size: file.size || 0,
        }))
        console.log('[chooseFilePlatform][H5] 处理后的文件列表:', JSON.stringify(files.map(f => ({ name: f.name, size: f.size }))))
        resolve(files)
      },
      fail: (err: any) => {
        console.error('[chooseFilePlatform][H5] uni.chooseFile fail:', JSON.stringify(err))
        reject(err)
      },
    })
    // #endif

    // #ifdef MP-WEIXIN
    uni.chooseMessageFile({
      count,
      type: 'all',
      extension,
      success: (res: any) => {
        console.log('[chooseFilePlatform][MP-WEIXIN] uni.chooseMessageFile success:', JSON.stringify({ tempFilesCount: res.tempFiles?.length }))
        const files = (res.tempFiles || []).map((file: any) => ({
          path: file.path,
          name: file.name || file.path?.split('/').pop() || '未知文件',
          size: file.size || 0,
        }))
        console.log('[chooseFilePlatform][MP-WEIXIN] 处理后的文件列表:', JSON.stringify(files.map(f => ({ name: f.name, size: f.size }))))
        resolve(files)
      },
      fail: (err: any) => {
        console.error('[chooseFilePlatform][MP-WEIXIN] uni.chooseMessageFile fail:', JSON.stringify(err))
        reject(err)
      },
    })
    // #endif

    // #ifdef APP-PLUS
    // APP-PLUS 文件选择：先检测 uni.chooseFile 是否可用（HBuilderX 3.2.7+）
    // 不可用时回退到 plus.io.chooseFile（只支持单文件，success回调接收字符串路径）
    try {
      if (typeof uni.chooseFile === 'function') {
        uni.chooseFile({
          count,
          type: 'all',
          extension,
          success: (res: any) => {
            console.log('[chooseFilePlatform][APP-PLUS] uni.chooseFile success:', JSON.stringify({ tempFilesCount: res.tempFiles?.length, tempFilePathsCount: res.tempFilePaths?.length }))
            const files = (res.tempFiles || []).map((file: any) => ({
              path: file.path || file.tempFilePath,
              name: file.name || file.path?.split('/').pop() || '未知文件',
              size: file.size || 0,
            }))
            console.log('[chooseFilePlatform][APP-PLUS] 处理后的文件列表:', JSON.stringify(files.map(f => ({ name: f.name, size: f.size }))))
            resolve(files)
          },
          fail: (err: any) => {
            console.error('[chooseFilePlatform][APP-PLUS] uni.chooseFile fail:', JSON.stringify(err))
            reject(err)
          },
        })
      } else {
        console.log('[chooseFilePlatform][APP-PLUS] uni.chooseFile 不可用, 使用 plus.io.chooseFile 回退方案')
        usePlusIoChooseFile()
      }
    } catch (e) {
      console.error('[chooseFilePlatform][APP-PLUS] uni.chooseFile 调用异常, 使用 plus.io.chooseFile 回退:', e)
      usePlusIoChooseFile()
    }

    // plus.io.chooseFile 回退方案
    // 不同 HBuilderX 版本 API 签名不同：
    // - 旧版: plus.io.chooseFile(success(path), error(err))
    // - 新版: 成功数据可能走到第二个回调，返回 {files: [...]} 对象
    // 所以两个回调都检查是否包含 files 数组，统一处理
    function usePlusIoChooseFile() {
      let resolved = false
      const handleResult = (data: any, source: string) => {
        if (resolved) return
        console.log('[chooseFilePlatform][APP-PLUS] plus.io 回调(' + source + '):', JSON.stringify(data))
        
        // 成功: 返回 {files: [...]} 对象
        if (data && data.files && Array.isArray(data.files) && data.files.length > 0) {
          resolved = true
          const files: ChooseFileResult[] = data.files.map((path: string) => ({
            path: path,
            name: path?.split('/').pop() || path?.split('\\').pop() || '未知文件',
            size: 0,
          }))
          console.log('[chooseFilePlatform][APP-PLUS] 处理后的文件列表:', JSON.stringify(files.map(f => ({ name: f.name, path: f.path }))))
          resolve(files)
          return
        }
        
        // 成功: 返回单个路径字符串
        if (typeof data === 'string' && data.length > 0 && data.includes('/')) {
          resolved = true
          const files: ChooseFileResult[] = [{
            path: data,
            name: data?.split('/').pop() || data?.split('\\').pop() || '未知文件',
            size: 0,
          }]
          console.log('[chooseFilePlatform][APP-PLUS] 处理后的文件列表(字符串路径):', JSON.stringify(files.map(f => ({ name: f.name, path: f.path }))))
          resolve(files)
          return
        }
      }
      
      try {
        plus.io.chooseFile(
          (result1: any) => {
            handleResult(result1, 'cb1')
          },
          (result2: any) => {
            // 在这个版本中, 成功数据可能走到第二个回调
            handleResult(result2, 'cb2')
            // 如果上面没处理（没有 files，也不是字符串路径），才是真正的错误
            if (!resolved) {
              resolved = true
              reject(result2)
            }
          },
        )
      } catch (fallbackErr) {
        console.error('[chooseFilePlatform][APP-PLUS] plus.io.chooseFile 执行异常:', fallbackErr)
        reject(fallbackErr)
      }
    }
    // #endif
  })
}
