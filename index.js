const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const NITRO_API_URL = 'https://api.explorer.routernitro.com/graphql';

async function queryGraphQL(query, variables) {
  try {
    const response = await axios.post(NITRO_API_URL, {
      query,
      variables,
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Failed to fetch data from Nitro API');
  }
}

// Nitro Wrapped summary
app.get('/nitro-wrapped/:walletAddress', async (req, res) => {
  const walletAddress = req.params.walletAddress;

  try {
    const userTransactionsQuery = `
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
    `;

    const userTransactionsData = await queryGraphQL(userTransactionsQuery, { sender_address: walletAddress });
    const transactions = userTransactionsData?.getUsersTransactions?.data || [];

    if (!transactions.length) {
      return res.json({
        totalTransactions: 0,
        totalGasFeePaid: 0,
        totalUniqueTokensSent: 0,
        totalUniqueTokensReceived: 0,
        topSourceChains: [],
        topDestinationChains: [],
        mostUsedToken: null,
      });
    }

    const summary = {
      totalTransactions: transactions.length,
      totalGasFeePaid: 0,
      totalUniqueTokensSent: new Set(),
      totalUniqueTokensReceived: new Set(),
      topSourceChains: {},
      topDestinationChains: {},
      tokenUsage: {},
    };

    transactions.forEach(tx => {
      // unique tokens
      summary.totalUniqueTokensSent.add(tx.src_symbol);
      summary.totalUniqueTokensReceived.add(tx.dest_symbol);

      // gas fee
      summary.totalGasFeePaid += parseFloat(tx.gas_fee_usd || 0);

      // source chains
      summary.topSourceChains[tx.src_chain_id] = (summary.topSourceChains[tx.src_chain_id] || 0) + 1;

      // destination chains
      summary.topDestinationChains[tx.dest_chain_id] = (summary.topDestinationChains[tx.dest_chain_id] || 0) + 1

      // track token usage (sent and received)
      if (tx.src_symbol) {
        summary.tokenUsage[tx.src_symbol] = (summary.tokenUsage[tx.src_symbol] || 0) + 1;
      }
      if (tx.dest_symbol) {
        summary.tokenUsage[tx.dest_symbol] = (summary.tokenUsage[tx.dest_symbol] || 0) + 1;
      }
    });

    // convert Sets to counts
    summary.totalUniqueTokensSent = summary.totalUniqueTokensSent.size;
    summary.totalUniqueTokensReceived = summary.totalUniqueTokensReceived.size;

    // sort chains by usage
    summary.topSourceChains = Object.entries(summary.topSourceChains)
      .map(([chain, count]) => ({ chain, count }))
      .sort((a, b) => b.count - a.count);

    summary.topDestinationChains = Object.entries(summary.topDestinationChains)
      .map(([chain, count]) => ({ chain, count }))
      .sort((a, b) => b.count - a.count);


    // top source chain name and count
    const topSourceChain = summary.topSourceChains.length > 0 ? summary.topSourceChains[0] : null;
    if (topSourceChain) {
      summary.topSourceChainCount = { chain: topSourceChain.chain, count: topSourceChain.count };
    } else {
      summary.topSourceChainCount = null;
    }

    // top destination chain name and count
    const topDestinationChain = summary.topDestinationChains.length > 0 ? summary.topDestinationChains[0] : null;
    if (topDestinationChain) {
      summary.topDestinationChainCount = { chain: topDestinationChain.chain, count: topDestinationChain.count };
    } else {
      summary.topDestinationChainCount = null;
    }


    // most used token
    const mostUsedToken = Object.entries(summary.tokenUsage)
      .sort((a, b) => b[1] - a[1])[0];

    summary.mostUsedToken = mostUsedToken ? { name: mostUsedToken[0], count: mostUsedToken[1] } : null;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
