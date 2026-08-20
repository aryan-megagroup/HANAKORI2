# STAGE 1: Compile the Go Binary
FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# STAGE 2: Secure Runtime Environment
FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

# Copy the compiled binary and static assets from the stage named 'builder'
COPY --from=builder /app/main .
COPY --from=builder /app/public/ ./public/

# Copy the SQL files into the container
COPY --from=builder /app/internal/infrastructure/database/migrations/ ./internal/infrastructure/database/migrations/
COPY --from=builder /app/internal/infrastructure/database/seeders/ ./internal/infrastructure/database/seeders/

# Create the uploads directory explicitly so it always exists
RUN mkdir -p /app/public/uploads

# Create a non-root user
RUN adduser -D hanakori_user

# Grant the non-root user ownership of the public folder so it can save images
RUN chown -R hanakori_user:hanakori_user /app/public

# Switch to the user for security
USER hanakori_user

EXPOSE 8081

CMD ["./main"]