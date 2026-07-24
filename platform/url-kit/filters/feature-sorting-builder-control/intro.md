//////////////////////
// Sort

we will add a new type of sort control.
this filter will be a button + dropdown
the dropdown allows:

view all keys in a list
select key:
- params updated with key asc showing A -> Z
- row added above list items, list items do not have this key.

// Row
[ Key change V ] [ Dircetion change A->Z or Z->A V] [ X ] { up/down }

- two dropdowns
- change key and thus change params
- change dirction choose ascending or descending, and thus change params
- x to remove
- order sort, we can make a chevron up and down to move places.


the functionalities we need:
- the main component detects from params the sorts available to render
the needed rows, remove from list etc
automatic

- auto apply on row dropdowns change
- auto apply on item add
- writing the params, re-writes the whole sort line
because when ordering sorts we're liekly changing the whole order of the line


