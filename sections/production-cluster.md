# K3S: Production cluster

_AB: These are just notes this section is still in active development_


20:21:18:~> kubectl --kubeconfig=.kube/config get nodes 
NAME     STATUS   ROLES                  AGE     VERSION
node-1   Ready    control-plane,master   10m     v1.26.9+k3s1
node-2   Ready    <none>                 7m44s   v1.26.9+k3s1

# install k8s dashboard ui
`kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml`

Source: https://github.com/kubernetes/dashboard/blob/master/docs/user/access-control/creating-sample-user.md

kubectl --kubeconfig=prod-k8s apply -f ./prod-cluster/dashboard.
kubectl --kubeconfig=prod-k8s apply -f ./prod-cluster/dashboard.cluster-role-binding.yml

kubectl --kubeconfig=prod-k8s -n kubernetes-dashboard describe secret $(kubectl --kubeconfig=prod-k8s -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')


#### Test: Deploying a minio instance from the prod cluster into the storage cluster


### certs

https://gitlab.local/anthonybudd/website/-/settings/access_tokens


kubectl create secret docker-registry regcred --kubeconfig=prod.k8s --docker-server=https://registry.gitlab.local --docker-username=anthonybudd --docker-password=glpat-mmS4GjJXk9NxivyvjgYL --docker-email=anthonybudd94@gmail.com


registry.gitlab.local

/usr/local/share/ca-certificates

update-ca-certificates



https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/

https://docs.gitlab.com/ee/administration/packages/container_registry.html
https://blog.nuvotex.de/kubernetes-private-registry/

https://raspberrypi.stackexchange.com/questions/76419/entrusted-certificates-installation


sudo k3s ctr image pull -v -k registry.gitlab.local/anthonybudd/website:master


```
local/anthonybudd/website:master": rpc error: code = Unknown desc = failed to pull and unpack image "registry.gitlab.local/anthonybudd/website:master": failed to resolve reference "registry.gitlab.local/anthonybudd/website:master": failed to do request: Head "https://registry.gitlab.local/v2/anthonybudd/website/manifests/master": tls: failed to verify certificate: x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "*.gitlab.local")
```