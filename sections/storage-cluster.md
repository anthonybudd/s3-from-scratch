# K3S: Storage Cluster

This section will cover how to set-up the storage kubernetes cluster which will store of the data for our buckets.


### Build nodes
Start by building three nodes and the install them into the infrastructure.

Once both nodes have booted-up, confirm that you can SSH into the nodes from the console.

```[Console] ssh node@10.0.0.XXX```

```[Console] ssh node@10.0.0.YYY```

```[Console] ssh node@10.0.0.ZZZ```


### Install K3s
Clone this repo on the Console and make a copy of the `example` directory located at `./ansible/inventory/example` 

```sh
[Console] cp -R ansible/inventory/example ansible/inventory/storage-cluster
```

Edit the `hosts.ini` located in `./ansible/inventory/storage-cluster` so node-3 IP address is the master list and node-4 and node 5 are in the node list

```
[Console] nano ansible/inventory/storage-cluster/hosts.ini
```

```
[master]
10.0.0.7

[node]
10.0.0.8
10.0.0.9

[k3s_cluster:children]
master
node
```

#### Run the Ansible playbook

Run the Ansible playbook to install K3s across all of the nodes in our cluster.

```sh
[Console] ansible-playbook ansible/site.yml -i ansible/inventory/storage-cluster/hosts.ini
```

If the playbook completes successfully you should see output like this

```sh
PLAY RECAP ****************************************************************************************************
10.0.0.XXX                 : ok=21   changed=12   unreachable=0    failed=0    skipped=10   rescued=0    ignored=0   
10.0.0.YYY                 : ok=10   changed=5    unreachable=0    failed=0    skipped=10   rescued=0    ignored=0    
10.0.0.ZZZ                 : ok=10   changed=5    unreachable=0    failed=0    skipped=10   rescued=0    ignored=0 
```

#### Test the nodes
Copy the kubernetes config file from the master node to the Console. Remember to give the config file another name so it doesn't overwrite the prod-cluster config file.

```
[Console] scp node@10.0.0.XXX:.kube/config ~/.kube/storage-config
```

Test that all of the nodes are up and running by running this command.

```
[Console] kubectl --kubeconfig=.kube/storage-config get nodes
```

You should get a response that looks like this.
```sh
NAME     STATUS   ROLES                  AGE     VERSION
node-1   Ready    control-plane,master   1m49s   v1.26.9+k3s1
node-2   Ready    <none>                 2m17s   v1.26.9+k3s1
node-3   Ready    <none>                 1m58s   v1.26.9+k3s1
```

### SSD Set-up
Before we can start making buckets we need to set-up our SSDs to work with our nodes.

```
[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini k3s_cluster -b -m apt -a "name=nfs-common state=present"
[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini k3s_cluster -b -m apt -a "name=open-iscsi state=present"
[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini k3s_cluster -b -m apt -a "name=util-linux state=present"
```

Check that the nodes have recignised the SSDs

```
[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini k3s_cluster -b -m shell -a "lsblk -f"
```

Update the `hosts.ini` so we can use the `var_disk` varaibe.

```
[master]
10.0.0.XXX var_disk=sda

[node]
10.0.0.YYY var_disk=sda
10.0.0.ZZZ var_disk=sda

[k3s_cluster:children]
master
node
```

Use `wipefs` to remove all of the data from the SSDs

```
[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini k3s_cluster -b -m shell -a "wipefs -a /dev/{{ var_disk }}"
```

Format the drives to ext4

```
[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini k3s_cluster -b -m filesystem -a "fstype=ext4 dev=/dev/{{ var_disk }}"
```

Get the UUID for the disks

```
[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini k3s_cluster -b -m shell -a "blkid -s UUID -o value /dev/{{ var_disk }}"

10.0.0.XXX | CHANGED | rc=0 >>
edd4a0cf-390b-4598-8475-9dbeb0edbe13
10.0.0.YYY | CHANGED | rc=0 >>
4b1db6ce-769a-4997-85ea-de335692bf74
10.0.0.ZZZ | CHANGED | rc=0 >>
fc24d35d-580c-409f-9422-9a838a9daae1
```

Add the drive UUIDs to the hosts.ini file

```
[master]
10.0.0.XXX var_disk=sda var_uuid=fc24d35d-580c-409f-9422-9a838a9daae1

[node]
10.0.0.YYY var_disk=sda var_uuid=4b1db6ce-769a-4997-85ea-de335692bf74
10.0.0.ZZZ var_disk=sda var_uuid=edd4a0cf-390b-4598-8475-9dbeb0edbe13

[k3s_cluster:children]
master
node
```


