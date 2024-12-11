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




###

```graphQL

```



###

```graphQL

```



###

```graphQL

```



###

```graphQL

```



###

```graphQL

```




###

```graphQL

```
