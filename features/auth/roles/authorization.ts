import { RoleEnum } from "./constants";

function roleKey(
  user: { role?: { role?: { key?: string } } | null } | null
) {
  return user?.role?.role?.key;
}

export function isInternalAdminOrUser(
  user: { role?: { role?: { key?: string } } | null } | null
) {
  const key = roleKey(user);
  return key === RoleEnum.ADMIN || key === RoleEnum.USER;
}

export function isInternalAdmin(
  user: { role?: { role?: { key?: string } } | null } | null
) {
  return roleKey(user) === RoleEnum.ADMIN;
}
