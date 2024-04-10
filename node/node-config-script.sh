#!/bin/bash

# Update
sudo apt update -y
sudo apt full-upgrade -y

# open-iscsi
read -p $'\n[+] Install open-iscsi? ' openiscsi
if [ "$openiscsi" = 'y' ] || [ "$openiscsi" = 'yes' ] ; then
    sudo apt-get install -y -qq open-iscsi 
fi


# Fail2Ban - https://pimylifeup.com/raspberry-pi-fail2ban/
read -p $'\n[+] Install Fail2Ban? ' fail2ban
if [ "$fail2ban" = 'y' ] || [ "$fail2ban" = 'yes' ] ; then
    sudo apt install -y fail2ban
    sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

    # sudo nano /etc/fail2ban/jail.local
    # [sshd]
    # enabled = true
    # filter = sshd
    # banaction = iptables-multiport
    # bantime = -1
    # maxretry = 3

    sudo service fail2ban restart
fi

# SSH CONFIG
read -p $'\n[+] Configuring SSH? ' ssh
if [ "$ssh" = 'y' ] || [ "$ssh" = 'yes' ] ; then
    sudo sed -i '/^#PermitRootLogin/s/.*/PermitRootLogin no/' /etc/ssh/sshd_config 
    sudo sed -i '/^#MaxAuthTries/s/.*/MaxAuthTries 2/' /etc/ssh/sshd_config 
    sudo sed -i '/^#MaxSessions/s/.*/MaxSessions 2/' /etc/ssh/sshd_config 
    sudo sed -i '/^UsePAM/s/.*/UsePAM no/' /etc/ssh/sshd_config 
    sudo sed -i '/^ChallengeResponseAuthentication/s/.*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config 
    sudo sed -i '/^#PasswordAuthentication/s/.*/PasswordAuthentication no/' /etc/ssh/sshd_config 
    sudo sed -i '/^#PermitEmptyPasswords/s/.*/PermitEmptyPasswords no/' /etc/ssh/sshd_config   
    echo $'\n[+] Reloading SSH'
    /etc/init.d/ssh reload
fi

echo $'\n[+] Config Complete!'