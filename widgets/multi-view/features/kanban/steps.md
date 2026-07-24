ok within the @kanban-container.tsx i want to display a grid having drag and drop in x and y directions like in grid-practice development page. 

- our columns count will be determined via the columnKey. 
- no column headers, column headers described in section below
- the min row count will be determined via the minCards prop
- leave maxCards prop unused for now
- we will need a draggableItemWrapper component that will contain a defaultCard component which receive each item's data, and display cardTitle+cardKey then cardContent
- allow to send to the kanban container a template (component) to render if provided instead of internal draggable card jsx. this template component will have the item's/card's data to use as a prop

<draggableItemWrapper>
    {cardTemplate? (
    <defaultCard itemData={}>
    :
    <cardTemplate/> 
    )}
<draggableItemWrapper>


// Data handling
- we will store the data in a rawData state inside the kanban container on load.
- we will have another state that updates depending on rawData, this will contain the mapped items with metadata_position that will be passed to the grid.
- on drop we update the item's column key (e.g status) in the rawData which will in return update the mappedData


// key mapping for drag and drop mapping and optimistic updates
- each column will have a key of its name
- each row will also have a key index 0,1,2,3 etc..
- no grid span or resize

- so for example a droppable cell will have "todo-1" << this is 2nd row in todo
- map over each data item to provide it with metadata_position to give it a position (mappedData state)
- load cards in columns depending on their order in the passed data if columnSortKey is not provided . 

// debugging
- console the key of droppable cells and draggable cards when clicked

// file structure under the page's folder of development/kanban/..
- any drag and drop will be under components/dnd hooks/dnd, utils/dnd, context/dnd etc.
- other files under hooks, utils, components etc. normally

// Column headers
- above the kanban grid, we will have a 1 row grid of each column's unique name/status etc.
- each header cell will contain name + a chevron up/down icon on the right
- this chevron icons will sort the data in the column in the grid. (update the mappedData)
- we can pass a column template component also

columnSortable={true}
columnSortDirection="asc" // default sort direction
columnSortKey="created_at" // key to sort by


// column rendering
in page.tsx the kanban-container will wrap the header grid like this
where we can use a map over data to find unique text and keys instead of writing manually like this:
<KanbanComponent>
  <ColumnDirective>
    <ColumnDirective headerText="" keyField=""> // text and data field of status -- this can be a map
    <ColumnDirective headerText="" keyField=""> // text and data field of status -- this can be a map
  </ColumnDirective>
</KanbanComponent>

// Crud operations.
- pass to the kanban-container a onEdit, onDelete, onClick functions, these will be consoles for now passed from the page. 


// Drag and drop
- when dragging a card, reserve its place but show only dashed border
- when hover the dragged card on a droppable cell, add space with only dashed border, if hoeverd away and no drop on this cell remove virtual place.
this means you will propbably need to add a virtual item and re-order the mappedData state until drop ends to know final position

// provide me with template components to try also