# Node

<img height="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/node.png">

### Default Set-up Procedure
By default always do the following set-up procedure when creating a new node.

Unless otherwise specified always flash the SD card with 64-bit Raspberry Pi OS Lite.

#### Public Key Auth
```[Console] ssh-copy-id node@10.0.0.XXX```

#### Enable cpuset
```sh
[Node X] sudo nano /boot/firmware/cmdline.txt

cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory 
```

#### Disable WiFi & Bluetoooth
```sh
[Node X] sudo nano /boot/firmware/config.txt

dtoverlay=disable-wifi
dtoverlay=disable-bt
```

#### Run `node-config-script.sh`
This script will add some security changes to SSH and install Fail2Ban.

SCP the [node-config-script.sh](./../node/node-config-script.sh) to the node and run it. 

_AB: Fail2Ban Config?_

_AB: Test Fail2Ban_

```sh
[Console] scp ./node/node-config-script.sh node@10.0.0.XXX:~
[Console] ssh node@10.0.0.XXX
[Node X] sudo ~/node-config-script.sh
[Node X] sudo reboot
```

_AB: Is this enough? What more SSH changes should I make to improve security?_