Mount the disks and reboot to see if the drives have been mounted successfully

```
[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini master -b -m ansible.posix.mount -a "path=/ssd src=UUID={{ var_uuid }} fstype=ext4 state=mounted"

[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini master -b -m shell -a "sudo reboot"
[Console] ansible -i ansible/inventory/storage-cluster/hosts.ini master -b -m shell -a "lsblk -f"

10.0.0.XXX | CHANGED | rc=0 >>
NAME        FSTYPE FSVER LABEL  UUID                                 FSAVAIL FSUSE% MOUNTPOINTS
sda         ext4   1.0          edd4a0cf-390b-4598-8475-9dbeb0edbe13  868.3G     0% /ssd
mmcblk0                                                                             
├─mmcblk0p1 vfat   FAT32 bootfs 44FC-6CF2                             446.5M    12% /boot/firmware
└─mmcblk0p2 ext4   1.0   rootfs 93c89e92-8f2e-4522-ad32-68faed883d2f   21.8G    19% /
10.0.0.YYY | CHANGED | rc=0 >>
NAME        FSTYPE FSVER LABEL  UUID                                 FSAVAIL FSUSE% MOUNTPOINTS
sda         ext4   1.0          4b1db6ce-769a-4997-85ea-de335692bf74  868.3G     0% /ssd
mmcblk0                                                                             
├─mmcblk0p1 vfat   FAT32 bootfs 44FC-6CF2                             446.5M    12% /boot/firmware
└─mmcblk0p2 ext4   1.0   rootfs 93c89e92-8f2e-4522-ad32-68faed883d2f   22.1G    18% /
10.0.0.ZZZ | CHANGED | rc=0 >>
NAME        FSTYPE FSVER LABEL  UUID                                 FSAVAIL FSUSE% MOUNTPOINTS
sda         ext4   1.0          fc24d35d-580c-409f-9422-9a838a9daae1  869.2G     0% /ssd
mmcblk0                                                                             
├─mmcblk0p1 vfat   FAT32 bootfs 44FC-6CF2                             446.5M    12% /boot/firmware
└─mmcblk0p2 ext4   1.0   rootfs 93c89e92-8f2e-4522-ad32-68faed883d2f   21.5G    20% /
```

### Install Longhorn

```
[Console] kubectl --kubeconfig=.kube/storage-cluster apply -f https://raw.githubusercontent.com/longhorn/longhorn/v1.6.1/deploy/longhorn.yaml

[Console] kubectl --kubeconfig=.kube/storage-cluster  get pods \
    --namespace longhorn-system \
    --watch
```


#### Longhorn UI

To show the Longhorn UI apply the ingress file in [longhorn/longhorn.ingress.yml](/longhorn/longhorn.ingress.yml)

```sh
[Console] kubectl --kubeconfig=.kube/storage-cluster apply -f longhorn/longhorn.ingress.yml

[Console] kubectl --kubeconfig=.kube/storage-cluster get ingress -n longhorn-system

NAME               CLASS    HOSTS            ADDRESS                            PORTS   AGE
longhorn-ingress   <none>   longhorn.local   10.0.0.XXX,10.0.0.YYY,10.0.0.ZZZ   80      2d
```

Add `10.0.0.XXX longhorn.local` to your hosts file

You should be able to goto [http://longhorn.local](http://longhorn.local) and you will see the longhorn web UI.

<img height="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/longhorn-ui.png">


### Configure Longhorn
By default Longhorn will save data to `/var/lib/longhorn` which is our SD card. To make our Longhorn nodes save to our SSD go to  __Node__ in tha top menu.

For each of the Longhorn nodes click on __Edit node and Disks__ in the far right. Set Scheduling to Disable and then delete the existing disk. Click __Add Disk__ set the Name to `ssd` and the Path to `/ssd`. Click save.

<img height="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/longhorn-ssd.png">

### Set Longhorn to the default storageclass
You can set Longhorn as the default storage class by running the following

```
[Console] kubectl --kubeconfig=.kube/storage-config get storageclass                                      
NAME                   PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
local-path (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   false                  2d
longhorn (default)     driver.longhorn.io      Delete          Immediate              true                   2d

[Console] kubectl --kubeconfig=.kube/storage-config patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}' 
storageclass.storage.k8s.io/local-path patched

[Console] kubectl --kubeconfig=.kube/storage-config get storageclass 
NAME                 PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
longhorn (default)   driver.longhorn.io      Delete          Immediate              true                   2d
local-path           rancher.io/local-path   Delete          WaitForFirstConsumer   false                  2d
```

