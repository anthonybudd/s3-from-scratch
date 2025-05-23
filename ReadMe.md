# S3 From Scratch

<p align="center">
  <img width="300" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/s3.png">
</p>

For the past few years I’ve been thinking about how I could build SaaS and deploy it on my own infrastructure without needing to use any cloud platforms like AWS or GCP. In this repo I document my progress on building a clone of AWS S3 that functions the same as S3 (automated bucket deployment, dynamically expanding volumes, security, etc) using an exclusively open-source technology stack.

- [Console](./sections/console.md)
- [Nodes](./sections/node.md)
- [Source Control: GitLab](./sections/gitlab.md)
- [K3s: Production Cluster](./sections/production-cluster.md)
- [Deploying From GitLab Registry To Local K3s Cluster](./sections/deploying-from-gitlab-to-k3s.md)
- [K3s: Storage Cluster](./sections/storage-cluster.md)
- [Automated Bucket Deployment](./sections/automated-bucket-deployment.md)
- [API](./api/ReadMe.md)
- [Frontend](./frontend/ReadMe.md)
- [Connecting to the Internet](./sections/internet.md)


### Live POC working with `@aws-sdk/client-s3`

<p align="center">
  <img width="500" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/live-demo.gif">
</p>

```js
const { S3Client, ListObjectsV2Command, PutObjectCommand } = require("@aws-sdk/client-s3");

const Bucket = 'BUCKET_NAME_HERE';
const Namespace = 'NAMESPACE_HERE';
const accessKeyId = "xxxxxxxxxxxxxxxxxxxx";
const secretAccessKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

(async function () {
    const client = new S3Client({
        region: 'us-west-2',
        endpoint: `https://${Bucket}.${Namespace}.s3.anthonybudd.io`,
        forcePathStyle: true,
        sslEnabled: true,
        credentials: {
            accessKeyId,
            secretAccessKey
        },
    });

    const Key = `${Date.now().toString()}.txt`;
    await client.send(new PutObjectCommand({
        Bucket,
        Key,
        Body: `The time now is ${new Date().toLocaleString()}`,
        ACL: 'public-read',
        ContentType: 'text/plain',
    }));
    console.log(`New object successfully written to: ${Bucket}://${Key}\n`);

    const { Contents } = await client.send(new ListObjectsV2Command({ Bucket }));
    console.log("Bucket Contents:");
    console.log(Contents.map(({ Key }) => Key).join("\n"));
})();
```

### Technical Overview
<p align="center">
  <img src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/infrastructure.png?v=4">
</p>

### [Node](./sections/node.md)
<img height="200" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/node.png">

Since this project needs to be "Enterprise-grade" we need a distinct and replicable compute unit that we can buy and build in bulk. I call this a "Node" which is a Raspberry Pi with a 1TB SSD and POE hat. I have also 3D printed a rack-mount solution (Source: [Merocle From UpTimeLabs](https://www.thingiverse.com/thing:4756812)) for easy install into a rack. 

### [Console](./sections/console.md)
<img height="200" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/console-close-up.png">

We will need a "console" so we can locally interact with the infrastructure. In the past I have tried using a Raspberry Pi with a monitor and keyboard attached but I have found that using an old MacBook Pro works best for this. In this section I explain how to set-up the console so you can use it to store secrets, manage the network, provision K3s clusters and deploy pods.

### [Frontend](./frontend/ReadMe.md)
<img height="250" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/frontend.gif">

This represents the AWS management console found at [aws.amazon.com/console](https://aws.amazon.com/console/). This is a Vue.js SPA that makes HTTP requests to the [S3 REST API](./api/ReadMe.md) for users to create, manage and delete their S3 buckets.


### [API](./api/ReadMe.md)
```sh
curl -X POST \
    -H 'Authorization: Bearer $JWT' \
    -H 'Content-Type: application/json' \
    -d '{ "name":"s3-test-bucket"}' \
    https://s3-api.anthonybudd.io/buckets
```

This API simulates the back-end of the AWS Console. A user can sign-up, login, create a bucket then delete the bucket.

### [Source Control](./sections/gitlab.md)
<img height="75" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/gitlab-logo.svg">

We will need a way to store the code for the landing website, the front-end ui and the back-end REST API. We  will also need CI/CD to compile the code and deploy it into our infrastructure. GitLab will work perfectly for these two tasks. This will allow us to commit code to the local GitLab instance, compile it into a Docker image, store the image in a repository and deploy from it directy into our local kubernetes cluster. 

### [Networking](./sections/networking.md)
<img height="75" src="https://raw.githubusercontent.com/anthonybudd/s3-from-scratch/master/_img/openwrt_.png">

We will need a network for the nodes to communicate. For the a router I have chosen OpenWRT. This allows me to use a Raspberry Pi with a USB 3.0 Ethernet adapter so it can work as a router between the internet and the datacenter.

### [Automation](./sections/automated-bucket-deployment.md)
When you create an S3 bucket on AWS, everything is automated, there isn’t a human in a datacenter somewhere typing out CLI commands to get your bucket scheduled. I want my project to work the same way, when a user wants to create a bucket it must not require any human input to provision and deploy it.

### [Resource Utilization](./sections/storage-cluster.md)
AWS doesn't give each user their own dedicated server with a hard drive attached, instead the hardware is virtualized, allowing multiple tenants to share a single physical CPU. Similarly it would not be practical to assign a whole node and SSD to each bucket, to maximize resource utilization my platform must be able to allow multiple tenants to share the pool of compute and SSD storage space available. In addition, AWS S3 buckets can store an unlimited amount of data, so my platform will also need to allow a user to have a dynamically increasing volume that will auto-scale based on the storage space required.


### Notes
You will need to SSH into multiple devices simultaneously I have added an annotation (example: `[Console] nano /boot/config.txt`) to all commands in this repo, to show where you should be executing each command. Generally you will see `[Console]` and `[Node X]`.

Because this is still very much a work-in-progress you will see my notes in italics "_AB:_" throughout, please ignore.