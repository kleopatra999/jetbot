#!/usr/bin/env bash
curl -H "Content-Type: application/json" \
    -X POST \
    -d '{"depart_date":"18/05","return_date":"23/05","id":"123u1234","title":"Price Alert. Bangkok - Tokyo: 261 usd.","url":"http://www.jetradar.co.th/new_searches/CBKK1805CTYO2305Y1?currency=usd&locale=en&marker=direct..alert&ticket=1805MH7891805MH882305MH7802305MH89_16982&utm_source=email","graph":"http://beta.jetradar.com/graph.png?w=240&h=240&last_prices=261&average_price=311","icon":"http://pics.avs.io/240/240/MH.png"}
' \
    http://localhost:3000/notify
