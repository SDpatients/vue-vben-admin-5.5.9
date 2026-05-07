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

  return new Promise((resolve, reject) => {
    // #ifdef H5
    uni.chooseFile({
      count,
      type: 'all',
      extension,
      success: (res: any) => {
        const files = (res.tempFiles || []).map((file: any) => ({
          path: file.path || file.tempFilePath,
          name: file.name || file.path?.split('/').pop() || '未知文件',
          size: file.size || 0,
        }))
        resolve(files)
      },
      fail: (err: any) => reject(err),
    })
    // #endif

    // #ifdef MP-WEIXIN
    uni.chooseMessageFile({
      count,
      type: 'all',
      extension,
      success: (res: any) => {
        const files = (res.tempFiles || []).map((file: any) => ({
          path: file.path,
          name: file.name || file.path?.split('/').pop() || '未知文件',
          size: file.size || 0,
        }))
        resolve(files)
      },
      fail: (err: any) => reject(err),
    })
    // #endif

    // #ifdef APP-PLUS
    plus.io.chooseFile({
      multiple: count > 1,
      maximum: count,
      filter: extension || [],
      onChoose: (files: any[]) => {
        const result = files.map((file: any) => ({
          path: file.path,
          name: file.name || file.path?.split('/').pop() || '未知文件',
          size: file.size || 0,
        }))
        resolve(result)
      },
    }, (err: any) => reject(err))
    // #endif
  })
}
