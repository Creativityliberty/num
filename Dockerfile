FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY custom_modes.d ./custom_modes.d
COPY .windsurf ./.windsurf
COPY dist ./dist

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3457

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3457/api/flow/status', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["node", "dist/src/cli.js", "serve", "--modes-path", "./custom_modes.d", "--dashboard", "--dashboard-port", "3457"]
