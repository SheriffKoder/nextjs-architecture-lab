/**
 * Path helpers for nav active matching.
 */

export function getLastPathSegment(path: string): string {
  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1] || ''
}

export function isNavItemActive(
  pathname: string,
  item: { href: string; children?: { href: string }[] },
): boolean {
  const pathnameLastSegment = getLastPathSegment(pathname)
  const itemLastSegment = getLastPathSegment(item.href)

  if (pathnameLastSegment === itemLastSegment && pathnameLastSegment !== '') {
    return true
  }
  if (item.children) {
    return item.children.some((child) => {
      const childLastSegment = getLastPathSegment(child.href)
      return (
        pathnameLastSegment === childLastSegment && pathnameLastSegment !== ''
      )
    })
  }
  return false
}
