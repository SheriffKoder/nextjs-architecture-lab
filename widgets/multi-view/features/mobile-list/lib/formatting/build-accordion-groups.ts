/**
 * Build ordered accordion groups for the single in-card “Show more”.
 * Fields already on the card surface (primary / secondary / badges) are excluded.
 */

import type {
  MobileListAccordionGroup,
  MobileListCardComposition,
  MobileListFieldDef,
} from '../../types'

export interface AccordionGroupBlock<T> {
  id: string
  label: string
  fields: MobileListFieldDef<T>[]
}

export function buildAccordionGroups<T>(
  fields: MobileListFieldDef<T>[],
  composition: MobileListCardComposition,
  accordionGroups?: MobileListAccordionGroup[]
): AccordionGroupBlock<T>[] {
  const surfaceKeys = new Set([
    ...composition.primary,
    ...composition.secondary,
    ...composition.badges,
  ])

  const byGroup = new Map<string, MobileListFieldDef<T>[]>()
  for (const field of fields) {
    if (!field.groupId) continue
    if (surfaceKeys.has(field.key)) continue
    const list = byGroup.get(field.groupId) ?? []
    list.push(field)
    byGroup.set(field.groupId, list)
  }

  if (byGroup.size === 0) return []

  const labelById = new Map(
    (accordionGroups ?? []).map((g) => [g.id, g.label] as const)
  )

  if (accordionGroups?.length) {
    const blocks: AccordionGroupBlock<T>[] = []
    for (const group of accordionGroups) {
      const groupFields = byGroup.get(group.id)
      if (!groupFields?.length) continue
      blocks.push({
        id: group.id,
        label: group.label,
        fields: groupFields,
      })
      byGroup.delete(group.id)
    }
    // Any leftover groupIds not listed in accordionGroups
    for (const [id, groupFields] of byGroup) {
      blocks.push({
        id,
        label: labelById.get(id) ?? id,
        fields: groupFields,
      })
    }
    return blocks
  }

  return Array.from(byGroup.entries()).map(([id, groupFields]) => ({
    id,
    label: id,
    fields: groupFields,
  }))
}
