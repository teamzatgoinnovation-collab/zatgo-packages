/** Client-side gate using server-provided role / permission flags. */
export function can(
  permissions: ReadonlySet<string> | readonly string[],
  permission: string,
): boolean {
  if (permissions instanceof Set) return permissions.has(permission);
  return (permissions as readonly string[]).includes(permission);
}
