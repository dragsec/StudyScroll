export default {
  "aws-region-az": {
    prompt: "Trying to explain AWS geography without the usual boxes-and-arrows mess: is a Region made of Availability Zones, or is it the other way around?",
    answers: [
      "Picture the Region as the large geographic boundary. Inside it, AWS operates several isolated Availability Zones.",
      "Regions are the big geographic units; Availability Zones are the separate locations grouped inside each one.",
      "Spreading workloads across AZs removes some single-location risks. It does not make every dependency resilient by itself.",
    ],
  },
  "aws-iam-least-privilege": {
    prompt: "IAM is melting my brain a little. If a policy follows least privilege, what access should it actually grant?",
    answers: [
      "Wouldn't it be safer to make the app an administrator and watch the audit logs for anything weird?",
      "Permissions drift as the job changes. Review them regularly instead of treating the first policy as permanent.",
      "Give the identity exactly what its current task requires, and nothing broader. That is least privilege without the marketing fog.",
    ],
  },
  "aws-s3": {
    prompt: "Team keeps calling S3 a drive, a filesystem, and a database in the same meeting. What is it actually?",
    answers: [
      "Those folder paths behave like real directories on disk. Objects physically live inside the folders you see in the console.",
      "S3 is object storage. You address objects by keys inside buckets; you are not mounting ordinary blocks or directories.",
      "It is basically a block device that every EC2 instance can mount directly. That is why it scales so well.",
    ],
  },
  "aws-security-group": {
    prompt: "A request gets through an EC2 security group on the way in. Do I need a separate outbound rule for the reply?",
    answers: [
      "No extra mirror rule for that response. Security groups track state, so return traffic for an allowed connection can flow back out.",
      "The connection is remembered. Once the inbound flow is allowed, its response is permitted by the stateful tracking.",
      "Also worth remembering: security-group rules allow traffic. There is no explicit deny rule to win over an allow.",
    ],
  },
  "aws-nacl": {
    prompt: "I can never remember which AWS firewall is stateful. What can a network ACL do that a security group cannot?",
    answers: [
      "Network ACLs belong to IAM users, right? I thought each user's permissions carried its own subnet rules.",
      "An ACL can say both allow and deny. Security groups only express allows, which is a pretty important difference.",
      "NACLs sit at the subnet boundary and are stateless. You have to account for traffic in both directions.",
    ],
  },
  "aws-lambda": {
    prompt: "People say Lambda means 'no ops.' What work disappears, and what problems are still very much mine?",
    answers: [
      "AWS runs and patches the underlying servers. You still own the function code, permissions, configuration, and behavior.",
      "Serverless means limitless. Once the servers disappear from view, capacity failures and operational limits disappear too.",
      "Cold starts can still show up in latency-sensitive paths. I learned that one while wondering why the first request was slow.",
    ],
  },
  "aws-rds-multi-az": {
    prompt: "RDS Multi-AZ sounds like read scaling, failover, and magic rolled together. What is it mainly buying me?",
    answers: [
      "I have it as an availability feature: a standby in another AZ plus managed failover when the primary has trouble.",
      "The standby is there to take read traffic automatically, so Multi-AZ is mainly a horizontal read-scaling feature.",
      "Managed failover means the application will never notice an interruption. Zero dropped connections, guaranteed.",
    ],
  },
  "aws-dynamodb-key": {
    prompt: "If every DynamoDB item uses the same partition key, where does the traffic go, and why is that bad?",
    answers: [
      "One constant key should keep everything together and let DynamoDB scale that single partition as far as needed.",
      "Start with the reads and writes the application actually performs. Those access patterns should drive the table key and its indexes.",
      "The partition key helps decide where both data and request load land. A hot key can turn a distributed table into one very busy corner.",
    ],
  },
  "aws-cloudfront": {
    prompt: "CloudFront keeps getting described as 'a cache for images.' Is that the whole product, or can it sit in front of dynamic traffic too?",
    answers: [
      "Static assets only. The moment a request is dynamic, CloudFront has to step aside and let clients call the origin directly.",
      "It is AWS's content delivery network: edge locations, caching, and request delivery closer to users.",
      "I mostly use it instead of application authorization. Once CloudFront is in front, IAM checks are redundant.",
    ],
  },
  "aws-sqs-delivery": {
    prompt: "An SQS Standard consumer processed a message and then saw it again. Bug, or behavior the consumer must be designed for?",
    answers: [
      "Expected possibility. Standard queues can deliver a message more than once, so the consumer needs an idempotent processing path.",
      "That would be an AWS bug. Standard queues promise exactly-once processing, even when the worker crashes mid-acknowledgment.",
      "Visibility timeout only hides the message for a while. Successful processing still needs the message to be deleted.",
    ],
  },
  "aws-shared-responsibility": {
    prompt: "When an AWS incident happens, how do you decide whether security 'of' the cloud or security 'in' the cloud failed?",
    answers: [
      "AWS owns the whole security outcome, including how customers classify data and write their IAM policies. That is what managed cloud means.",
      "The line moves with the service. Running EC2 leaves more with the customer than consuming a highly managed service.",
      "AWS protects the underlying cloud infrastructure. Customers protect what they deploy, configure, permit, and store on top of it.",
    ],
  },
  "aws-auto-scaling": {
    prompt: "Auto Scaling added instances, yet the app still went down. What can scaling not guarantee on its own?",
    answers: [
      "The new instances appear healthy the instant traffic rises. There is no warm-up, failed launch, or delayed health check to plan around.",
      "More instances cover every failure mode. If the fleet can grow, the application is available by definition.",
      "The EC2 group scales the database and every downstream service with it. Bottlenecks cannot survive automatic scaling.",
    ],
  },
};

