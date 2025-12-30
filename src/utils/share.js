export const shareImage = async ({ title, text, blob, filename }) => {
  if (!navigator?.share || !blob) {
    return { shared: false }
  }

  const file = new File([blob], filename, { type: blob.type || 'image/png' })

  if (navigator.canShare && !navigator.canShare({ files: [file] })) {
    return { shared: false }
  }

  await navigator.share({ title, text, files: [file] })
  return { shared: true }
}

export const downloadImage = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
