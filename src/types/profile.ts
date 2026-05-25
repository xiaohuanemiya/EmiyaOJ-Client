/**
 * 个人中心公开用户信息
 */
export interface PublicUserVO {
  id: string
  username: string
  nickname?: string
  avatar?: string | null
  createTime?: string
}

/**
 * 按难度统计的已解决题目数量
 */
export interface DifficultySolvedStatsVO {
  difficulty: number
  difficultyDesc: string
  solvedCount: number
}

/**
 * 个人中心总览
 */
export interface ProfileCenterVO {
  user: PublicUserVO
  solvedCount: number
  totalSubmitCount: number
  acceptedSubmitCount: number
  passRate: number
  difficultyStats: DifficultySolvedStatsVO[]
  blogCount: number
  starCount: number
  likedBlogCount: number
}

/**
 * 已解决题目
 */
export interface SolvedProblemVO {
  problemId: string
  title: string
  difficulty: number
  difficultyDesc: string
  acceptedAt: string
}

/**
 * 已解决题目分页查询参数
 */
export interface SolvedProblemQueryParams {
  pageNum: number
  pageSize: number
  difficulty?: number
}
