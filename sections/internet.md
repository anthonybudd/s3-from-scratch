# Connecting to the Internet

In a true datacenter we would request a static IP address from our ISP and point our DNS servers to that IP Address. However I cannot get a static IP at my office, to get around this and to make this project more useful I have decided to use OpenVPN, this will allow  us to "rent" a static IP address from an existing cloud provider.

To do this we will set up a Digital Ocean Droplet running the latest version of Ubuntu.

Make sure you add the consoles public key to the droplet
_AB: add image_

__Note:__ Do not request a "Reserved IP" this causes issues with OpenVPN for some reason.

Install OpenVPN
```sh
[OpenVPNServer] wget https://git.io/vpn -O openvpn-install.sh
sudo chmod +x openvpn-install.sh
sudo bash openvpn-install.sh
```

You will see an interactive install script like this. When prompted name the clinet `node-1`
```
Welcome to this OpenVPN road warrior installer!

Which protocol should OpenVPN use?
   1) UDP (recommended)
   2) TCP
Protocol [1]: 1

What port should OpenVPN listen to?
Port [1194]: 

Select a DNS server for the clients:
   1) Current system resolvers
   2) Google
   3) 1.1.1.1
   4) OpenDNS
   5) Quad9
   6) AdGuard
DNS server [1]: 2

Enter a name for the first client:
Name [client]: node-1

OpenVPN installation is ready to begin.
Press any key to continue...
```

```sh
[OpenVPNServer] sudo systemctl restart openvpn-server@server.service
```

### Node Set-up

Install OpenVPN onto the master node of each cluster
```
[Node X] apt-get install openvpn -y
```

Make a .ovpn config file on the VPN server and SCP it to the node
```
[Console] scp root@OPEN_VPN_SERVER_IP:/etc/openvpn/???/node-1.ovpn /tmp
mv /tmp/node-1.ovpn /tmp/node-1.config
scp /tmp/node-1.config node@$N1IP:/etc/openvpn
```
__Note:__ I'm deliberately renameing the file to .config, this is becasue the extension OpenVPN uses to autoload.
_AB: Confirm file path_
_AB: Add file to pass?_


```
[Node X] nano /etc/default/openvpn

# Uncomment this line
AUTOSTART="all"
```

_AB: This is probbably not that good of a set-up, i should probably improve this by moving openVPN to the OpenWRT raspberry pi_


### Install Nginx on the OpenVPN server

```[OpenVPNServer] sudo apt install -y nginx```



```sh
[OpenVPNServer] sudo nano /etc/hosts

PROD_CLUSTER_MASTER_NODE_IP      app.YOUR_DOMAIN.com
PROD_CLUSTER_MASTER_NODE_IP      api.YOUR_DOMAIN.com
```

/etc/nginx/nginx.conf
```
...
stream {
  map $ssl_preread_server_name $targetBackend {
    s3.anthonybudd.io  10.8.0.3:443;
    s3-api.anthonybudd.io  10.8.0.3:443;
    echo.s3.anthonybudd.io  10.8.0.4:443;
  }  

  server {
    listen     443;
    proxy_pass $targetBackend;       
    ssl_preread on;
  }
}
...
```

aster.s3.YOUR_DOMAIN.com
```sh
server {
    listen  80;
    server_name ~^(?<subdomain>.+)\.s3\.anthonybudd\.io$;

    location / {
        proxy_set_header Host '$subdomain.s3.anthonybudd.io';
        proxy_pass http://10.8.0.4;
    }
}
```


s3.YOUR_DOMAIN.com
```sh
server {
    listen 80;
    server_name s3.anthonybudd.io;
    return 301 https://$host$request_uri;
}
```

s3-api.YOUR_DOMAIN.com
```sh
server {
    listen  80;
    server_name s3-api.anthonybudd.io;
    return 301 https://$host$request_uri;
}
```

---






```sh
[Proxy Node] sudo nano /etc/nginx/sites-available/s3.local

server {
    listen  80;
    server_name s3.anthonybudd.io;

    location / {
        proxy_pass http://s3.anthonybudd.local;
    }
}

[Proxy Node] sudo ln -s /etc/nginx/sites-available/s3.local /etc/nginx/sites-enabled/
[Proxy Node] /etc/init.d/nginx restart

WORKIMG LOCALLY FPR Asterixk
server {
    listen  80;
    server_name ~^(?<subdomain>.+)\.s3\.anthonybudd\.io$;

    location / {
        proxy_pass http://echo.minio.local;
        proxy_set_header Host $subdomain.minio.local;
    }
}

WOKRING LIVE:

server {
    listen  80;
    server_name echo.s3.anthonybudd.io;

    location / {
        proxy_pass http://echo.s3.anthonybudd.local;
    }
}

```


```sh

```