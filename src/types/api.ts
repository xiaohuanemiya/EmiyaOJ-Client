// types/api.ts - API 接口类型定义

/** 通用响应结构 */
export interface ResponseResult<T = any> {
  code: number;
  msg: string;
  data: T;
}

/** 分页请求参数 */
export interface PageDTO {
  pageNo: number;
  pageSize: number;
  sortBy?: string;
  isAsc?: boolean;
}

/** 分页响应数据 */
export interface PageVO<T> {
  total: number;
  pages: number;
  list: T[];
}

/** 用户登录请求 */
export interface UserLoginDTO {
  username: string;
  password: string;
}

/** 用户登录响应 */
export interface UserLoginVO {
  id: string;
  username: string;
  name: string;
  token: string;
}

/** JWT 载荷结构 */
export interface JwtPayload {
  userLogin: string;  // JSON字符串，包含用户详细信息
  exp: number;        // Token 过期时间戳
}

/** userLogin 解析后的结构 */
export interface UserLoginInfo {
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  enabled: boolean;
  password: string;
  permissions: string[];  // 权限列表
  user: {
    createTime: string;
    deleted: number;
    id: number;
    nickname: string;
    password: string;
    status: number;
    updateTime: string;
    username: string;
  };
  username: string;
}

/** 题目信息 */
export interface ProblemVO {
  id: number;
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  sampleInput: string;
  sampleOutput: string;
  hint: string;
  difficulty: 1 | 2 | 3;
  timeLimit: number;
  memoryLimit: number;
  acceptCount: number;
  submitCount: number;
  createTime: string;
}

/** 题目查询参数 */
export interface ProblemQueryDTO extends PageDTO {
  difficulty?: number;
  status?: number;
  keyword?: string;
}

/** 提交代码请求 */
export interface SubmitCodeDTO {
  problemId: number;
  languageId: number;
  code: string;
}

/** 判题状态 */
export type SubmissionStatus = 
  | 'Pending'
  | 'Running'
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compile Error'
  | 'System Error';

/** 提交记录 */
export interface SubmissionVO {
  id: number;
  problemId: number;
  problemTitle: string;
  userId: number;
  username: string;
  languageId: number;
  languageName: string;
  status: SubmissionStatus;
  score: number;
  timeUsed: number;
  memoryUsed: number;
  passRate: string;
  createTime: string;
}

/** 提交记录查询参数 */
export interface SubmissionQueryDTO extends PageDTO {
  problemId?: number;
  userId?: number;
}

/** 编程语言 */
export interface Language {
  id: number;
  name: string;
  version: string;
  compileCommand: string;
  executeCommand: string;
  sourceFileExt: string;
  executableExt: string;
  isCompiled: 0 | 1;
  timeLimitMultiplier: number;
  memoryLimitMultiplier: number;
  status: 0 | 1;
  createTime: string;
  updateTime: string;
}
