const { S3Client, ListObjectsV2Command, PutObjectCommand } = require("@aws-sdk/client-s3");

const Bucket = 'kjdoewl';
const Namespace = 'gdiwk';
const accessKeyId = "kUoZRWyhUae7tFZNduTS";
const secretAccessKey = "qxYIqD/8WnvWYIkY7Rg7PSqSMrnxcVfBdpWgzz7z";

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
