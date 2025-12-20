/**
 * 标签管理示例
 * 展示如何使用标签 API 进行各种操作
 */

import { tagApi } from '../src/api/tag';

/**
 * 示例 1: 获取所有标签
 */
async function exampleListAllTags() {
  console.log('示例 1: 获取所有标签');
  
  try {
    const response = await tagApi.list();
    
    console.log(`成功获取 ${response.data.length} 个标签:`);
    response.data.forEach(tag => {
      console.log(`- ${tag.name}: ${tag.description || '无描述'} (${tag.blogCount || 0} 篇博客)`);
    });
  } catch (error) {
    console.error('查询失败:', error);
  }
}

/**
 * 示例 2: 分页查询标签
 */
async function examplePageTags() {
  console.log('\n示例 2: 分页查询标签');
  
  try {
    const response = await tagApi.page({
      current: 1,
      size: 10
    });
    
    console.log('标签列表:');
    console.log(`- 总共 ${response.data.total} 个标签`);
    console.log(`- 当前第 ${response.data.current} 页`);
    console.log(`- 共 ${response.data.pages} 页`);
    response.data.records.forEach(tag => {
      console.log(`\n标签 #${tag.id}:`);
      console.log(`  名称: ${tag.name}`);
      console.log(`  描述: ${tag.description || '无'}`);
      console.log(`  博客数: ${tag.blogCount || 0}`);
    });
  } catch (error) {
    console.error('查询失败:', error);
  }
}

/**
 * 示例 3: 搜索标签
 */
async function exampleSearchTags() {
  console.log('\n示例 3: 搜索标签');
  
  try {
    const response = await tagApi.page({
      current: 1,
      size: 10,
      keyword: '算法'
    });
    
    console.log(`搜索 "算法" 找到 ${response.data.total} 个标签:`);
    response.data.records.forEach(tag => {
      console.log(`- ${tag.name}: ${tag.description || '无描述'}`);
    });
  } catch (error) {
    console.error('搜索失败:', error);
  }
}

/**
 * 示例 4: 获取标签详情
 */
async function exampleGetTag() {
  console.log('\n示例 4: 获取标签详情');
  
  try {
    const response = await tagApi.getById(1);
    
    console.log('标签详情:');
    console.log(`- ID: ${response.data.id}`);
    console.log(`- 名称: ${response.data.name}`);
    console.log(`- 描述: ${response.data.description || '无'}`);
    console.log(`- 博客数量: ${response.data.blogCount || 0}`);
    console.log(`- 创建时间: ${response.data.createTime}`);
  } catch (error) {
    console.error('获取失败:', error);
  }
}

/**
 * 示例 5: 创建标签
 */
async function exampleCreateTag() {
  console.log('\n示例 5: 创建标签');
  
  try {
    const response = await tagApi.create({
      name: '数据结构',
      description: '数据结构相关的博客文章'
    });
    
    console.log(`标签创建成功，ID: ${response.data}`);
  } catch (error) {
    console.error('创建失败:', error);
  }
}

/**
 * 示例 6: 更新标签
 */
async function exampleUpdateTag() {
  console.log('\n示例 6: 更新标签');
  
  try {
    const response = await tagApi.update({
      id: 1,
      name: '算法与数据结构',
      description: '算法和数据结构相关的博客文章'
    });
    
    console.log(`标签更新${response.data ? '成功' : '失败'}`);
  } catch (error) {
    console.error('更新失败:', error);
  }
}

/**
 * 示例 7: 删除标签
 */
async function exampleDeleteTag() {
  console.log('\n示例 7: 删除标签');
  
  try {
    const response = await tagApi.delete(1);
    
    console.log(`标签删除${response.data ? '成功' : '失败'}`);
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/**
 * 示例 8: 标签管理完整流程
 */
async function exampleCompleteTagFlow() {
  console.log('\n示例 8: 标签管理完整流程');
  
  try {
    // 1. 创建多个标签
    console.log('1. 创建标签...');
    const tag1 = await tagApi.create({
      name: '算法',
      description: '算法相关'
    });
    console.log(`   创建标签 "算法"，ID: ${tag1.data}`);
    
    const tag2 = await tagApi.create({
      name: '数据结构',
      description: '数据结构相关'
    });
    console.log(`   创建标签 "数据结构"，ID: ${tag2.data}`);
    
    const tag3 = await tagApi.create({
      name: '学习笔记',
      description: '学习心得和笔记'
    });
    console.log(`   创建标签 "学习笔记"，ID: ${tag3.data}`);
    
    // 2. 查看所有标签
    console.log('\n2. 查看所有标签...');
    const listResponse = await tagApi.list();
    console.log(`   共有 ${listResponse.data.length} 个标签`);
    
    // 3. 更新标签
    console.log('\n3. 更新标签...');
    await tagApi.update({
      id: tag1.data,
      name: '算法基础',
      description: '基础算法相关的文章'
    });
    console.log('   标签更新成功');
    
    // 4. 搜索标签
    console.log('\n4. 搜索标签...');
    const searchResponse = await tagApi.page({
      current: 1,
      size: 10,
      keyword: '算法'
    });
    console.log(`   找到 ${searchResponse.data.total} 个包含 "算法" 的标签`);
    
    console.log('\n完整流程执行成功！');
  } catch (error) {
    console.error('流程执行失败:', error);
  }
}

/**
 * 示例 9: 获取热门标签
 */
async function exampleGetPopularTags() {
  console.log('\n示例 9: 获取热门标签（按博客数量排序）');
  
  try {
    const response = await tagApi.list();
    
    // 按博客数量降序排序
    const sortedTags = response.data
      .filter(tag => tag.blogCount && tag.blogCount > 0)
      .sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0))
      .slice(0, 5);
    
    console.log('前 5 个热门标签:');
    sortedTags.forEach((tag, index) => {
      console.log(`${index + 1}. ${tag.name} - ${tag.blogCount} 篇博客`);
    });
  } catch (error) {
    console.error('查询失败:', error);
  }
}

// 运行所有示例（实际使用时请注释掉不需要的示例）
async function runExamples() {
  await exampleListAllTags();
  await examplePageTags();
  await exampleSearchTags();
  await exampleGetTag();
  // await exampleCreateTag();        // 需要认证
  // await exampleUpdateTag();        // 需要认证
  // await exampleDeleteTag();        // 需要认证
  // await exampleCompleteTagFlow();  // 需要认证
  await exampleGetPopularTags();
}

export {
  exampleListAllTags,
  examplePageTags,
  exampleSearchTags,
  exampleGetTag,
  exampleCreateTag,
  exampleUpdateTag,
  exampleDeleteTag,
  exampleCompleteTagFlow,
  exampleGetPopularTags,
  runExamples,
};
