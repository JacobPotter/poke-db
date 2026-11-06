FROM golang:1.23-bookworm AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -buildvcs=false -o poke-api ./main.go \
    && go build -buildvcs=false -o refresh-db ./cmd/refresh-db

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/poke-api /app/poke-api
COPY --from=builder /app/refresh-db /app/refresh-db

EXPOSE 8080

CMD ["/app/poke-api"]
