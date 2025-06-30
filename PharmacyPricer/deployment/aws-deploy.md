# AWS Deployment Guide for PharmaCost Pro

## Option 1: AWS App Runner (Easiest)

### Prerequisites
- AWS Account
- GitHub repository with your code

### Steps
1. **Push code to GitHub**
2. **Create App Runner service:**
   ```bash
   # Build command
   npm run build
   
   # Start command  
   npm run start
   
   # Port
   5000
   ```
3. **Environment variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgres_connection_string
   ```

### Cost: ~$10-30/month

## Option 2: AWS ECS with Fargate

### Prerequisites
- AWS CLI installed
- Docker installed locally

### Steps
1. **Build and push Docker image:**
   ```bash
   # Build the image
   docker build -f docker/Dockerfile -t pharmcost-pro .
   
   # Tag for ECR
   docker tag pharmcost-pro:latest your-account-id.dkr.ecr.region.amazonaws.com/pharmcost-pro:latest
   
   # Push to ECR
   docker push your-account-id.dkr.ecr.region.amazonaws.com/pharmcost-pro:latest
   ```

2. **Create ECS service:**
   - Use the pushed Docker image
   - Configure task definition with 0.5 vCPU, 1GB memory
   - Set environment variables
   - Configure Application Load Balancer

3. **Database:**
   - Use AWS RDS PostgreSQL
   - Configure security groups for ECS access

### Cost: ~$20-50/month

## Option 3: AWS EC2 (Most Control)

### Steps
1. **Launch EC2 instance:**
   - Ubuntu 22.04 LTS
   - t3.small or larger
   - Configure security group (ports 22, 80, 443, 5000)

2. **Install dependencies:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib -y
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

3. **Deploy application:**
   ```bash
   # Clone your repository
   git clone your-repo-url
   cd pharmcost-pro
   
   # Install dependencies and build
   npm install
   npm run build
   
   # Start with PM2
   pm2 start dist/index.js --name pharmcost-pro
   pm2 startup
   pm2 save
   ```

### Cost: ~$15-25/month

## Database Setup (All Options)

### Environment Variables
```bash
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
NODE_ENV=production
```

### Migration
```bash
# Run database migrations
npm run db:push
```

## Testing Network Access

After deployment, test external connectivity:
```bash
# SSH into your server and test
curl -I https://kinray.com
# Should return HTTP 200 OK

# Test from your application
node -e "
const https = require('https');
https.get('https://kinray.com', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Network access: SUCCESS');
}).on('error', (err) => {
  console.error('Network access: FAILED', err.message);
});
"
```