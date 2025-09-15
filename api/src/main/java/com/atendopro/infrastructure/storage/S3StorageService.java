package com.atendopro.infrastructure.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.net.URL;
import java.time.Duration;

@Service
public class S3StorageService {
    private final S3Client s3;
    private final String bucket;

    public S3StorageService(@Value("${aws.s3.region}") String region, @Value("${aws.s3.bucket}") String bucket) {
        this.s3 = S3Client.builder().region(Region.of(region)).credentialsProvider(DefaultCredentialsProvider.create()).build();
        this.bucket = bucket;
    }

    public void upload(String key, byte[] bytes, String contentType) {
        s3.putObject(PutObjectRequest.builder().bucket(bucket).key(key).contentType(contentType).build(), software.amazon.awssdk.core.sync.RequestBody.fromBytes(bytes));
    }

    public URL presignedGet(String key) {
        var presigner = software.amazon.awssdk.services.s3.presigner.S3Presigner.create();
        var req = GetObjectRequest.builder().bucket(bucket).key(key).build();
        var pres = presigner.presignGetObject(b -> b.getObjectRequest(req).signatureDuration(Duration.ofMinutes(10)));
        return pres.url();
    }
}