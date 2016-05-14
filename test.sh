#!/usr/bin/env bash
curl -H "Content-Type: application/json" \
    -X POST \
    -d '{
  "result":[{
    "from":"12345",
    "to":["12345"],
    "content": {
      "contentType":1,
      "from":"12345",
      "to":["12345"],
      "toType":1,
      "contentMetadata":null,
      "text":"'"$*"'"
    }
  }
]}' \
    http://localhost:3000/receive
