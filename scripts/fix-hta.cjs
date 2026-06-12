const ftp = require('basic-ftp');
const fs = require('fs');
async function fix() {
  const client = new ftp.Client();
  await client.access({
    host: '46.202.183.96',
    user: 'u282141363',
    password: process.env.FTP_PASSWORD,
    secure: false
  });
  
  const hta = `<IfModule mod_headers.c>
  <FilesMatch "\\.(html|htm)$">
    FileETag None
    Header unset ETag
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "Wed, 11 Jan 1984 05:00:00 GMT"
  </FilesMatch>

  <FilesMatch "\\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

<IfModule LiteSpeed>
  CacheDisable public /
  CacheDisable public /index.html
  RewriteRule .* - [E=Cache-Control:no-cache]
</IfModule>

Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]`;
  
  fs.writeFileSync('hta.txt', hta);
  await client.cd('/domains/litfitmexico.com/public_html');
  await client.uploadFrom('hta.txt', '.htaccess');
  console.log('Fixed .htaccess uploaded to root');
  client.close();
}
fix();
