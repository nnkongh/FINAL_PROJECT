import ColumnItem from './Column'
import {
  SortableContext,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable'
import type { Column } from '../types/board'

interface ListColumnProps {
  columns: Column[]
}

function ListColumn({ columns }: ListColumnProps) {
  return (
    <SortableContext
      items={columns?.map(c => c._id)}
      strategy={horizontalListSortingStrategy}
    >
      <div className='flex w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible lg:grid-cols-4'>
        {columns?.map(column => (
          <ColumnItem key={column._id} column={column} />
        ))}
      </div>
    </SortableContext>
  )
}

export default ListColumn
