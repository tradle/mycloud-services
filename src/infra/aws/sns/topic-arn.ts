import { parseArn } from '@tradle/aws-common-utils'
export const genTopicArn = ({ region, accountId, name }) => `arn:aws:sns:${region}:${accountId}:${name}`
interface GenPublisherTopicNameOpts {
  accountId: string
  permalink: string
}
export const genPublisherTopicName = ({ accountId, permalink }: GenPublisherTopicNameOpts) =>
  `${accountId}-${permalink}`
export const parsePublisherTopicArn = (topic: string) => {
  const { region, relativeId } = parseArn(topic)
  const name = relativeId.split(':').pop()
  const [accountId, permalink] = name.split('-')
  return { region, accountId, permalink }
}
