---
title: How to <do the thing> with <tool>
labels: AWS, Tutorial
level: Beginner
time: 15 min
tested: 2026-10-01
stack: Terraform 1.9, AWS CLI 2.17
region: us-east-1
prerequisites: An AWS account; AWS CLI installed and configured; Basic terminal knowledge
build: A <describe the result> you can reuse in your own projects.
---

# How to <do the thing> with <tool>

One or two sentences: the problem, who it is for, and what they will have at the end.

## Why this matters

Short context. Link to the official docs rather than repeating them.

## Step by step

::: steps
1. First action, with the exact command below.
2. Second action.
3. Third action.
:::

```bash title="deploy.sh" open
set -euo pipefail
aws s3 mb s3://<BUCKET_NAME> --region <REGION>
```

> [!WARNING] Replace every `<PLACEHOLDER>`. Never paste real account IDs, keys or tokens.

## Verify it worked

```bash
aws s3 ls
```

## Troubleshooting

::: details Error: AccessDenied
Check the IAM policy attached to your role and that you are in the right region.
:::

## Clean up

Delete what you created so it does not cost money.

> [!SUCCESS] Done. Next: link to the next post in the series.
