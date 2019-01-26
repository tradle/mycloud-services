export const genTopicArn = ({ region, accountId, name }) => `arn:aws:sns:${region}:${accountId}:${name}`
