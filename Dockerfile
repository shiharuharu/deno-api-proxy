FROM denoland/deno:latest

WORKDIR /app

COPY index.ts .

RUN deno compile --allow-net --allow-env --output deno-api-proxy index.ts

EXPOSE 3000

ENTRYPOINT ["/app/deno-api-proxy"]