
1. locked view when navigating params and filtering - fixed by useTransition wrapper

2. fetching both filters and data on higher level and passing down.
this just disabled streaming

cached the data in data-fetch wrapper functions with keys to enable url caching

3. but the drawer is still causing the caching not to be used.
so removed the UI from param moved to cache to not cause new urls to be cached
example
page=1&drawer=car&mode=view&id=car-3
is considered as a new cache entry
when it should just be 
page=1

ui/demo-rsc-search-params-cache-key.ts