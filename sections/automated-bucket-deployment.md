# Automated Bucket Deployment

When a user creates a bucket we will want the bucket to be created automatically with out any human input.

To achieve this we will make a standardized kubernetes config file and apply 


Create a new repo called automation-test and copy all of the files from `/automation-test`. Commit the files to trigger a build in GitLab CI/CD.

```
automation-test/
├─ .gitlab-ci.yml
├─ Dockerfile
├─ bucket.yml
```

We will need to expose our storage clusters config file to a pod inside the prod cluster. We can do this with a secret.

```
[Console] kubectl --kubeconfig=.kube/config create secret generic storage-cluster-config --from-file=.kube/storage-config
```


Once the repo has compiled and an image has been added to our container registry deploy the container to our prod cluster.

```
[Console] kubectl --kubeconfig=.kube/config apply -f ./automation-test/deployment.yml

[Console] kubectl --kubeconfig=.kube/config get pods                                                    
NAME                                          READY   STATUS    RESTARTS   AGE
automation-test-deployment-dcfff496f-hhlcp   1/1     Running   0          2m
```

Once the pod is running, use `sed` to edit the palceholder values in `bucket.yml` to what you would like your bucket to be called. For this example I have called this bucket `test-bucket-100424-211606`

```
[Console] kubectl --kubeconfig=.kube/config exec -ti automation-test-deployment-dcfff496f-hhlcp -- /bin/bash -c "sed -i 's/XXX/test-bucket-100424-211606/g' /root/bucket.yml"
```

Use `kubectl exec` to call `kubectl` from inside the container.
```
[Console] kubectl --kubeconfig=.kube/config exec -ti automation-test-deployment-dcfff496f-hhlcp -- kubectl --kubeconfig=/root/config/storage-config apply -f /root/bucket.yml

namespace/test-bucket-100424 created
pod/test-bucket-100424-pod created
service/test-bucket-100424-svc created
ingress.networking.k8s.io/test-bucket-100424-ing created
persistentvolumeclaim/test-bucket-100424-pvc created
```

In Longhorn UI we should be able to see that a new volume has been created
<img height="400" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/test-bucket-longhorn.png">
<img src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/test-bucket-longhorn-volume.png">


# Success!
When we go to `test-bucket-100424-211606.minio.local` we should be greeted by the Minio login screen. You can login with `root / password`. 

You can change the login details by editing the env vars `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` in [bucket.yml](automation-test/bucket.yml)

This demonstrates that we can create new buckets for our users on our storage cluster programmatically.

<img height="400" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/test-bucket.png">