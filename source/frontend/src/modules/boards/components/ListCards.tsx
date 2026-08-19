import CardItem from './Card'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Card } from '../types/board'

interface ListCardsProps {
  cards: Card[]
}

function ListCards({ cards }: ListCardsProps) {
  return (
    <SortableContext
      items={cards?.map(c => c._id)}
      strategy={verticalListSortingStrategy}
    >
      <div className='mx-1 flex min-w-0 flex-col gap-2 overflow-x-hidden px-1 md:mx-1.5 md:px-1.5'>
        {cards.map(card => (
          <CardItem key={card._id} card={card} />
        ))}
      </div>
    </SortableContext>
  )
}

export default ListCards
