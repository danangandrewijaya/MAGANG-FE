export function getTopLevelField(queryString: string): string | null {
  const trimmed = queryString.replace(/\s+/g, ' ').trim()

  // Ambil isi di dalam kurung kurawal pertama
  const bodyMatch = trimmed.match(/\{([^}]*)\}/)
  if (bodyMatch) {
    // Ambil field pertama, bisa jadi ada alias: aliasName: mutationName
    const firstLine = bodyMatch[1].trim().split(/\s|\(/)[0]

    // Jika ada alias (aliasName: mutationName), ambil setelah ':'
    const afterColon = firstLine.split(':').pop()?.trim()

    return afterColon || null
  }

  return null
}
