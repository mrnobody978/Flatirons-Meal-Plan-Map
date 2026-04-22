const {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    DeleteObjectCommand,
    DeleteBucketCommand,
    paginateListObjectsV2,
    GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { fromEnv } = require("@aws-sdk/credential-providers")

const client = new S3Client({
    credentials: fromEnv(),
    region: "us-east-2"
});

const bucketName = `flatirons-meal-plan-map`;
async function uploadUserImage(imgName, imgFile) {
    await client.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: `${imgName}`,
            Body: imgFile
        })
    );
}

async function removeUserImage(imgName) {
    await client.send(
        new DeleteObjectCommand({
            Bucket: bucketName, 
            Key: `${imgName}`
        })
    );
}

// Image URL is https://flatirons-meal-plan-map.s3.us-east-2.amazonaws.com/USER_ID.EXTENSION
// For example, profile.png is https://flatirons-meal-plan-map.s3.us-east-2.amazonaws.com/profile.png

module.exports = { uploadUserImage, removeUserImage }