# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies and verify nodemailer
RUN npm ci --only=production && \
    echo "Checking nodemailer installation..." && \
    npm list nodemailer || echo "Nodemailer not found in production deps" && \
    echo "Installing nodemailer explicitly..." && \
    npm install nodemailer@6.9.7 && \
    echo "Verifying installation..." && \
    npm list nodemailer

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Debug: Check if nodemailer is accessible
RUN node -e "try { require('nodemailer'); console.log('✅ Nodemailer loaded successfully'); } catch(e) { console.error('❌ Nodemailer load failed:', e.message); }"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Change ownership of app directory
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]