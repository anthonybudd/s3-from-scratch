# vCluster


## Quick Start
```sh

# Insert USB Before config
export PI_ADDRESS="10.0.0.XXX"

ssh-keygen -R $PI_ADDRESS && \
ssh-copy-id pi@$PI_ADDRESS && \
scp config.sh pi@$PI_ADDRESS:~ && \
ssh pi@$PI_ADDRESS "sudo ./config.sh"


ansible-playbook site.yml -i inventory/pi-cluster/hosts.ini

scp pi@10.0.0.217:~/.kube/config ~/.kube/config

kubectl get nodes
```




### Helpful Commands
```sh
node -e "console.log(require('crypto').randomBytes(16).toString('base64'));"

kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/v0.8.0/deploy/longhorn.yaml

kubectl get all --namespace longhorn-system
```
