/**
 * features/ui/drawer barrel
 *
 * Purpose: Single import surface for the generic drawer param system
 * Used in: Entity drawer managers, confirm system, page-level wiring
 */

export {
  DRAWER_PARAM,
  MODE_PARAM,
  ID_PARAM,
  ACTION_PARAM,
  type DrawerMode,
  type DrawerAction,
  type DrawerParams,
  type DrawerParamsPatch,
} from './drawer.types'

export { useDrawerParams } from './useDrawerParams'
