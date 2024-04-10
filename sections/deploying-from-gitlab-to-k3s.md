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

<img height="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/test-builds.png">

You should see that a new image has been pushed to the container registy by going to __Deploy -> Container Registry__

<img height="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/test-container-registry.png">


### Deploy
From the Console run the following kubectl command to manually deploy the image from our private registry onto our cluster.

```
[Console] kubectl --kubeconfig=.kube/config apply -f ./deployment-test/k8s.yml

deployment.apps/website-deployment created
service/website-service created
ingress.networking.k8s.io/website-ingress created
```

See if the pods has deployed
```sh
[Console] kubectl --kubeconfig=.kube/config get pods
NAME                                  READY   STATUS             RESTARTS   AGE
website-deployment-77c6cfb55c-9fzvq   0/1     ImagePullBackOff   0          43s
```

This pod hasn't deployed and has the status `ImagePullBackOff` this is because Kubernetes (more specifically containerd) can't pull the image from our local GitLab container registry.

To find our more info about this we can use the `describe` command
```sh
[Console] kubectl --kubeconfig=.kube/config describe pod website-deployment-77c6cfb55c-9fzvq

Name:             website-deployment-77c6cfb55c-9fzvq
Namespace:        default
Priority:         0
Service Account:  default
Node:             node-2/10.0.0.217
Start Time:       Wed, 10 Apr 2024 15:54:03 -0700
  ...

Events:
  Type     Reason     Age                 From               Message
  ----     ------     ----                ----               -------
  Normal   Scheduled  112s                default-scheduler  Successfully assigned default/website-deployment-77c6cfb55c-9fzvq to node-2
  Normal   Pulling    21s (x4 over 111s)  kubelet            Pulling image "gitlab.local:5050/anthonybudd/website:master"
  Warning  Failed     21s (x4 over 111s)  kubelet            Failed to pull image "gitlab.local:5050/anthonybudd/website:master": rpc error: code = Unknown desc = failed to pull and unpack image "gitlab.local:5050/anthonybudd/website:master": failed to resolve reference "gitlab.local:5050/anthonybudd/website:master": failed to do request: Head "https://gitlab.local:5050/v2/anthonybudd/website/manifests/master": dial tcp: lookup gitlab.local: no such host
  Warning  Failed     21s (x4 over 111s)  kubelet            Error: ErrImagePull
  Normal   BackOff    7s (x6 over 111s)   kubelet            Back-off pulling image "gitlab.local:5050/anthonybudd/website:master"
  Warning  Failed     7s (x6 over 111s)   kubelet            Error: ImagePullBackOff
```

It seems there is a problem connecting to gitlab.local from the node.

_AB: Trying to debug the above issue_
```
[Node 1] sudo apt install nmap
nmap -p 5050 gitlab.local

PORT     STATE SERVICE
5050/tcp open  mmcc

[Node 1] sudo nano /etc/hosts

10.0.0.XXX gitlab.local
```

Updating out hosts file on each of the nodes solves the issue of not being able to reach gitlab.local

_AB: This isn't a great solution, seems too much to update each node's host file. Figure out why https://gitlab.local works but kube/cd can't reach the registry on gitlab.local:5050_

But the image is still not pulling 🙃

```
[Node 1] kubectl --kubeconfig=.kube/config describe pod website-deployment-77c6cfb55c-9fzvq

Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Normal   Scheduled  13s               default-scheduler  Successfully assigned default/website-deployment-77c6cfb55c-skg69 to node-1
  Normal   BackOff    12s               kubelet            Back-off pulling image "gitlab.local:5050/anthonybudd/website:master"
  Warning  Failed     12s               kubelet            Error: ImagePullBackOff
  Normal   Pulling    0s (x2 over 13s)  kubelet            Pulling image "gitlab.local:5050/anthonybudd/website:master"
  Warning  Failed     0s (x2 over 13s)  kubelet            Failed to pull image "gitlab.local:5050/anthonybudd/website:master": rpc error: code = Unknown desc = failed to pull and unpack image "gitlab.local:5050/anthonybudd/website:master": failed to resolve reference "gitlab.local:5050/anthonybudd/website:master": failed to do request: Head "https://gitlab.local:5050/v2/anthonybudd/website/manifests/master": tls: failed to verify certificate: x509: certificate signed by unknown authority
  Warning  Failed     0s (x2 over 13s)  kubelet            Error: ErrImagePull
```

This is because we are using a self-signed cert on GitLab. 

We can fix this by adding the self signed .crt file to our trust store.

```
[GitLab Node] cat /etc/gitlab/ssl/gitlab.local.crt 
-----BEGIN CERTIFICATE-----
MIIEADCCAuigAwIBAgIUUewxBRQiVhwq/OATC/JBVGLGtNkwDQYJKoZIhvcNAQEL
...
uyrPmdQ04E6sqfwHUPvtDxxceqzgVS2J0MISbGKa3uDxyQneJnysliILDhNyO/Fg
eSidLK9LN0iPX+GKIL06ieAdSZs=
-----END CERTIFICATE-----


[Node 1] sudo nano /usr/local/share/ca-certificates/gitlab.local.crt
**Paste .crt**

[Node 1] update-ca-certificates
```


# It Works 🎉

<img height="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/test-deployment.jpg">

<small>You have no idea how long that took me to resolve</small>