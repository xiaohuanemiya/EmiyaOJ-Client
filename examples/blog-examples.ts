/**
 * 博客管理示例
 * 展示如何使用博客 API 进行各种操作
 */

import { blogApi } from '../src/api/blog';

/**
 * 示例 1: 查询博客列表
 */
async function exampleListBlogs() {
  console.log('示例 1: 查询博客列表');
  
  try {
    const response = await blogApi.page({
      current: 1,
      size: 10,
      keyword: '算法'
    });
    
    console.log('成功获取博客列表:');
    console.log(`- 总共 ${response.data.total} 篇博客`);
    console.log(`- 当前第 ${response.data.current} 页`);
    console.log(`- 共 ${response.data.pages} 页`);
    console.log('博客列表:', response.data.records);
  } catch (error) {
    console.error('查询失败:', error);
  }
}

/**
 * 示例 2: 获取博客详情
 */
async function exampleGetBlog() {
  console.log('\n示例 2: 获取博客详情');
  
  try {
    const response = await blogApi.getById(1);
    
    console.log('博客详情:');
    console.log(`- ID: ${response.data.id}`);
    console.log(`- 标题: ${response.data.title}`);
    console.log(`- 作者: ${response.data.username}`);
    console.log(`- 浏览量: ${response.data.viewCount}`);
    console.log(`- 点赞数: ${response.data.likeCount}`);
    console.log(`- 评论数: ${response.data.commentCount}`);
    console.log(`- 标签:`, response.data.tags.map(t => t.name).join(', '));
    console.log(`- 内容预览: ${response.data.content.substring(0, 100)}...`);
  } catch (error) {
    console.error('获取失败:', error);
  }
}

/**
 * 示例 3: 创建博客
 */
async function exampleCreateBlog() {
  console.log('\n示例 3: 创建博客');
  
  try {
    const response = await blogApi.create({
      title: '如何学习算法',
      content: `# 算法学习指南

## 为什么要学习算法？

算法是计算机科学的核心，也是编程的基础。

## 学习路线

1. 基础数据结构
2. 常见算法
3. 刷题练习

## 推荐资源

- LeetCode
- 算法导论
`,
      tagIds: [1, 2]
    });
    
    console.log(`博客创建成功，ID: ${response.data}`);
  } catch (error) {
    console.error('创建失败:', error);
  }
}

/**
 * 示例 4: 更新博客
 */
async function exampleUpdateBlog() {
  console.log('\n示例 4: 更新博客');
  
  try {
    const response = await blogApi.update({
      id: 1,
      title: '如何学习算法（更新版）',
      content: '更新后的内容...',
      tagIds: [1, 2, 3]
    });
    
    console.log(`博客更新${response.data ? '成功' : '失败'}`);
  } catch (error) {
    console.error('更新失败:', error);
  }
}

/**
 * 示例 5: 点赞博客
 */
async function exampleLikeBlog() {
  console.log('\n示例 5: 点赞博客');
  
  try {
    const response = await blogApi.like(1);
    
    console.log(`点赞${response.data.liked ? '成功' : '已取消'}`);
    console.log(`当前点赞数: ${response.data.likeCount}`);
  } catch (error) {
    console.error('点赞失败:', error);
  }
}

/**
 * 示例 6: 删除博客
 */
async function exampleDeleteBlog() {
  console.log('\n示例 6: 删除博客');
  
  try {
    const response = await blogApi.delete(1);
    
    console.log(`博客删除${response.data ? '成功' : '失败'}`);
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/**
 * 示例 7: 按标签查询博客
 */
async function exampleListBlogsByTag() {
  console.log('\n示例 7: 按标签查询博客');
  
  try {
    const response = await blogApi.page({
      current: 1,
      size: 10,
      tagId: 1
    });
    
    console.log(`找到 ${response.data.total} 篇带有该标签的博客`);
    console.log('博客列表:', response.data.records);
  } catch (error) {
    console.error('查询失败:', error);
  }
}

/**
 * 示例 8: 查询用户的博客
 */
async function exampleListUserBlogs() {
  console.log('\n示例 8: 查询用户的博客');
  
  try {
    const response = await blogApi.page({
      current: 1,
      size: 10,
      userId: 1
    });
    
    console.log(`该用户共发布了 ${response.data.total} 篇博客`);
    console.log('博客列表:', response.data.records);
  } catch (error) {
    console.error('查询失败:', error);
  }
}

// 运行所有示例（实际使用时请注释掉不需要的示例）
async function runExamples() {
  await exampleListBlogs();
  await exampleGetBlog();
  // await exampleCreateBlog();  // 需要认证
  // await exampleUpdateBlog();  // 需要认证
  // await exampleLikeBlog();    // 需要认证
  // await exampleDeleteBlog();  // 需要认证
  await exampleListBlogsByTag();
  await exampleListUserBlogs();
}

// 如果直接运行此文件
if (require.main === module) {
  runExamples().catch(console.error);
}

export {
  exampleListBlogs,
  exampleGetBlog,
  exampleCreateBlog,
  exampleUpdateBlog,
  exampleLikeBlog,
  exampleDeleteBlog,
  exampleListBlogsByTag,
  exampleListUserBlogs,
};
