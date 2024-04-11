# Deploy




kubectl --kubeconfig=.kube/config create namespace s3-api
namespace/s3-api created
[Console]:~> kubectl --kubeconfig=.kube/config apply -f db.yml        
service/s3-db created
deployment.apps/s3-db created




----

Find & Replace (case-sensaive, whole repo): "s3-api" => "your-api-name" 

Save kubeconfig.yml to root of repo


### Namespace
Create a namespace
`kubectl --kubeconfig=./kubeconfig.yml create namespace s3-api`


### JWT
```
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
kubectl --kubeconfig=.kube/config --namespace=s3-api create secret generic s3-api-jwt-secret \
    --from-file=./private.pem \
    --from-file=./public.pem
rm ./private.pem ./public.pem 
```


### Secrets
Make a new secrets config file
`cp secrets.example.yml secrets.yml`

__Add Secrets in Base64__
Hint: `echo -n 'my-secret-string' | base64`

Create the secrets
`kubectl --kubeconfig=./kubeconfig.yml apply -f ./k8s/secrets.yml`


### Build & Push Container Image
```
docker buildx build --platform linux/amd64 --push -t registry.digitalocean.com/s3-api/app:latest
```

### Create Deployment
```
kubectl --kubeconfig=./kubeconfig.yml apply -f ./k8s/api.deployment.yml
kubectl --kubeconfig=./kubeconfig.yml apply -f ./k8s/api.service.yml
```

### Deploy
```
docker buildx build --platform linux/amd64 --push -t registry.digitalocean.com/s3-api/app:latest . && 
kubectl --kubeconfig=./kubeconfig.yml rollout restart deployment s3-api && \
kubectl --kubeconfig=./kubeconfig.yml get pods -w
```


### Migrate
Migrate the DB
```
export POD="$(kubectl --kubeconfig=kubeconfig.yml --namespace=s3-api get pods --field-selector=status.phase==Running --no-headers -o custom-columns=":metadata.name")"
kubectl --kubeconfig=./kubeconfig.yml --namespace=s3-api exec -ti $POD -- /bin/bash -c 'sequelize db:migrate:undo:all && sequelize db:migrate && sequelize db:seed:all'
```

### SSL
ReadMore: https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes

```
kubectl --kubeconfig=./kubeconfig.yml apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/do/deploy.yaml

kubectl --kubeconfig=./kubeconfig.yml get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --watch

kubectl --kubeconfig=./kubeconfig.yml apply -f ./k8s/api.ingress.yml

kubectl --kubeconfig=./kubeconfig.yml apply -f https://github.com/jetstack/cert-manager/releases/download/v1.7.1/cert-manager.yaml

kubectl --kubeconfig=./kubeconfig.yml get pods --namespace cert-manager

kubectl --kubeconfig=./kubeconfig.yml create -f k8s/prod-issuer.yml
```

### Useful K8S commands
##### Set $POD as the name of the pod in K8s
`export POD="$(kubectl --kubeconfig=kubeconfig.yml --namespace=s3-api get pods --field-selector=status.phase==Running --no-headers -o custom-columns=":metadata.name")"`

##### Execute bash script inside running container
`kubectl --kubeconfig=kubeconfig.yml exec -ti $POD -- /bin/bash -c "sequelize db:migrate"`

##### Get logs for $POD
`kubectl --kubeconfig=kubeconfig.yml logs $POD`

##### Create a cron job
`kubectl --kubeconfig=kubeconfig.yml create job --from=cronjob/s3-api-cron-job s3-api-cron-job`

##### Delete all faild cron jobs
`kubectl --kubeconfig=kubeconfig.yml delete jobs --field-selector status.successful=0`
