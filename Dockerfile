# STAGE 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# STAGE 2: Compile the Go Binary
FROM golang:1.25-alpine AS backend-builder

RUN apk add --no-cache git gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# STAGE 3: Secure Runtime Environment
FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

# Copy the compiled Go binary and legacy static assets
COPY --from=backend-builder /app/main .
COPY --from=backend-builder /app/public/ ./public/

# Copy the SQL files into the container
COPY --from=backend-builder /app/internal/infrastructure/database/migrations/ ./internal/infrastructure/database/migrations/
COPY --from=backend-builder /app/internal/infrastructure/database/seeders/ ./internal/infrastructure/database/seeders/

# Copy the compiled React assets
COPY --from=frontend-builder /app/frontend/dist/ ./frontend/dist/

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