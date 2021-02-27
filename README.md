([click here to visit this app on the Internet!](https://roderickwoodman.github.io/comparingstocks/))

## ComparingStocks
*A tool for generating meaningful performance and allocation data for your stock holdings*

Managing a portfolio is all about comparisons. It is not enough to know the common metrics on a position like its current value and its cost basis. The red and green numbers are nice to look at on a daily basis, but are too simplistic to be actionable.

Adding and removing a stock usually requires a more complex rebalancing operation across multiple stocks so as to remain similarly invested. And so, representing positions as portfolio fractions and having a balancing engine that allows these fractions to be adjusted are invaluable tools when changing a portfolio.

### Useful Data Formats

Unfortunately, stock positions are inherently quite different. Investments are made in different amounts on different dates and the underlying securities themselves have a wide range of performance and volatility to them. However, by framing an investor's portfolio holdings data in the following ways, many more actionable, apples-to-apples comparisons can be made:

**ComparingStocks** generates the following high-level numbers:

  * Positions as a percentage of the total portfolio
  * Positions adjusted for risk

  * Performance relative to the broad index
  * Performance over 3 different fixed timeframes

This big-picture portfolio perspective helps an investor to level a diverse collection of stocks and purchase histories so that he or she is aware of all outsized bets and risks at all times.

### Useful Aggregation Feature

This app has a flexible tagging interface that allows these metrics to be calculated in aggregate, on any arbitrary collection of positions. For instance, groups of positions can defined:

* group by account
* group by sector
* group by strategy

### Useful Balancing Engine

One of the key features of this app is its robust balancing engine. Multiple balancing scenarios are supported:

* balance by basis
* balance by risk-adjusted basis
* balance by current value
* balance by value at-risk
* balance to leave only profits
* balance to leave a certain amount of cash

The output of the balancing operation is the exact number of shares of each stock that are needed to be bought or sold to achieve the desired balance.

### In Summary

In all, **ComparingStocks** attempts to be a long-term portfolio management tool for the individual investor.

### DISCLAIMER

This app has been designed for the author's needs only, in the author's spare time. By using this app, you are accepting it as-is.

For most people, [the link above](https://roderickwoodman.github.io/comparingstocks/) will take you to the live, production version of the app on the Internet. At the moment however, because of technical and financial reasons, the stocks are limited to the DOW30 and quotes are not current so you will see price errors.

For developers, be aware that there is no backend server for this app. So although that means there are no security issues for users and passwords and their financial data, it also means that each user's machine must submit its own API key to the Alpha Vantage quotes service. But this development mode feature has been disabled until throttling logic is put in place (on the front end) to intelligently meter the outgoing requests to the Alpha Vantage servers so that the app degrades gracefully for users who exceed their daily quota while using this app.

This app has numerous features that are downstream of the quote data that are being developed on a daily basis using stale quote data. But eventually, current quotes will indeed be turned on.

### (For Developers) Running this app locally

As a one-time setup, copy the code for this app to your local machine. 
```
git clone https://github.com/roderickwoodman/comparingstocks.git
cd comparingstocks
npm install
```

Now, every time you want to run the app, just run a script that starts up a development server with the code. This will run the app in development mode.
```
npm start
```

Doing this will open a browser tab for viewing the app at [http://localhost:3000](http://localhost:3000). The page will reload if you make edits to your local code copies. You will also see any lint errors in the browser console. 
