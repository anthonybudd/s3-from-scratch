# K3S: Production cluster

This guide will cover how to set-up the production kubernetes cluster for hosting our public website, api and front-end

_AB: Make cluster HA_

### Build nodes
Start by building two nodes and the install them into the infrastructure.

Once both nodes have booted-up, confirm that you can SSH into the nodes from the console.

```[Console] ssh node@10.0.0.XXX```

```[Console] ssh node@10.0.0.YYY```


### Install K3s
Clone this repo on the Console and make a copy of the `example` directory located at `./ansible/inventory/example` 

```sh
[Console] cp -R ansible/inventory/example ansible/inventory/prod-cluster
```

Edit the `hosts.ini` located in `./ansible/inventory/prod-cluster` so node-1 IP address is the master list and node-2 is in the node list

```
[Console] nano ansible/inventory/prod-cluster/hosts.ini
```

```
[master]
10.0.0.5

[node]
10.0.0.5

[k3s_cluster:children]
master
node
```

#### Run the Ansible playbook

Run the Ansible playbook to install K3s across all of the nodes in our cluster.

```sh
[Console] ansible-playbook ansible/site.yml -i ansible/inventory/prod-cluster/hosts.ini
```

If the playbook completes successfully you should see output like this

```sh
PLAY RECAP ****************************************************************************************************
10.0.0.XXX                 : ok=21   changed=12   unreachable=0    failed=0    skipped=10   rescued=0    ignored=0   
10.0.0.YYY                 : ok=10   changed=5    unreachable=0    failed=0    skipped=10   rescued=0    ignored=0 
```

#### Test the nodes
Copy the kubernetes config file from the master node to the Console.

```
[Console] scp node@10.0.0.XXX:~/.kube/config ~/.kube/config
```

Test that all of the nodes are up and running by running this command.

```
[Console] kubectl --kubeconfig=.kube/config get nodes
```

You should get a response that looks like this.
```sh
NAME     STATUS   ROLES                  AGE     VERSION
node-1   Ready    control-plane,master   3m6s    v1.26.9+k3s1
node-2   Ready    <none>                 2m37s   v1.26.9+k3s1
```


#### First Deployment
Lets test that everything is working by deploying a container that will just return `hello-world` when we make a GET request to the root.

[k3s/echo.yml](/k3s/echo.yml) will make a deployment, service and an ingress.

```
[Console] kubectl --kubeconfig=.kube/config apply -f k3s/echo.yml
deployment.apps/echo-deployment created
service/echo-service created
ingress.networking.k8s.io/echo-ingress created

[Console] kubectl --kubeconfig=.kube/config get pods
```

Add your master production nodes IP to `/etc/hosts` on your work computer and go to [http://echo.local](http://echo.local)
```
sudo nano /etc/hosts

10.0.0.XXX echo.local
```

<img height="400" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/echo.png">



_AB: k8s dashboard_

<!-- # install k8s dashboard ui
`kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml`

Source: https://github.com/kubernetes/dashboard/blob/master/docs/user/access-control/creating-sample-user.md

kubectl --kubeconfig=prod-k8s apply -f ./prod-cluster/dashboard.
kubectl --kubeconfig=prod-k8s apply -f ./prod-cluster/dashboard.cluster-role-binding.yml
kubectl --kubeconfig=prod-k8s -n kubernetes-dashboard describe secret $(kubectl --kubeconfig=prod-k8s -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}') -->




