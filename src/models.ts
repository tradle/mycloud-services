import mergeModels from '@tradle/merge-models'
import { models as baseModels } from '@tradle/models'
import { models as baseCloudModels } from '@tradle/models-cloud'
import { models as cloudServicesModels } from '@tradle/models-cloud-services'

const mergeOpts = { validate: false }

const merger = mergeModels()
const modelsPacks = [baseModels, baseCloudModels, cloudServicesModels]

modelsPacks.forEach(pack => merger.add(pack, mergeOpts))

export = merger.get()
