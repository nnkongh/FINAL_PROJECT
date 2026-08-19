import { GitBranch } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useGroupContribution } from '@/modules/groups/hooks/useGroupContribution'

const ContributionTable = () => {
  const { id, groupId } = useParams<{ id?: string; groupId?: string }>()
  const resolvedGroupId = groupId || id
  const { data, isLoading, isError, error } =
    useGroupContribution(resolvedGroupId)

  const rows = Array.isArray(data?.value) ? data.value : []

  if (!resolvedGroupId) {
    return (
      <div className='rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700'>
        Không tìm thấy mã nhóm để tải thống kê.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='animate-pulse rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600'>
        Đang tải dữ liệu...
      </div>
    )
  }

  if (isError) {
    // Extract backend message from axios error response
    const backendMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ??
      (error as Error)?.message ??
      ''

    const isNotLinked =
      backendMessage.toLowerCase().includes('chưa liên kết') ||
      backendMessage.toLowerCase().includes('repo') ||
      (error as { response?: { status?: number } })?.response?.status === 400

    if (isNotLinked) {
      return (
        <div className='flex flex-col items-center gap-3 rounded-md border border-slate-200 bg-slate-50 py-10 text-center'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-slate-100'>
            <GitBranch className='h-6 w-6 text-slate-400' />
          </div>
          <div>
            <p className='text-sm font-medium text-slate-700'>
              Nhóm chưa liên kết GitHub Repository
            </p>
            <p className='mt-1 text-xs text-slate-500'>
              Vào <span className='font-medium'>Cài đặt</span> để liên kết repo
              và theo dõi đóng góp của thành viên.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600'>
        {backendMessage || 'Không thể tải dữ liệu đóng góp'}
      </div>
    )
  }

  return (
    <div className='w-full overflow-x-auto rounded-md border border-slate-200'>
      <table className='min-w-160 md:min-w-full divide-y divide-slate-200 text-sm'>
        <thead className='bg-slate-100'>
          <tr>
            <th className='px-4 py-3 text-left font-semibold text-slate-700'>
              Thành viên
            </th>
            <th className='px-4 py-3 text-left font-semibold text-slate-700'>
              Tài khoản GitHub
            </th>
            <th className='px-4 py-3 text-center font-semibold text-slate-700'>
              Số Commits
            </th>
            <th className='px-4 py-3 text-center font-semibold text-slate-700'>
              Tổng mức độ đóng góp
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-200 bg-white'>
          {rows.length > 0 ? (
            rows.map((item, index) => (
              <tr key={`${item.userName}-${index}`}>
                <td className='px-4 py-3 text-slate-800'>{item.userName}</td>
                <td className='px-4 py-3'>
                  {item.githubUserName ? (
                    <a
                      href={`https://github.com/${item.githubUserName}`}
                      target='_blank'
                      rel='noreferrer'
                      className='text-blue-600 hover:underline'
                    >
                      {item.githubUserName}
                    </a>
                  ) : (
                    <span className='inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600'>
                      Chưa liên kết
                    </span>
                  )}
                </td>
                <td className='px-4 py-3 text-center text-slate-800'>
                  {item.totalCommit}
                </td>
                <td className='px-4 py-3 text-center text-slate-800'>
                  {item.totalContribution}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className='px-4 py-6 text-center text-slate-500'>
                Chưa có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ContributionTable
