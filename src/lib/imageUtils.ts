/**
 * Redimensiona um File de imagem para base64, respeitando maxPx e qualidade.
 * Alvo: < 200KB para não estourar tokens de visão do gpt-4o-mini.
 *
 * @param file     Arquivo de imagem (câmera ou galeria)
 * @param maxPx    Dimensão máxima (largura ou altura) — default 800px
 * @param quality  Qualidade JPEG 0–1 — default 0.7
 * @returns        base64 sem o prefixo "data:image/...;base64,"
 */
export async function resizeImageToBase64(
  file: File,
  maxPx = 800,
  quality = 0.7,
): Promise<{ base64: string; mimeType: string; sizeKB: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      // Calcular dimensões mantendo proporção
      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        if (width >= height) {
          height = Math.round((height * maxPx) / width)
          width = maxPx
        } else {
          width = Math.round((width * maxPx) / height)
          height = maxPx
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas não disponível')); return }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Falha ao converter imagem')); return }

          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result as string
            // Remove o prefixo "data:image/jpeg;base64,"
            const base64 = dataUrl.split(',')[1]
            const sizeKB = Math.round(blob.size / 1024)
            resolve({ base64, mimeType: 'image/jpeg', sizeKB })
          }
          reader.onerror = () => reject(new Error('Falha ao ler blob'))
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Falha ao carregar imagem'))
    }

    img.src = objectUrl
  })
}
