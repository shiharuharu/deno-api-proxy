#!/bin/bash

# 定义镜像名称和标签
IMAGE_NAME="deno-api-proxy"
IMAGE_TAG="latest"

# 构建 Docker 镜像
echo "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

# 检查构建是否成功
if [ $? -eq 0 ]; then
  echo "Docker image built successfully: ${IMAGE_NAME}:${IMAGE_TAG}"
else
  echo "Failed to build Docker image."
  exit 1
fi

echo "To run the Docker image, use: docker run -p 3000:3000 ${IMAGE_NAME}:${IMAGE_TAG}"
echo "To pass parameters directly, use: docker run -p 3000:3000 ${IMAGE_NAME}:${IMAGE_TAG} --listen 0.0.0.0:8080"