import {
  Plus,
  MoreHorizontal,
  Scissors,
  Copy,
  Clipboard,
  Trash2,
  Archive
  // GripVertical // Có thể dùng nếu bạn muốn làm icon riêng để kéo cột
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import ListCards from './ListCards'
import AddCardInline from './AddCardInline'
import { mapOrder } from '~/utils/sorts'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Column as ColumnType } from '../types/board'

interface ColumnProps {
  column: ColumnType
}

function Column({ column }: ColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column._id,
    data: { ...column }
  })

  const dndKitColumnStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    // Fix chiều cao: Dùng 100% thay vì h-full để dnd-kit tính toán chính xác hơn
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, '_id')
  const normalizedColumnId = String(column._id || '')
    .trim()
    .toLowerCase()
  const normalizedColumnTitle = String(column.title || '')
    .trim()
    .toLowerCase()
  const isTodoColumn =
    normalizedColumnId === 'todo' || normalizedColumnTitle === 'to do'

  return (
    <div
      ref={setNodeRef}
      style={dndKitColumnStyles}
      {...attributes}
      className='h-full w-[88vw] max-w-sm shrink-0 snap-start md:w-full md:max-w-none md:shrink md:min-w-0' // Wrapper ngoài cùng
    >
      {/* BỎ {...listeners} Ở ĐÂY ĐI. 
        Thêm max-h-full để cột không bao giờ cao vượt quá Container cha.
      */}
      <div className='flex h-full max-h-full min-h-80 w-full min-w-0 flex-col rounded-lg bg-slate-100 dark:bg-slate-800 md:min-h-0'>
        {/* Column Header - Fixed 
            CHUYỂN {...listeners} VÀO ĐÂY: Chỉ khi user nắm vào Header mới cho kéo Cột đi.
        */}
        <div
          {...listeners}
          className='flex h-10 shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2 cursor-grab active:cursor-grabbing dark:border-slate-700 md:h-11'
        >
          <h3 className='text-sm font-bold truncate'>{column.title}</h3>

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0'
                onPointerDown={e => e.stopPropagation()}
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>
                <Plus className='mr-2 h-4 w-4' />
                Add new card
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-red-600'>
                <Trash2 className='mr-2 h-4 w-4' />
                Remove this column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>

        {/* VÙNG CHỨA LIST CARD CẦN PHẢI CUỘN - MAGIC LÀ Ở ĐÂY */}
        {/* flex-1: Chiếm phần diện tích còn lại. min-h-0: Ngăn thẻ div tự phình to. overflow-y-auto: Hiển thị thanh cuộn */}
        <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-1.5 md:p-2'>
          <ListCards cards={orderedCards} />
        </div>

        {isTodoColumn && (
          <div className='shrink-0 border-t border-slate-200 p-1.5 dark:border-slate-700 md:p-2'>
            <AddCardInline columnId={column._id} boardId={column.boardId} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Column
