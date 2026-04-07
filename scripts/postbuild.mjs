import { writeFileSync } from "fs";
import { resolve } from "path";

const htaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;

writeFileSync(resolve("dist", ".htaccess"), htaccess);
console.log("✅ .htaccess generated in dist/");
