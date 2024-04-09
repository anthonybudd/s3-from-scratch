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