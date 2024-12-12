### Total number of transactions on Nitro by the user

```graphQL
# total transaction by the user
query TotalTransactions($senderAddress: String!) {
  getUsersTransactions(sender_address: $senderAddress) {
    total
  }
}

query UniqueChains($senderAddress: String!) {
  findNitroTransactionsByFilter(
    where: { sender_address: $senderAddress }
  ) {
    total
  }
}


```




### Total amount received and sent

```graphQL
query TotalAmounts($senderAddress: String!) {
  findNitroTransactionsByFilter(
    limit: 1000,
    page: 1,
    where: { sender_address: $senderAddress }
  ) {
    data {
      src_amount
      dest_amount
    }
  }
}

```



### Most transferred and received token

```graphQL
query MostTransferredAndReceivedToken($senderAddress: String!) {
  findNitroTransactionsByFilter(
    where: { sender_address: $senderAddress }
  ) {
    data {
      src_symbol
      src_amount
      dest_symbol
      dest_amount
    }
  }
}

```



### All transactions information of user

```graphQL
query GetUsersTransactions($sender_address: String!) {
  getUsersTransactions(sender_address: $sender_address) {
    data {
      src_chain_id
      dest_chain_id
      src_symbol
      dest_symbol
      fee_amount
      src_amount
      dest_amount
      gas_fee_usd
    }
  }
}
```

<!-- 

###

```graphQL

```



###

```graphQL

```




###

```graphQL

```

-->