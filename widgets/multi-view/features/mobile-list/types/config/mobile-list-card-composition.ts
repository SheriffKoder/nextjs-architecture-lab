/**
 * Card composition: which field keys appear where, and in what order.
 *
 * Arrays define membership + order. Field defs own formatting / renderers.
 */

export interface MobileListCardComposition {
  /** Header line fields, left → right, joined with ` · ` */
  primary: string[]
  /** Muted meta line fields, left → right, joined with ` · ` */
  secondary: string[]
  /** Right column badges, stacked top → bottom */
  badges: string[]
}
