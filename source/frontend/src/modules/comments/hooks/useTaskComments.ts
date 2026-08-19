import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTaskCommentAPI,
  deleteTaskCommentAPI,
  getTaskCommentsAPI,
  updateTaskCommentAPI,
  uploadImageAPI,
  type TaskCommentDto
} from '../api/comment.api'

export const taskCommentKeys = {
  all: ['task-comments'] as const,
  list: (taskId: number) => [...taskCommentKeys.all, taskId, 'list'] as const
}

export const useGetTaskComments = (taskId: number) => {
  return useQuery({
    queryKey: taskCommentKeys.list(taskId),
    queryFn: () => getTaskCommentsAPI(taskId),
    enabled: Number.isFinite(taskId) && taskId > 0
  })
}

export const useTaskComments = (taskId: number) => {
  const queryClient = useQueryClient()

  const commentListKey = taskCommentKeys.list(taskId)

  const appendReplyToParent = (
    comments: TaskCommentDto[],
    parentCommentId: number,
    reply: TaskCommentDto
  ): { nextComments: TaskCommentDto[]; found: boolean } => {
    let parentFound = false

    const next = comments.map(comment => {
      if (comment.id === parentCommentId) {
        parentFound = true
        const existingReplies = Array.isArray(comment.replies)
          ? comment.replies
          : []

        if (existingReplies.some(item => item.id === reply.id)) {
          return comment
        }

        return {
          ...comment,
          replies: [...existingReplies, reply]
        }
      }

      if (!Array.isArray(comment.replies) || comment.replies.length === 0) {
        return comment
      }

      const nested = appendReplyToParent(
        comment.replies,
        parentCommentId,
        reply
      )

      if (!nested.found) {
        return comment
      }

      parentFound = true

      return {
        ...comment,
        replies: nested.nextComments
      }
    })

    return {
      nextComments: parentFound ? next : comments,
      found: parentFound
    }
  }

  const updateCommentInTree = (
    comments: TaskCommentDto[],
    input: {
      commentId: number
      content: string
    }
  ): { nextComments: TaskCommentDto[]; found: boolean } => {
    let found = false

    const next = comments.map(comment => {
      if (comment.id === input.commentId) {
        found = true
        return {
          ...comment,
          content: input.content,
          updatedAt: new Date().toISOString(),
          isEdited: true
        }
      }

      if (!Array.isArray(comment.replies) || comment.replies.length === 0) {
        return comment
      }

      const nested = updateCommentInTree(comment.replies, input)

      if (!nested.found) {
        return comment
      }

      found = true
      return {
        ...comment,
        replies: nested.nextComments
      }
    })

    return {
      nextComments: found ? next : comments,
      found
    }
  }

  const removeCommentFromTree = (
    comments: TaskCommentDto[],
    commentId: number
  ): { nextComments: TaskCommentDto[]; found: boolean } => {
    let found = false

    const next = comments
      .filter(comment => {
        if (comment.id === commentId) {
          found = true
          return false
        }

        return true
      })
      .map(comment => {
        if (!Array.isArray(comment.replies) || comment.replies.length === 0) {
          return comment
        }

        const nested = removeCommentFromTree(comment.replies, commentId)

        if (!nested.found) {
          return comment
        }

        found = true
        return {
          ...comment,
          replies: nested.nextComments
        }
      })

    return {
      nextComments: found ? next : comments,
      found
    }
  }

  const createCommentMutation = useMutation({
    mutationFn: ({
      content,
      parentCommentId
    }: {
      content: string
      parentCommentId?: number
    }) => createTaskCommentAPI({ taskId, content, parentCommentId }),
    onSuccess: (createdComment, variables) => {
      queryClient.setQueryData(
        commentListKey,
        (oldData: TaskCommentDto[] | undefined) => {
          if (!Array.isArray(oldData)) return [createdComment]

          const parentCommentId =
            typeof variables.parentCommentId === 'number' &&
            variables.parentCommentId > 0
              ? variables.parentCommentId
              : undefined

          if (parentCommentId) {
            const appended = appendReplyToParent(
              oldData,
              parentCommentId,
              createdComment
            )

            if (appended.found) {
              return appended.nextComments
            }

            return oldData
          }

          return [createdComment, ...oldData]
        }
      )

      if (
        typeof variables.parentCommentId === 'number' &&
        variables.parentCommentId > 0
      ) {
        queryClient.invalidateQueries({ queryKey: commentListKey })
      }
    }
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content
    }: {
      commentId: number
      content: string
    }) => updateTaskCommentAPI(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentListKey })
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteTaskCommentAPI(commentId),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData(
        commentListKey,
        (oldData: TaskCommentDto[] | undefined) => {
          if (!Array.isArray(oldData)) return oldData

          const removed = removeCommentFromTree(oldData, commentId)
          return removed.found ? removed.nextComments : oldData
        }
      )
    }
  })

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => uploadImageAPI(file)
  })

  const createCommentWithImage = async ({
    text,
    file,
    parentCommentId
  }: {
    text: string
    file?: File | null
    parentCommentId?: number
  }) => {
    const trimmedText = text.trim()
    let composedContent = trimmedText

    if (file) {
      const uploadedUrl = await uploadImageMutation.mutateAsync(file)
      const markdownImage = `![image](${uploadedUrl})`
      composedContent = trimmedText
        ? `${trimmedText}\n\n${markdownImage}`
        : markdownImage
    }

    if (!composedContent.trim()) {
      throw new Error('Nội dung bình luận không được để trống')
    }

    await createCommentMutation.mutateAsync({
      content: composedContent,
      parentCommentId
    })
  }

  return {
    createComment: createCommentMutation.mutateAsync,
    createCommentWithImage,
    updateComment: updateCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    uploadImage: uploadImageMutation.mutateAsync,
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isUploadingImage: uploadImageMutation.isPending
  }
}
