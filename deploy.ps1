# 环境变量配置
$IMAGE_NAME = "emiyaoj-client-panel"
$CONTAINER_NAME = "emiyaoj-client-panel"
$PORT = 23001

Write-Host "🚀 开始构建 Docker 镜像: ${IMAGE_NAME}..." -ForegroundColor Cyan
docker build -t $IMAGE_NAME .

# 检查是否存在同名且正在运行的旧容器，如果有则停止并删除
$existingContainer = docker ps -aq -f name=$CONTAINER_NAME
if ($existingContainer) {
    Write-Host "⚠️ 发现旧容器 ${CONTAINER_NAME}，正在停止并移除..." -ForegroundColor Yellow
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
}

Write-Host "🟢 启动新容器并加入 emiyaoj-network 网络..." -ForegroundColor Green
# 运行容器：添加了 --network emiyaoj-network
docker run -d --name $CONTAINER_NAME `
    --network emiyaoj-cloud_emiyaoj-network `
    --restart unless-stopped `
    -p ${PORT}:80 `
    $IMAGE_NAME

Write-Host "✅ 部署完成！可访问 http://<你的服务器IP>:${PORT} 预览。" -ForegroundColor Green