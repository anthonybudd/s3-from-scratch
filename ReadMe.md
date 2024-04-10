# S3 From Scratch

<p align="center">
  <img width="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/s3.png">
</p>

For the past few years I’ve been thinking about how I could build SaaS and deploy it on my own infrastructure without needing to use any cloud platforms like AWS or GCP. In this repo I document my progress on building a clone of AWS S3 that functions the same as S3 (automated bucket deployment, dynamically expanding volumes, security, etc) using an exclusively open-source technology stack.

<p align="center">
  <img src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/infrastructure.png?v=4">
</p>

### Sections
- [Console](./sections/console.md)
- [Nodes](./sections/node.md)
- [Source Control: GitLab](./sections/gitlab.md)
- [K3s: Production Cluster](./sections/production-cluster.md)
- [Deploying From GitLab Registry To Prod K3s Cluster](./sections/deploying-from-gitlab-to-k3s.md)
- [K3s: Storage Cluster](./sections/storage-cluster.md)
<!-- - [Networking](./sections/networking.md) -->

### Notes
You will need to SSH into multiple devices simultaneously I have added an annotation (example: `[Console] nano /boot/config.txt`) to all commands in this repo, to show where you should be executing each command. Generally you will see `[Dev]`, `[Console]` and `[Node X]`.

Because this is still very much a work-in-progress you will see my notes in italics "_AB:_" throughout, please ignore.

### Technical Overview

#### [Console](./sections/console.md)
<img height="200" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/console-close-up.png">
We will need a "console" so we can locally interact with the infrastructure. I have tried using a Raspberry Pi with a monitor and keyboard attached but I have found that using an old MacBook Pro works best for this. In this section I explain how to set-up the console so you can use it to store secrets, manage the network, provision K3s clusters and deploy pods.

#### [Node](./sections/node.md)
<img height="200" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/node.png">

Since this project needs to be "Enterprise-grade" we need a distinct and replicable compute unit which I call a "node". A node is a Raspberry Pi with a 1TB SSD and POE hat. I have also 3D printed a rack-mount solution for easy install into the rack. 

#### [Networking](./sections/networking.md)
<img height="75" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/openwrt.png">
We will need a network for the nodes to communicate. For the a router I have chosen OpenWRT. This allows me to use a Raspberry Pi with a USB 3.0 Ethernet adapter so it can work as as a router between the internet and the “datacenter”.

#### [Source Control](./sections/gitlab.md)
<img height="75" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/gitlab-logo.svg">
We will need a way to store the code for the landing website, the front-end app and the back-end REST API. We  will also need CI/CD to compile the code and deploy it into our infrastructure. GitLab will work perfectly for these two tasks.

#### Automation
When you create an S3 bucket on AWS, everything is automated, there isn’t a human in a datacenter somewhere typing out CLI commands to get your bucket scheduled. This project must also work the same way, when a user wants to create a resource it must not require any human input to provision and deploy the bucket.

#### Resource Utilization
Due to the scale of AWS it would not be financially practical to give each user their own dedicated server hardware, instead the hardware is virtualized, allowing multiple tenants to share a single physical CPU. Similarly it would not be practical to assign a whole node and SSD to each bucket, to maximize resource utilization my platform must be able to allow multiple tenants to share the pool of SSD storage space available. In addition, AWS S3 buckets can store an unlimited amount of data, so my platform will also need to allow a user to have a dynamically increasing volume that will auto-scale based on the storage space required.

