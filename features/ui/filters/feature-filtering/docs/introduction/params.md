1️⃣ Core Rule: One Param per Filter Key
Flat params are better.

/tasks?status=open
/tasks?status=open&assignee=12

2️⃣ Multi-Select Filters
Use comma-separated values.
/tasks?status=open,in-progress&assignee=12,18

Backend parsing becomes trivial:
const statuses = searchParams.status?.split(',') ?? []

3️⃣ Date Range Filters
Use underscore separation.

/tasks?startDate=2025-01-01_2025-01-31
const [start, end] = searchParams.startDate?.split('_') ?? []

4️⃣ Number Range Filters
Same pattern as dates.
?amount=100_500
const [min, max] = searchParams.amount?.split('_')

5️⃣ Text Search
?q=invoice
/tasks?q=server%20migration

6️⃣ Pagination & Sorting
?page=2
&limit=50
&sort=createdAt
&order=desc

/tasks?status=open,in-progress&assignee=12&page=2&sort=createdAt&order=desc


8️⃣ How the Server Parses This

Your backend can have a generic filter parser.

Example idea:

function parseFilters(searchParams) {
  return {
    status: searchParams.status?.split(',') ?? [],
    assignee: searchParams.assignee?.split(',') ?? [],
    startDate: parseRange(searchParams.startDate),
    amount: parseRange(searchParams.amount),
    page: Number(searchParams.page ?? 1),
  }
}


9️⃣ Important UX Rule
When updating filters:
Use: router.replace()
NOT: router.push()
Because filters change frequently and you don’t want to pollute browser history.

//////// 
Filter component.

🔟 Your Reusable Filter Component Will Work Like This

Each filter component receives:
key
type
options
isMultiSelect

Example:
<Filter
  label="Status"
  paramKey="status"
  type="multi"
  options={statusOptions}
/>

When selecting values:
?status=open,in-progress
The component only updates its own paramKey and preserves others.

1️⃣2️⃣ Final Recommended URL Schema
/resource?
status=open,in-progress
&assignee=12,15
&startDate=2025-01-01_2025-01-31
&amount=100_500
&q=searchTerm
&page=2
&sort=createdAt
&order=desc

Flat.
Readable.
Scalable.

Advanced Tip
When your app grows, consider namespacing filters:
/tasks?f.status=open&f.assignee=12
But this is only needed when URLs become very large.
