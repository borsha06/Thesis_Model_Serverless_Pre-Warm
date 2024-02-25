package serverless.modelcreator.model;

public class S3 extends Node{
    private String bucketName = "";

    public S3() {
    }

    public S3(String nameOfNode) {
        this.setName(nameOfNode);
    }

    public void setBucketName(String bucketName) {
        this.bucketName = bucketName;

    }

    public String getBucketName() {
        return bucketName;
    }

    @Override
    public String toString() {
        String output = super.toString();
        output += "Bucket name: " + this.bucketName + System.lineSeparator();
        return output;
    }

}
