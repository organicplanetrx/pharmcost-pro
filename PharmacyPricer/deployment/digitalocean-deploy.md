# DigitalOcean Deployment Guide for PharmaCost Pro

## Option 1: DigitalOcean App Platform (Recommended)

### Prerequisites
- DigitalOcean account
- GitHub repository with your code

### Steps
1. **Connect GitHub repository**
2. **Configure build settings:**
   ```yaml
   # Build Command
   npm run build
   
   # Run Command
   npm run start
   
   # Port
   5000
   ```

3. **Environment variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=${db.DATABASE_URL}
   ```

4. **Add PostgreSQL database:**
   - Add managed PostgreSQL component
   - Automatically sets DATABASE_URL

### Cost: ~$12-25/month (includes database)

## Option 2: DigitalOcean Droplet

### Prerequisites
- DigitalOcean account
- SSH key configured

### Steps
1. **Create Droplet:**
   - Ubuntu 22.04 LTS
   - Basic plan: $6-12/month
   - Add your SSH key

2. **Initial server setup:**
   ```bash
   # Connect to droplet
   ssh root@your-droplet-ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Install PostgreSQL
   apt install postgresql postgresql-contrib -y
   
   # Install nginx
   apt install nginx -y
   
   # Install PM2
   npm install -g pm2
   ```

3. **Setup PostgreSQL:**
   ```bash
   # Switch to postgres user
   sudo -u postgres psql
   
   # Create database and user
   CREATE DATABASE pharmcost;
   CREATE USER pharmcost_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE pharmcost TO pharmcost_user;
   \q
   ```

4. **Deploy application:**
   ```bash
   # Create app directory
   mkdir /var/www/pharmcost
   cd /var/www/pharmcost
   
   # Clone repository (or upload files)
   git clone your-repo-url .
   
   # Install dependencies and build
   npm install
   npm run build
   
   # Set environment variables
   echo "NODE_ENV=production" > .env
   echo "DATABASE_URL=postgresql://pharmcost_user:your_secure_password@localhost:5432/pharmcost" >> .env
   
   # Start with PM2
   pm2 start dist/index.js --name pharmcost-pro
   pm2 startup
   pm2 save
   ```

5. **Configure nginx:**
   ```nginx
   # /etc/nginx/sites-available/pharmcost
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable site
   ln -s /etc/nginx/sites-available/pharmcost /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt:**
   ```bash
   # Install certbot
   apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate
   certbot --nginx -d your-domain.com
   ```

### Cost: ~$8-15/month (droplet + managed database)

## Option 3: Docker on DigitalOcean

### Prerequisites
- DigitalOcean droplet with Docker

### Steps
1. **Install Docker:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy with Docker Compose:**
   ```bash
   # Upload your project files
   scp -r . root@your-droplet-ip:/var/www/pharmcost/
   
   # SSH to droplet
   ssh root@your-droplet-ip
   cd /var/www/pharmcost
   
   # Create .env file
   echo "POSTGRES_PASSWORD=your_secure_password" > .env
   echo "DATABASE_URL=postgresql://pharmcost_user:your_secure_password@postgres:5432/pharmcost" >> .env
   
   # Build and start
   docker-compose -f docker/docker-compose.yml up -d
   ```

## Testing Network Connectivity

After deployment, verify Kinray access:

```bash
# SSH into your server
ssh root@your-droplet-ip

# Test direct connectivity
curl -I https://kinray.com
# Should return: HTTP/2 200

# Test from within your application container (if using Docker)
docker exec -it pharmcost-app-1 curl -I https://kinray.com
```

## Domain Setup

1. **Point domain to droplet:**
   - Add A record: `your-domain.com` → `your-droplet-ip`
   - Add CNAME record: `www.your-domain.com` → `your-domain.com`

2. **Update application URL:**
   - Configure your app to use the new domain
   - Update CORS settings if needed

## Monitoring and Maintenance

1. **Setup monitoring:**
   ```bash
   # Install htop for resource monitoring
   apt install htop -y
   
   # Monitor PM2 processes
   pm2 monit
   
   # Check logs
   pm2 logs pharmcost-pro
   ```

2. **Automatic updates:**
   ```bash
   # Create update script
   cat > /opt/update-pharmcost.sh << 'EOF'
   #!/bin/bash
   cd /var/www/pharmcost
   git pull origin main
   npm install
   npm run build
   pm2 restart pharmcost-pro
   EOF
   
   chmod +x /opt/update-pharmcost.sh
   ```

3. **Backup database:**
   ```bash
   # Create backup script
   cat > /opt/backup-db.sh << 'EOF'
   #!/bin/bash
   pg_dump -U pharmcost_user -h localhost pharmcost > /backups/pharmcost-$(date +%Y%m%d).sql
   EOF
   
   # Add to crontab for daily backups
   crontab -e
   # Add: 0 2 * * * /opt/backup-db.sh
   ```

**Total monthly cost on DigitalOcean: $8-25 depending on configuration**