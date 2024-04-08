# GitLab

First you will need to build a single node. Flash the SD card with a copy of 32-bit Raspberry Pi OS 11 (bullseye). At time of writing, GitLab-CE is not supported on later versions of Raspberry Pi OS or running on a 64-bit OS. Set the hostname to `gitlab`.
<img width="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/gitlab-32-bit.png?v=1">

Source: [https://about.gitlab.com/install/#raspberry-pi-os](https://about.gitlab.com/install/#raspberry-pi-os)

### Hint: Add `arm_64bit=0` to config.txt
For some insane reason when you select 32-bit Raspberry Pi OS in Raspberry Pi imager you actually get [a 32-bit userland on top of a 64-bit kernel.](https://github.com/raspberrypi/rpi-imager/issues/847#issuecomment-2035800759) This will cause issues with GitLab runner later.

- [gitlab-org/gitlab-runner issue:37336](https://gitlab.com/gitlab-org/gitlab-runner/-/issues/37336)
- [raspberrypi/rpi-imager issue:847](https://github.com/raspberrypi/rpi-imager/issues/847)
- [R Pi Docs: arm_64bit](https://www.raspberrypi.com/documentation/computers/config_txt.html#arm_64bit)

Insert the SD card and boot the pi. From the console SSH into the GitLab node using your password. 
```[Console] ssh gitlab@10.0.0.XXX```

If you connect successfully, add the console's key to authorized key file onto the GitLab node to enable passwordless public-key authentication.
```[Console] ssh-copy-id gitlab@10.0.0.XXX```

Hint: Save the root password for the GitLab node in pass 
```[Console] pass insert gitlab```

### Hint: Make an alias
```
[Console] nano ~/.zshrc

export GLIP=10.0.0.175
alias sshgl="ssh gitlab@$GLIP"
```

_AB: Firewall Settings?_


### Installing GitLab
Run the below commands to install GitLab.
```sh
[GitLab Node] sudo apt update && sudo apt upgrade -y
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
```[GitLab Node] sudo cat /etc/gitlab/initial_root_password```

Use pass to generate a new password and update the GitLab root account with the new password.
```[Console] pass generate gitlab/gitlab-app-root 30```

### Create a new user
Create a new user by going to __Admin Area -> Overview -> Users -> New user__

Becasue we have not set-up internet we will need to set this users password using the CLI

```[GitLab Node] sudo gitlab-rake "gitlab:password:reset[sidneyjones]"```
__Hint:__ This command might hang for 5mins before it prompts you to enter a password. IDK why this happens.


### GitLab Runner
We will need to use GitLabs CI/CD feature to compile our code and deploy it. I am experimenting using GitLab to trigger the rollout of the deployment in K3s. I think the best solution would be to use ArgoCD but I want to get the whole thing working first then I will address CD.

First, install docker on the GitLab node
```sh
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/raspbian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Set up Docker's APT repository:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/raspbian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo docker run hello-world
```
Source: [https://docs.docker.com/engine/install/raspberry-pi-os/](https://docs.docker.com/engine/install/raspberry-pi-os/)

#### Linux Post-install
```sh
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
docker run hello-world
```
Source: [https://docs.docker.com/engine/install/linux-postinstall/](https://docs.docker.com/engine/install/linux-postinstall/)


Next, install gitlab-runner on the GitLab node
```sh
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt-get install -y gitlab-runner
```
Source: [https://docs.gitlab.com/runner/install/linux-repository.html#installing-gitlab-runner](https://docs.gitlab.com/runner/install/linux-repository.html#installing-gitlab-runner)


### Create Runner
Create a new GitLab runner by going to __Admin Area -> CI/CD -> Runners -> New instance runner__

Make a note of the token, you will need this to register the runner.

<img width="600" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/new-gitlab-runner.jpg">



Because we are using a local GitLab instance `gitlab-runner register` will produce the error.
```
x509: certificate signed by unknown authority
```

To get around this we will need to create our own self signed certificate and pass the path to ther .crt file to the register command with `--tls-ca-file`
```sh
apt-get install -y openssl ca-certificates

cd /etc/gitlab/ssl/

sudo mv gitlab.local.key /tmp
sudo mv gitlab.local.crt /tmp

openssl req -nodes -new -x509 -sha256 -keyout gitlab.local.key -out gitlab.local.crt -days 356 -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=gitlab.local" -addext "subjectAltName = DNS:localhost,DNS:gitlab.local"
```
Source: [https://docs.gitlab.com/runner/configuration/tls-self-signed.html](https://docs.gitlab.com/runner/configuration/tls-self-signed.html)

Register the runner with GitLab
```sh
gitlab-runner register \
      --non-interactive \
      --token TOKEN_HERE \
      --url https://gitlab.local/ \
      --executor docker \
      --tls-ca-file /etc/gitlab/ssl/gitlab.local.crt
```

Finally start GitLab runner with
```[GitLab Node] sudo gitlab-runner run --config /etc/gitlab-runner/config.toml```

### Add `network_mode = "host"` to config.toml
Because we are using a local instance of GitLab you will need to add `network_mode = "host"` to the `[runners.docker]` section of the GitLab config file located at `/etc/gitlab-runner/config.toml`

```toml
concurrent = 1
check_interval = 0
shutdown_timeout = 0

[session_server]
  session_timeout = 1800
[[runners]]
  name = "gitlab"
  url = "https://gitlab.local"
  id = 1
  token = "TOKEN_HERE"
  tls-ca-file = "/etc/gitlab/ssl/gitlab.local.crt"
  executor = "docker"
  [runners.cache]
    MaxUploadedArchiveSize = 0
  [runners.docker]
    ...
    network_mode = "host"
    ...
```
Source: [https://gitlab.com/gitlab-org/gitlab-runner/-/issues/305](https://gitlab.com/gitlab-org/gitlab-runner/-/issues/305)


### Create a test repo
Log-out of the root GitLab account and login as your user account.

Create a new repo called `test`.

Using the web UI add a file called `.gitlab-ci.yml` and add the below to the file.
```
stages:
  - build

build-job:
  stage: build
  script:
    - echo "Compiling the code..."
    - pwd
    - ls
```

This should trigger a build job. In the sidebar go to __Build -> Jobs__ and open the latest job. You should see that the `script` section in the ci file has successfully been called inside the repo. This shows that GitLab and GitLab runner are working as expected. You can delete the test repo.

<img width="600" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/gitlab-job.jpg">
