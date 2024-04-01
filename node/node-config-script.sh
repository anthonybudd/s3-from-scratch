#!/bin/bash

# Update
read -p $'\n[+] Update? ' update
if [ "$update" = 'y' ] || [ "$update" = 'yes' ] ; then
    sudo apt update -y
    sudo apt full-upgrade -y
fi

# open-iscsi
read -p $'\n[+] Install open-iscsi? ' openiscsi
if [ "$openiscsi" = 'y' ] || [ "$openiscsi" = 'yes' ] ; then
    sudo apt-get install -y -qq open-iscsi 
fi



# Enable cpuset
# read -p $'\n[+] Enabling cpuset? ' cpuset
# if [ "$cpuset" = 'y' ] || [ "$cpuset" = 'yes' ] ; then
#     sudo echo "cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory $(sudo cat /boot/firmware/cmdline.txt)" > /boot/firmware/cmdline.txt
# fi

# Disable WiFi & BT
# read -p $'\n[+] Disable WiFi & BT? ' disablewifi
# if [ "$disablewifi" = 'y' ] || [ "$disablewifi" = 'yes' ] ; then
#     sudo echo "dtoverlay=disable-wifi" > /boot/firmware/config.txt
#     sudo echo "dtoverlay=disable-bt" > /boot/firmware/config.txt
# fi


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


# fstab
read -p $'\n[+] Configure /etc/fstab?' fstab
if [ "$fstab" = 'y' ] || [ "$fstab" = 'yes' ] ; then
    blkid
    echo ""
    echo ""
    echo "Enter device UUID: "
    read -p "UUID: " UUID
    sudo echo "UUID=c8a05035-2d59-408b-94e6-8aa5a2be6da5   /media/SSD  exfat   defaults,nofail  0   0" >> /etc/fstab
    echo ""
    echo $'\n[+] cat /etc/fstab'
    cat /etc/fstab
    echo ""
    echo ""
fi

echo $'\n[+] Config Complete!'
echo $'\nRun: sudo reboot'