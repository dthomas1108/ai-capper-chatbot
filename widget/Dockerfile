# Use nginx to serve static files
FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY widget.js /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/

# Create a custom nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ =404; \
    } \
    \
    # Enable CORS for API calls \
    location ~* \.(js|css)$ { \
        add_header Access-Control-Allow-Origin *; \
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS"; \
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]