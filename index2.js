const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Nitro GraphQL API endpoint
const NITRO_API_URL = 'https://api.explorer.routernitro.com/graphql'; 

async function queryGraphQL(query, variables) {
  try {
    const response = await axios.post(NITRO_API_URL, {
      query,
      variables,
    });
    return response.data.data;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw new Error('Failed to fetch data from Nitro API');
  }
}

// fetch required data for wrapped
app.get('/nitro-wrapped/:walletAddress', async (req, res) => {
  const walletAddress = req.params.walletAddress;

  try {
    // Query to fetch user's transactions
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
    const transactions = userTransactionsData.getUsersTransactions.data;
    
    const summary = {
      totalTransactions: transactions.length,
      totalGasFeePaid: 0,
      totalUniqueTokensSent: new Set(),
      totalUniqueTokensReceived: new Set(),
      topSourceChains: {},
      topDestinationChains: {},
    };

    transactions.forEach(tx => {
      // count unique tokens
      summary.totalUniqueTokensSent.add(tx.src_symbol);
      summary.totalUniqueTokensReceived.add(tx.dest_symbol);

      // accumulate gas fee
      summary.totalGasFeePaid += parseFloat(tx.gas_fee_usd || 0);

      // count source chains
      summary.topSourceChains[tx.src_chain_id] = (summary.topSourceChains[tx.src_chain_id] || 0) + 1;

      // count destination chains
      summary.topDestinationChains[tx.dest_chain_id] = (summary.topDestinationChains[tx.dest_chain_id] || 0) + 1;
    });

    // convert Sets to counts
    summary.totalUniqueTokensSent = summary.totalUniqueTokensSent.size;
    summary.totalUniqueTokensReceived = summary.totalUniqueTokensReceived.size;

    // sort chains by usage
    summary.topSourceChains = Object.entries(summary.topSourceChains).sort((a, b) => b[1] - a[1]);
    summary.topDestinationChains = Object.entries(summary.topDestinationChains).sort((a, b) => b[1] - a[1]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});