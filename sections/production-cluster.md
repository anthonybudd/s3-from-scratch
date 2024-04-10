# K3S: Production cluster

This guide will cover how to set-up the production kubernetes cluster for hosting our public website, api and front-end

_AB: Make cluster HA_

### Build 2 nodes
Start by building two nodes and the install them into the infrastructre.

Once both nodes have booted-up, confirm that you can SSH into the nodes from the console.

```[Console] ssh node@10.0.0.XXX```

```[Console] ssh node@10.0.0.YYY```


### Install K3s
Clone this repo on the Console and make a copy of the `example` directory located at `./ansible/inventory/example`

```sh
[Console] cp -a ansible/inventory/example ansible/inventory/prod-cluster
```




---


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

```
stages:
  - build

build-job:
  image: docker:dind
  stage: build
  services:
    - docker:dind
  variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG
  script:
    - unset DOCKER_HOST
    - docker login $CI_REGISTRY -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD
    - docker build -t $IMAGE_TAG .
    - docker push $IMAGE_TAG
```



#### Test: Deploying a minio instance from the prod cluster into the storage cluster


### Deploying containers from registry.gitlab.local

<img height="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/test-deployment.jpg?f=1">

docker login -u anthonybudd -p glpat-mmS4GjJXk9NxivyvjgYL registry.gitlab.local

docker login -u anthonybudd -p glpat-mmS4GjJXk9NxivyvjgYL gitlab.local

docker pull registry.gitlab.local/anthonybudd/website

docker pull gitlab.local:5000/anthonybudd/website:master
^works on Gl node, not other doamin/port works
can run the image and hit it from dev

```sh
gitlab@gitlab:~ $ netstat -lntp
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 127.0.0.1:9229          0.0.0.0:*               LISTEN      -                   
tcp        0      0 127.0.0.1:9236          0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:5050            0.0.0.0:*               LISTEN      -   
```


```
Failed to pull image "gitlab.local:5000/anthonybudd/website:master": rpc error: code = Unknown desc = failed to pull and unpack image "gitlab.local:5000/anthonybudd/website:master": failed to resolve reference "gitlab.local:5000/anthonybudd/website:master": failed to do request: Head "https://gitlab.local:5000/v2/anthonybudd/website/manifests/master": dial tcp 10.0.0.175:5000: connect: connection refused
```

---

https://gitlab.local/anthonybudd/website/-/settings/access_tokens


kubectl create secret docker-registry regcred --kubeconfig=prod.k8s --docker-server=https://registry.gitlab.local --docker-username=anthonybudd --docker-password=glpat-mmS4GjJXk9NxivyvjgYL --docker-email=anthonybudd94@gmail.com


registry.gitlab.local

/usr/local/share/ca-certificates

update-ca-certificates

openssl s_client -showcerts -connect gitlab.local:5050 </dev/null

nmap -p 80 example.com

docker login -u anthonybudd -p glpat-mmS4GjJXk9NxivyvjgYL registry.gitlab.local

https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/

https://docs.gitlab.com/ee/administration/packages/container_registry.html
https://blog.nuvotex.de/kubernetes-private-registry/

https://raspberrypi.stackexchange.com/questions/76419/entrusted-certificates-installation


sudo k3s ctr image pull registry.gitlab.local:5000/anthonybudd/website:master


```
local/anthonybudd/website:master": rpc error: code = Unknown desc = failed to pull and unpack image "registry.gitlab.local/anthonybudd/website:master": failed to resolve reference "registry.gitlab.local/anthonybudd/website:master": failed to do request: Head "https://registry.gitlab.local/v2/anthonybudd/website/manifests/master": tls: failed to verify certificate: x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "*.gitlab.local")
```

```
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  16s   default-scheduler  Successfully assigned default/website-deployment-77c6cfb55c-zj2tw to node-1
  Normal  Pulling    16s   kubelet            Pulling image "gitlab.local:5050/anthonybudd/website:master"
  Normal  Pulled     11s   kubelet            Successfully pulled image "gitlab.local:5050/anthonybudd/website:master" in 4.655969325s (4.655985473s including waiting)
  Normal  Created    11s   kubelet            Created container website
  Normal  Started    11s   kubelet            Started container website
```
