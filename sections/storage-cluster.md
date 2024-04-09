### K3S: Storage Cluster

_AB: These are just notes this section is still in active development_

Set-up K3s storage cluster

ansible  -i k3s-ansible/inventory/longhorn/hosts.ini node  -b -m shell -a "date"


#### Installing Longhorn

ansible  -i k3s-ansible/inventory/longhorn/hosts.ini node -b -m shell -a "cat /etc/fstab"



kubectl --kubeconfig=.kube/storage-cluster 

kubectl --kubeconfig=.kube/storage-cluster apply -f https://raw.githubusercontent.com/longhorn/longhorn/v1.6.1/deploy/longhorn.yaml

kubectl --kubeconfig=.kube/storage-cluster  get pods \
--namespace longhorn-system \
--watch




