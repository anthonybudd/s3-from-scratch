# Ansible

Copied from: []()


## Quick Start
```bash
ansible-playbook site.yml -i inventory/pi-cluster/hosts.ini

ssh-keygen -R 192.168.1.91

ssh-copy-id pi@192.168.1.64

scp pi@10.0.0.132:~/.kube/config ~/.kube/config
```



## Usage

First create a new directory based on the `sample` directory within the `inventory` directory:

```bash
cp -R inventory/sample inventory/my-cluster
```

Second, edit `inventory/my-cluster/hosts.ini` to match the system information gathered above. For example:

```bash
[master]
192.16.35.12

[node]
192.16.35.[10:11]

[k3s_cluster:children]
master
node
```

If needed, you can also edit `inventory/my-cluster/group_vars/all.yml` to match your environment.

Start provisioning of the cluster using the following command:

```bash
ansible-playbook site.yml -i inventory/pi-cluster/hosts.ini
```
