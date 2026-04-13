# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build args (injected by Coolify)
ARG VITE_CONVEX_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the app (Vite injects VITE_* env vars at build time)
RUN pnpm build

# Stage 2: Serve
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
