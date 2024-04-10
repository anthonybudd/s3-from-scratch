# Console
The console will be the device we use for interacting with the infrastructure.

_AB: USB networking, security reasons_

Whenever you are not working with the infrastructure unplug the power and disconnect the network adapter from the MacBook
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
- Prevent sleep while plugged-in

### SSH
From your work computer SSH into the console to confirm everything is set-up correctly. 

```
[Dev] ssh Console@10.0.0.XXX
```

Copy your SSH ID to the console so we can use public key authentication

```sh
[Dev] ssh-copy-id Console@10.0.0.XXX
```

SSH back into the console, this should not ask for a password.

```sh
[Dev] ssh Console@10.0.0.XXX
```

### Install Homebrew
```sh
[Console] /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Source: [https://brew.sh/](https://brew.sh/)

### Install Ansible
```[Console] brew install ansible```

### Install Kubectl
```[Console] brew install kubectl```

### Install Pass
Pass is a CLI password manager, we will use this to securley manage the secrets for the infrastructure.

```[Console] brew install pass```

Source: [https://www.passwordstore.org/](https://www.passwordstore.org/)

We can create passwords now using the following command
```bash
pass generate node1/root 15
AccIEuEvvTXNgaQ
```

### Alias & ENV
To make life easier, add an environment variable and an alias command for each of the nodes in your infrastructure.

```[Console] nano ~/.zshrc


export SSHN1=10.0.0.XXX
alias sshn1="ssh node@$SSHN1"

export SSHN2=10.0.0.XXX
alias sshn2="ssh node@$SSHN2"
...
```


