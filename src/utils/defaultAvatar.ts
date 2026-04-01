/** 优先昵称首字，否则用户名首字（与资料页、顶栏默认头像一致） */
export function getNicknameInitialLetter(nickName: string, userName: string): string {
  const nick = String(nickName ?? '').trim()
  if (nick) {
    const c = nick.charAt(0)
    return /[a-z]/.test(c) ? c.toUpperCase() : c
  }
  const un = String(userName ?? '').trim()
  if (un) {
    const c = un.charAt(0)
    return /[a-z]/.test(c) ? c.toUpperCase() : c
  }
  return '?'
}

/** 将单字符安全嵌入 SVG text，避免 XML 特殊字符破坏解析 */
function escapeXmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 生成灰底、居中字符的默认头像（SVG data URL），供 img 直接使用。
 * @param char 展示字符，通常取昵称首字
 * @param size 输出边长（像素）
 */
export function buildDefaultAvatarSvgDataUrl(char: string, size = 96): string {
  const ch = escapeXmlText((char || '?').slice(0, 1))
  const fontSize = Math.round(size * 0.42)
  // 略低于几何中心，抵消拉丁/中文字形视觉上的“偏上”
  const cx = size / 2
  const cy = Math.round(size * 0.55)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="#999999"/><text x="${cx}" y="${cy}" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,1)" font-size="${fontSize}" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-weight="600">${ch}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
