# Node

_AB: These are just notes this section is still in active development_

### Default
By default always do the following when crating a new node

```[Console] ssh-copy-id node@10.0.0.XXX```

### Run Node Config
SCP the [node-config-script.sh](./../node/node-config-script.sh) to the node and run it. This script will add some secureity changes to SSH and install Fail2Ban.

```sh
[Console] scp ./node/node-config-script.sh node@10.0.0.XXX:~
[Console] ssh node@10.0.0.XXX
[Node X] sudo ~/node-config-script.sh
```

_AB: Is this enough? What more SSH changes should I make to improve security?_


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
