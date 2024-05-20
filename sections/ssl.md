# SSL

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/baremetal/deploy.yaml

```sh
helm --kubeconfig=.kube/storage-config repo add jetstack https://charts.jetstack.io --force-update

helm --kubeconfig=.kube/storage-config repo update

helm --kubeconfig=.kube/storage-config install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.14.4 \
  --set installCRDs=true

NAMESPACE: cert-manager
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
cert-manager v1.14.4 has been deployed successfully!

In order to begin issuing certificates, you will need to set up a ClusterIssuer
or Issuer resource (for example, by creating a 'letsencrypt-staging' issuer).

More information on the different types of issuers and how to configure them
can be found in our documentation:

https://cert-manager.io/docs/configuration/

For information on how to configure cert-manager to automatically provision
Certificates for Ingress resources, take a look at the `ingress-shim`
documentation:

https://cert-manager.io/docs/usage/ingress/


kubectl --kubeconfig=.kube/storage-config -n cert-manager get pods

NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-cainjector-58c4f6d945-8thcs   1/1     Running   0          3m43s
cert-manager-5bfc55c5c6-zhmvs              1/1     Running   0          3m43s
cert-manager-webhook-7bd66d5b9c-dlqdr      1/1     Running   0          3m43s
```

kubectl --kubeconfig=.kube/storage-config get Issuers,ClusterIssuers,Certificates,CertificateRequests,Orders,Challenges --all-namespaces

kprod

```sh
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
  namespace: cert-manager
spec:
  acme:
    # The ACME server URL
    server: https://acme-v02.api.letsencrypt.org/directory
    # Email address used for ACME registration
    email: your_email_address_here
    # Name of a secret used to store the ACME account private key
    privateKeySecretRef:
      name: letsencrypt-prod
    # Enable the HTTP-01 challenge provider
    solvers:
    - http01:
        ingress:
          class: traefik
```

[VPN] apt install -y libnginx-mod-stream

[VPN] apt-get install nginx-extras


nano /etc/nignx/nginx.conf

stream {
  server {
    listen     443;
    proxy_pass 10.8.0.3:443;
  }
}
