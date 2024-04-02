# GitLab

First you will need to build a single node. Flash the SD card with a copy of 32-bit Raspberry Pi OS 11 (bullseye). At time of writing, GitLab-CE is not supported on later versions of Raspberry Pi OS or running on a 64-bit OS. Set the hostname to `gitlab`.
<img width="300" src="https://raw.githubusercontent.com/anthonybudd/anthonybudd/master/img/gitlab-32-bit.png">
[https://about.gitlab.com/install/#raspberry-pi-os](https://about.gitlab.com/install/#raspberry-pi-os)

From the console SSH into the GitLab node using your password. 
[Console] `ssh gitlab@10.0.0.XXX` 

If you connect succesfully, add the console's key to authorized key file onto the GitLab node for passwordless access.
[Console] `ssh-copy-id gitlab@10.0.0.XXX` 

Hint: Save the root password for the GitLab node in pass 
[Console] `pass insert gitlab`


_AB: Firewall?_


### Installing GitLab
Run the below commands to install GitLab.
```sh
sudo apt update
sudo apt-get install -y curl openssh-server ca-certificates apt-transport-https perl
curl https://packages.gitlab.com/gpg.key | sudo tee /etc/apt/trusted.gpg.d/gitlab.asc
sudo curl -sS https://packages.gitlab.com/install/repositories/gitlab/raspberry-pi2/script.deb.sh | sudo bash
sudo EXTERNAL_URL="https://gitlab.local" apt-get install gitlab-ce
```

_AB: More on securing gitlab?_
_AB:_ https://docs.gitlab.com/ee/security/index.html


### Set-up
From your dev machine you should be able to access gitlab at https://gitlab.local

You can get the root password by running this command on the GitLab node.
[GitLab Node] `sudo cat /etc/gitlab/initial_root_password`

Use pass to generate a new password and update the GitLab root account with the new password.
[Console] `pass generate gitlab/gitlab-app-root 30`


### Runners
We will need to use GitLabs CI/CD feature to compile our code and deploy it. I am experimenting using GitLab to trigger the rollout of the deployment in K3s. I think the best solution would be to use ArgoCD but I want to get the whole thing working first then I will address CD.

Install gitlab-runner
```sh
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt-get install gitlab-runner
```
Source: [https://docs.gitlab.com/runner/install/linux-repository.html#installing-gitlab-runner](https://docs.gitlab.com/runner/install/linux-repository.html#installing-gitlab-runner)

Install docker on the GitLab node
```sh
sudo apt update && sudo apt upgrade -y
curl -sSL https://get.docker.com | sh
```
Source: (https://docs.docker.com/engine/install/raspberry-pi-os/)[https://docs.docker.com/engine/install/raspberry-pi-os/]

Because we are using a local GitLab instance `gitlab-runner register` will produce the error.
```
x509: certificate signed by unknown authority
```

To get around this we will need to create our own self signed certificate and pass the path to ther .crt file to the register command with `--tls-ca-file`
Source: [https://docs.gitlab.com/runner/configuration/tls-self-signed.html](https://docs.gitlab.com/runner/configuration/tls-self-signed.html)
```sh
apt-get install -y openssl ca-certificates

cd /etc/gitlab/ssl/
openssl req -nodes -x509 -sha256 -key gitlab.local.key -out gitlab.local.crt -days 356 -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=gitlab.local" -addext "subjectAltName = DNS:localhost,DNS:gitlab.local"
```

Now register the runner with GitLab
```sh
gitlab-runner register \
      --non-interactive \
      --registration-token YOUR_TOKEN \
      --url https://gitlab.local/ \
      --executor docker \
      --tls-ca-file /etc/gitlab/ssl/gitlab.local.crt
```

Finally GitLab runner with
[GitLab Node] `sudo gitlab-runner run --config /home/gitlab/.gitlab-runner/config.toml`
