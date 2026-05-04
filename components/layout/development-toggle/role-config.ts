/**
 * Role Configuration
 * 
 * Purpose: Configuration file for available user roles
 * Used in: RoleSelector component
 * Why: Centralized role definitions based on RoleEnum
 * 
 * Function Index:
 * - roleConfig: Configuration object with available roles
 * 
 * Steps:
 * 1. Define roles based on RoleEnum
 * 2. Export configuration for use in components
 */

import { RoleEnum } from '@/lib/constants'
import { Role } from '@/lib/types'

/**
 * Available roles configuration
 * Based on RoleEnum from lib/constants.ts
 */
export const roleConfig = {
  roles: [
    {
      id: '1',
      name: 'Admin',
      value: RoleEnum.ADMIN,
      description: 'Administrator with full access'
    },
    {
      id: '2',
      name: 'User',
      value: RoleEnum.USER,
      description: 'Standard user with limited access'
    }
  ] as Array<{
    id: string
    name: string
    value: RoleEnum
    description: string
  }>
}
