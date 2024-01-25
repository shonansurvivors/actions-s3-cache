# actions-s3-cache

This action installs dependencies or builds, and caches them in S3.

## Usage

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: shonansurvivors/actions-s3-cache@v1.0.1
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      AWS_DEFAULT_REGION: us-east-1
    with:
      s3-bucket: your-s3-bucket-name # required
      cache-key: npm-v1-${{ hashFiles('laravel/package-lock.json') }} # required ('.zip' is unnecessary)
      paths: node_modules # required 
      command: npm ci # required
      zip-option: -ryq # optional (default: -ryq)
      unzip-option: -n # optional (default: -n)
      working-directory: laravel # optional (default: ./)
      cache-hit-skip: false # optional (defaultL: false) set to true will skip run command when cache hit
```

## IAM Policy Example

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
            ],
            "Resource": [
                "arn:aws:s3:::your-s3-bucket-name",
                "arn:aws:s3:::your-s3-bucket-name/*"
            ]
        }
    ]
}
```
## License

[MIT License](https://github.com/shonansurvivors/actions-s3-cache/blob/master/LICENCE) - Copyrights (c) 2020 shonansurvivors
