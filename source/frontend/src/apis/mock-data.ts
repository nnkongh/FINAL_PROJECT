import type { Board } from '~/modules/boards/types/board'

export const mockData: { board: Board } = {
  board: {
    _id: 'board-id-01',
    title: 'MinhTri94 MERN Stack Board',
    description: 'Pro MERN stack Course',
    type: 'public', // 'private'
    ownerIds: [], // Những users là Admin của board
    memberIds: [], // Những users là member bình thường của board
    columnOrderIds: [
      'column-id-01',
      'column-id-02',
      'column-id-03',
      'column-id-04'
    ], // Thứ tự sắp xếp / vị trí của các Columns trong 1 boards
    columns: [
      {
        _id: 'column-id-01',
        boardId: 'board-id-01',
        title: 'To Do Column 01',
        cardOrderIds: [
          'card-id-01',
          'card-id-02',
          'card-id-03',
          'card-id-04',
          'card-id-05',
          'card-id-06',
          'card-id-07'
        ],
        cards: [
          {
            _id: 'card-id-01',
            boardId: 'board-id-01',
            columnId: 'column-id-01',
            title: 'Define technical requirements for the feature release',
            description:
              'Need to document all technical requirements including API endpoints, database schema, and infrastructure needs.',
            priority: 'high',
            assignee: 'Minh Tri',
            reporter: 'John Doe',
            dueDate: '2026-03-06',
            createdAt: '2026-03-01',
            updatedAt: '2026-03-05',
            memberIds: ['test-user-id-01'],
            comments: [
              'Need to review API design',
              'Database schema looks good'
            ],
            attachments: ['tech-spec.pdf', 'api-design.json']
          },
          {
            _id: 'card-id-02',
            boardId: 'board-id-01',
            columnId: 'column-id-01',
            title: 'Setup CI/CD pipeline for production',
            description:
              'Configure GitHub Actions for automated testing and deployment',
            priority: 'high',
            assignee: 'Sarah Johnson',
            reporter: 'Minh Tri',
            dueDate: '2026-03-10',
            createdAt: '2026-03-02',
            memberIds: [],
            comments: ['Working on Docker configuration'],
            attachments: []
          },
          {
            _id: 'card-id-03',
            boardId: 'board-id-01',
            columnId: 'column-id-01',
            title: 'Design user authentication flow',
            description: null,
            priority: 'medium',
            assignee: 'Alex Chen',
            dueDate: '2026-03-15',
            createdAt: '2026-03-03',
            memberIds: [],
            comments: [],
            attachments: []
          },
          {
            _id: 'card-id-04',
            boardId: 'board-id-01',
            columnId: 'column-id-01',
            title: 'Write unit tests for API endpoints',
            description: null,
            priority: 'low',
            assignee: null,
            dueDate: '2026-03-20',
            createdAt: '2026-03-04',
            memberIds: [],
            comments: [],
            attachments: []
          },
          {
            _id: 'card-id-05',
            boardId: 'board-id-01',
            columnId: 'column-id-01',
            title: 'Refactor database queries for performance',
            description: 'Optimize slow queries and add proper indexes',
            priority: 'medium',
            assignee: 'David Lee',
            dueDate: '2026-03-12',
            createdAt: '2026-03-05',
            memberIds: [],
            comments: [],
            attachments: []
          },
          {
            _id: 'card-id-06',
            boardId: 'board-id-01',
            columnId: 'column-id-01',
            title: 'Update documentation for API v2',
            description: null,
            priority: 'low',
            assignee: 'Emma Wilson',
            dueDate: '2026-03-25',
            createdAt: '2026-03-06',
            memberIds: [],
            comments: [],
            attachments: ['api-docs-v2.md']
          },
          {
            _id: 'card-id-07',
            boardId: 'board-id-01',
            columnId: 'column-id-01',
            title: 'Investigate production bug #2341',
            description: 'Users reporting timeout errors on checkout page',
            priority: 'high',
            assignee: 'Minh Tri',
            dueDate: '2026-03-07',
            createdAt: '2026-03-06',
            memberIds: [],
            comments: [],
            attachments: []
          }
        ]
      },
      {
        _id: 'column-id-02',
        boardId: 'board-id-01',
        title: 'Inprogress Column 02',
        cardOrderIds: ['card-id-08', 'card-id-09', 'card-id-10'],
        cards: [
          {
            _id: 'card-id-08',
            boardId: 'board-id-01',
            columnId: 'column-id-02',
            title: 'Title of card 08',
            description: null,
            memberIds: [],
            comments: [],
            attachments: []
          },
          {
            _id: 'card-id-09',
            boardId: 'board-id-01',
            columnId: 'column-id-02',
            title: 'Title of card 09',
            description: null,
            memberIds: [],
            comments: [],
            attachments: []
          },
          {
            _id: 'card-id-10',
            boardId: 'board-id-01',
            columnId: 'column-id-02',
            title: 'Title of card 10',
            description: null,
            memberIds: [],
            comments: [],
            attachments: []
          }
        ]
      },
      {
        _id: 'column-id-03',
        boardId: 'board-id-01',
        title: 'Done Column 03',
        cardOrderIds: ['card-id-11', 'card-id-12', 'card-id-13'],
        cards: [
          {
            _id: 'card-id-11',
            boardId: 'board-id-01',
            columnId: 'column-id-03',
            title: 'Title of card 11',
            description: null,
            memberIds: [],
            comments: [],
            attachments: []
          },
          {
            _id: 'card-id-12',
            boardId: 'board-id-01',
            columnId: 'column-id-03',
            title: 'Title of card 12',
            description: null,
            memberIds: [],
            comments: [],
            attachments: []
          },
          {
            _id: 'card-id-13',
            boardId: 'board-id-01',
            columnId: 'column-id-03',
            title: 'Title of card 13',
            description: null,
            memberIds: [],
            comments: [],
            attachments: []
          }
        ]
      },
      {
        _id: 'column-id-04',
        boardId: 'board-id-01',
        title: 'Empty Column 04',

        cardOrderIds: ['column-id-04-placeholder-card'],
        cards: [
          {
            _id: 'column-id-04-placeholder-card',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            FE_PlaceholderCard: true
          }
        ]
      }
    ]
  }
}
