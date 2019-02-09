#!/bin/bash
export AWS_LAMBDA_FUNCTION_NAME=$1 
export IS_LOCAL=1 

CMD="./node_modules/.bin/sls invoke local -f $AWS_LAMBDA_FUNCTION_NAME"

if [[ $DEBUG ]]
then
  CMD="node --inspect $CMD"
elif [[ $DEBUG_BRK ]]
then
  CMD="node --inspect-brk $CMD"
fi

set -x
eval "$CMD"