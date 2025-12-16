# Apache virtual host configuration

Currently runs on <https://qlever.scholia.wiki> and
<https://wikidata-query-gui.scholia.wiki> with the following
Apache configurations:

```apache
<VirtualHost *:443>
  ServerName qlever.scholia.wiki 
  ServerAdmin webmaster@localhost

  SSLEngine On
  SSLCertificateFile /etc/letsencrypt/live/qlever.scholia.wiki/fullchain.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/qlever.scholia.wiki/privkey.pem
  # SSLCertificateFile /etc/letsencrypt/live/qlever.cs.uni-freiburg.de/fullchain.pem
  # SSLCertificateKeyFile /etc/letsencrypt/live/qlever.cs.uni-freiburg.de/privkey.pem
  Include /etc/letsencrypt/options-ssl-apache.conf

  ProxyPass / http://tajo.informatik.privat:8100/

  <Directory />
    Options Indexes
    Options FollowSymLinks
    AllowOverride None
    Allow from all
  </Directory>

  ErrorLog ${APACHE_LOG_DIR}/scholia-error.log
  CustomLog ${APACHE_LOG_DIR}/scholia-access.log combined
</VirtualHost>
```

```apache
<VirtualHost *:443>
  ServerName wikidata-query-gui.scholia.wiki 
  ServerAdmin webmaster@localhost

  SSLEngine On
  SSLCertificateFile /etc/letsencrypt/live/wikidata-query-gui.scholia.wiki/fullchain.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/wikidata-query-gui.scholia.wiki/privkey.pem
  Include /etc/letsencrypt/options-ssl-apache.conf
  
  ProxyPass / http://tajo.informatik.privat:8080/

  <Directory />
    Options Indexes
    Options FollowSymLinks
    AllowOverride None
    Allow from all
  </Directory>
    
  ErrorLog ${APACHE_LOG_DIR}/wikidata-query-gui-error.log
  CustomLog ${APACHE_LOG_DIR}/wikidata-query-gui.log combined
</VirtualHost>
```



