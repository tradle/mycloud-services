import { TableDefinition } from "./types"
import { defaultTableDefinition } from "./table-default-definition"

interface PartialTableDefinition extends Partial<TableDefinition> {
  TableName: string
}

export const createTableDefinition = (
  props: PartialTableDefinition
): TableDefinition => ({
  ...defaultTableDefinition,
  ...props
})
