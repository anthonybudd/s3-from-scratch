# Console
The console will be the primaryy deveice for working wth the infratsurue

USB netwokr, securty reasons

Whenever you are not working with the infrastrutre unplug the power and disconnect the netowk adpert ftom the MacBook

### MacBook Set-up
Do a standard MacBook Pro set-up.

- Update to latest version of MacOS
- Set-up full disk encryption
- Enable firewall
- Enable SSH - system prefernce -> secuity -> check "Remote login"
- Confirm SSH is allowed by the firewall
- Install Xcode

Additionally you should
- Disable wifi
- Prevent sleep while pluggedin

### SSH
From your work computer SSH into the console to confirm everything is set-up correctly. 
```
[Work] ssh Console@10.0.0.XXX
```

Copy your SSH ID to the console so we can use public key authentication
```sh
[Work] ssh-copy-id Console@10.0.0.XXX
```

SSH back into the console, this should not ask for a password.
```sh
[Work] ssh Console@10.0.0.XXX
```

### Install Homebrew
```sh
[Console] /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Source: [https://brew.sh/](https://brew.sh/)

### Install Ansible
[Console] `brew install ansible`

### Install Kubectl
[Console] `brew install kubectl`

### Install Pass
Pass is a CLI password manager, we will use this to securley manage the secrets for the infrastructure.
[Console] `brew install pass`
Source: [https://www.passwordstore.org/](https://www.passwordstore.org/)

We can create passwords now using the folling command
```bash
pass generate node1/root 15
AccIEuEvvTXNgaQ
```

### Alias & ENV
To make life easier, add an environment variable and an alias command for each of the nodes in your infrastructure.

[Console] `nano ~/.zshrc`


```
export SSHN1=10.0.0.XXX
alias sshn1="ssh node@$SSHN1"

export SSHN2=10.0.0.XXX
alias sshn2="ssh node@$SSHN2"
...
```


