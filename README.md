# TaskManagar - نظام إدارة مهام تطوير أودو 17

نظام متكامل لإدارة مهام تطوير أودو 17 مبني بـ Next.js + Tailwind CSS + SQLite (Prisma).

## الميزات
- إدارة المهام مع نظام أولويات (حرجة/عالية/متوسطة/منخفضة)
- ترتيب يدوي للمهام (تقديم/تأخير)
- تنبيهات مواعيد التسليم
- رفع مرفقات (صور + ملفات + روابط)
- نظام تعليقات
- سجل نشاط لكل مهمة
- إدارة حسابات الموظفين (تفعيل/تعطيل)
- واجهة عربية RTL بالكامل
- قاعدة بيانات محلية SQLite (بدون خدمات خارجية)

## التشغيل المحلي

```bash
# تثبيت المكتبات
npm install

# إعداد قاعدة البيانات
npx prisma db push
npx tsx prisma/seed.ts

# التشغيل
npm run dev
```

افتح http://localhost:3000

## النشر على VPS (Hostinger)

### 1. الاتصال بالسيرفر
```bash
ssh root@YOUR_VPS_IP
```

### 2. تثبيت المتطلبات
```bash
# تثبيت Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت PM2 لإدارة العمليات
sudo npm install -g pm2

# تثبيت Nginx
sudo apt-get install -y nginx
```

### 3. رفع المشروع
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/YOUR_USERNAME/taskmanagar.git
cd taskmanagar
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run build
```

### 4. تشغيل بـ PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. إعداد Nginx
```bash
sudo nano /etc/nginx/sites-available/taskmanagar
```

أضف الإعداد التالي:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
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
sudo ln -s /etc/nginx/sites-available/taskmanagar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL (اختياري - للدومين)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

## بيانات الدخول الافتراضية
- **الاسم**: سعد محمد
- **الجوال**: 0580623205
- **الدور**: مدير (admin)

## التقنيات
- **Frontend**: Next.js 14 + React 18 + Tailwind CSS + Framer Motion
- **Backend**: Next.js API Routes
- **Database**: SQLite + Prisma ORM
- **اللغة**: TypeScript
