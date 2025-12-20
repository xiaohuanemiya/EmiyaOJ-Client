/**
 * 评论管理示例
 * 展示如何使用评论 API 进行各种操作
 */

import { commentApi } from '../src/api/comment';

/**
 * 示例 1: 查询博客的顶级评论
 */
async function exampleListTopComments() {
  console.log('示例 1: 查询博客的顶级评论');
  
  try {
    const response = await commentApi.page({
      blogId: 1,
      current: 1,
      size: 10,
      parentId: 0  // 0 表示顶级评论
    });
    
    console.log('成功获取评论列表:');
    console.log(`- 总共 ${response.data.total} 条评论`);
    console.log(`- 当前第 ${response.data.current} 页`);
    response.data.records.forEach(comment => {
      console.log(`\n评论 #${comment.id} by ${comment.username}:`);
      console.log(`  内容: ${comment.content}`);
      console.log(`  点赞数: ${comment.likeCount}`);
      console.log(`  回复数: ${comment.replyCount}`);
    });
  } catch (error) {
    console.error('查询失败:', error);
  }
}

/**
 * 示例 2: 查询评论的回复
 */
async function exampleListCommentReplies() {
  console.log('\n示例 2: 查询评论的回复');
  
  try {
    const response = await commentApi.page({
      blogId: 1,
      current: 1,
      size: 10,
      parentId: 1  // 查询评论 #1 的回复
    });
    
    console.log(`评论 #1 的回复列表 (共 ${response.data.total} 条):`);
    response.data.records.forEach(comment => {
      console.log(`\n回复 #${comment.id} by ${comment.username}:`);
      console.log(`  内容: ${comment.content}`);
      if (comment.replyToUsername) {
        console.log(`  回复给: @${comment.replyToUsername}`);
      }
      console.log(`  点赞数: ${comment.likeCount}`);
    });
  } catch (error) {
    console.error('查询失败:', error);
  }
}

/**
 * 示例 3: 获取评论详情
 */
async function exampleGetComment() {
  console.log('\n示例 3: 获取评论详情');
  
  try {
    const response = await commentApi.getById(1);
    
    console.log('评论详情:');
    console.log(`- ID: ${response.data.id}`);
    console.log(`- 博客ID: ${response.data.blogId}`);
    console.log(`- 作者: ${response.data.username}`);
    console.log(`- 内容: ${response.data.content}`);
    console.log(`- 点赞数: ${response.data.likeCount}`);
    console.log(`- 回复数: ${response.data.replyCount}`);
    console.log(`- 创建时间: ${response.data.createTime}`);
  } catch (error) {
    console.error('获取失败:', error);
  }
}

/**
 * 示例 4: 创建顶级评论
 */
async function exampleCreateComment() {
  console.log('\n示例 4: 创建顶级评论');
  
  try {
    const response = await commentApi.create({
      blogId: 1,
      content: '写得真好！学到了很多。',
      parentId: 0  // 0 表示顶级评论
    });
    
    console.log(`评论创建成功，ID: ${response.data}`);
  } catch (error) {
    console.error('创建失败:', error);
  }
}

/**
 * 示例 5: 回复评论
 */
async function exampleReplyToComment() {
  console.log('\n示例 5: 回复评论');
  
  try {
    const response = await commentApi.create({
      blogId: 1,
      content: '我也这么认为！',
      parentId: 1,        // 父评论ID
      replyToUserId: 2    // 回复的目标用户ID
    });
    
    console.log(`回复创建成功，ID: ${response.data}`);
  } catch (error) {
    console.error('回复失败:', error);
  }
}

/**
 * 示例 6: 点赞评论
 */
async function exampleLikeComment() {
  console.log('\n示例 6: 点赞评论');
  
  try {
    const response = await commentApi.like(1);
    
    console.log(`点赞${response.data.liked ? '成功' : '已取消'}`);
    console.log(`当前点赞数: ${response.data.likeCount}`);
  } catch (error) {
    console.error('点赞失败:', error);
  }
}

/**
 * 示例 7: 删除评论
 */
async function exampleDeleteComment() {
  console.log('\n示例 7: 删除评论');
  
  try {
    const response = await commentApi.delete(1);
    
    console.log(`评论删除${response.data ? '成功' : '失败'}`);
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/**
 * 示例 8: 完整的评论交互流程
 */
async function exampleCompleteCommentFlow() {
  console.log('\n示例 8: 完整的评论交互流程');
  
  try {
    // 1. 创建一条顶级评论
    console.log('1. 创建顶级评论...');
    const commentResponse = await commentApi.create({
      blogId: 1,
      content: '这篇文章写得太好了！',
      parentId: 0
    });
    const commentId = commentResponse.data;
    console.log(`   创建成功，ID: ${commentId}`);
    
    // 2. 对评论点赞
    console.log('2. 对评论点赞...');
    const likeResponse = await commentApi.like(commentId);
    console.log(`   点赞成功，当前 ${likeResponse.data.likeCount} 个赞`);
    
    // 3. 创建回复
    console.log('3. 回复评论...');
    const replyResponse = await commentApi.create({
      blogId: 1,
      content: '同意！',
      parentId: commentId,
      replyToUserId: 1
    });
    console.log(`   回复成功，ID: ${replyResponse.data}`);
    
    // 4. 查看评论详情
    console.log('4. 查看评论详情...');
    const detailResponse = await commentApi.getById(commentId);
    console.log(`   评论内容: ${detailResponse.data.content}`);
    console.log(`   点赞数: ${detailResponse.data.likeCount}`);
    console.log(`   回复数: ${detailResponse.data.replyCount}`);
    
    console.log('\n完整流程执行成功！');
  } catch (error) {
    console.error('流程执行失败:', error);
  }
}

// 运行所有示例（实际使用时请注释掉不需要的示例）
async function runExamples() {
  await exampleListTopComments();
  await exampleListCommentReplies();
  await exampleGetComment();
  // await exampleCreateComment();      // 需要认证
  // await exampleReplyToComment();     // 需要认证
  // await exampleLikeComment();        // 需要认证
  // await exampleDeleteComment();      // 需要认证
  // await exampleCompleteCommentFlow(); // 需要认证
}

// 如果直接运行此文件
if (require.main === module) {
  runExamples().catch(console.error);
}

export {
  exampleListTopComments,
  exampleListCommentReplies,
  exampleGetComment,
  exampleCreateComment,
  exampleReplyToComment,
  exampleLikeComment,
  exampleDeleteComment,
  exampleCompleteCommentFlow,
};
