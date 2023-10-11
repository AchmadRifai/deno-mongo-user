FROM denoland/deno:alpine AS builder
WORKDIR /app
COPY . .
RUN deno compile -A --output myapp main.ts
FROM ubuntu
WORKDIR /app
COPY --from=builder /app/myapp .
CMD ["./myapp"]
EXPOSE 2101