# SSL

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/baremetal/deploy.yaml


helm repo add jetstack https://charts.jetstack.io --force-update

helm repo update

helm --kubeconfig=.kube/config install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.14.4 \
  --set installCRDs=true

  kubectl get Issuers,ClusterIssuers,Certificates,CertificateRequests,Orders,Challenges --all-namespaces
kprod



[VPN] apt install -y libnginx-mod-stream

[VPN] apt-get install nginx-extras


nano /etc/nignx/nginx.conf

stream {
  server {
    listen     443;
    proxy_pass 10.8.0.3:443;
  }
}
