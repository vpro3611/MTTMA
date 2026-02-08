FROM node:25-alpine AS builder

WORKDIR /orgProject

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:25-alpine

WORKDIR /orgProject

COPY --from=builder /orgProject/package*.json ./
ENV NODE_ENV=productio

COPY --from=builder /orgProject/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]