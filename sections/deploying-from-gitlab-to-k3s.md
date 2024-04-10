# Deploying From GitLab Registry To K3s

We need to be able to deploy the SaaS front-end and REST API for S3 from our private GitLab Repo to our prod cluster.


### Make A New Repo

Make a new repo in GitLab with the following structure, all of the files can be found in [./deployment-test](./deployment-test)

```sh
new-repo/
├─ .gitlab-ci.yml
├─ Dockerfile
├─ k8s.yml
└─ index.html
```

### Compile
Commit the files to the repo which should trigger a build in GitLab.

You should see that a new image has been pushed to the container registy by going to __Deploy -> Container Registry__

### Deploy
From the Console run the following kubectl command to manually deploy the image from our private regsitry onto our cluster.

```
[Console] kubectl --kubeconfig=.kube/config apply -f ./deployment-test/k8s.yml
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
