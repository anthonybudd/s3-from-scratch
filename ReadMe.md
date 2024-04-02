# S3 From Scratch

<p align="center">
  <img width="300" src="https://raw.githubusercontent.com/anthonybudd/anthonybudd/master/img/s3.png">
</p>

For the past few years I’ve been thinking about how I could build SaaS and deploy it on my own infrastructure without needing to use any cloud platforms like AWS or GCP. In this repo I document my progress on building a clone of AWS S3 that functions the same as S3 (automated bucket deployment, dynamically expanding volumes, security, etc) using an exclusively open-source technology stack.

<p align="center">
  <img width="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/img/infrastructure.png">
</p>

### Contents
- [Console](./console/ReadMe.md)
- [Nodes](./node/ReadMe.md)
- [Network](./network/ReadMe.md)
- [Source Control](./gitlab/ReadMe.md)
- [K3s - Production Cluster](./k3s/production-cluster.md)
- [K3s - Storage Cluster](./k3s/storage-cluster.md)

### Notes
Because this is still very much a work-in-progress you will see my notes "_AB:_" throughout, please ignore.

You will need to SSH into multiple devices simaltanioulsy I have added an annotation (ecample:`[Console]`) to all commands in this repo, to show where you should be exeuting each command. Generally you will see `[Dev]`, `[Console]` and `[Node X]`


### Technical Overview

#### [Console](./console/ReadMe.md)
<img height="200" align="right" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/console.png">
We will need a "console" so we can locally interact with the infrastructure. I have tried using a Raspberry Pi with a monitor and keyboard attached but I have found that using an old MacBook Pro works best for this. In this section I explain how to set-up the console so you can use it to store secrets, manage the network, provision K3s clusters and deploy pods.

#### [Node](./node/ReadMe.md)
<img height="200" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/node.png">

Since this project needs to be "Enterprise-grade" we need a distinct and replicable compute unit which I call a "node". A node is a Raspberry Pi with a 1TB SSD and POE hat. I have also 3D printed a rack-mount solution for easy install into the rack. 

#### [Network](./network/ReadMe.md)

#### [Source Control](./gitlab/ReadMe.md)
We will need a way to store the code for the landing website, the front-end app and the back-end REST API. We  will also need CI/CD to compile the code and deploy it into our infrastructure. GitLab will work perfectly for these two tasks.

#### Automation
When you create an S3 bucket on AWS, everything is automated, there isn’t a devops guy in a datacenter somewhere typing out CLI commands to get your bucket scheduled. My project must also work the same way, when a user wants to create a resource it must not require any human input to provision and deploy the bucket.

#### Resource Utilization
Due to the scale of AWS it would not be financially practical to give each user their own dedicated server hardware, instead the hardware is virtualized, allowing multiple tenants to share a single physical CPU. Similarly it would not be practical to assign a whole node and SSD to each bucket, to maximize resource utilization my platform must be able to allow multiple tenants to share the pool of SSD storage space available. In addition, AWS S3 buckets can store an unlimited amount of data, so my platform will also need to allow a user to have a dynamically increasing volume that will auto-scale based on the storage space required.

