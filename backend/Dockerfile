# ── Estágio de build ────────────────────────────────────────── #
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência primeiro (aproveita cache do Docker)
COPY go.mod go.sum ./
RUN go mod download

# Copia o código-fonte e compila
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/main.go

# ── Imagem final (mínima) ────────────────────────────────────── #
FROM alpine:3.19

# Timezone e certificados TLS
RUN apk add --no-cache tzdata ca-certificates

WORKDIR /app
COPY --from=builder /server .

EXPOSE 8080

ENTRYPOINT ["/app/server"]
