# 使用 Deno 官方镜像作为构建阶段的基础镜像
FROM denoland/deno:latest AS builder

# 设置工作目录
WORKDIR /app

# 复制应用程序文件
COPY index.ts .

# 编译 Deno 应用程序
RUN deno compile --allow-net --allow-env --output deno-api-proxy index.ts

# 使用 scratch 镜像作为最终阶段的基础镜像，以减小镜像大小
FROM alpine:latest

# 复制编译后的二进制文件
COPY --from=builder /app/deno-api-proxy /deno-api-proxy

# 暴露应用程序监听的端口
EXPOSE 3000

# 运行应用程序，并允许直接传递参数
ENTRYPOINT ["/deno-api-proxy"]
CMD []