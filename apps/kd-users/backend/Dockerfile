FROM golang:1.23 AS base
WORKDIR /src
RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=bind,source=go.mod,target=go.mod \
    --mount=type=bind,source=go.sum,target=go.sum \
    go mod download -x

FROM base AS builder
RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=bind,source=.,target=. \
    CGO_ENABLED=0 GOOS=linux go build -o /build/app

# TODO: ここら辺でテスト走らせてもよいかも

# TODO: このベースイメージが適切かはわからない
FROM debian:bookworm-slim AS final
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

COPY --from=builder /build/app .

ENTRYPOINT [ "./app" ]
