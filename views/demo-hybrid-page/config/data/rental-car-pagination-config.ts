/**
 * Pagination defaults for list queries and PaginationFooter.
 *
 * Affects `page` / `limit` / `all` query behavior on the server and in the footer.
 */

import type { PaginationConfig } from '@/platform/url-kit/filters/feature-pagination/types'

export const rentalCarPaginationConfig: PaginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  allowPageSizeChange: true,
  allowShowAll: true,
  showAllLabel: 'All',
}
