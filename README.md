([click here to visit this app on the Internet!](https://roderickwoodman.github.io/comparingstocks/))

## ComparingStocks
*A tool for generating meaningful performance and allocation data for your stock holdings*

Managing a portfolio is all about comparisons. It is not enough to know the common metrics on a position like its current value and its cost basis. The red and green numbers are nice to look at on a daily basis, but are too simplistic to be actionable.

Adding and removing a stock usually requires a more complex rebalancing operation across multiple stocks so as to remain similarly invested. And so, representing positions as portfolio fractions and having a balancing engine that allows these fractions to be adjusted are invaluable tools when changing a portfolio.

### Meaningful Data Formats

Stock positions are inherently quite different in terms of things like dates, cash invested, volatility, and performance. But **ComparingStocks** generates the following high-level numbers that enable apples-to-apples comparisons:

* Positions as a percentage of the total portfolio
* Positions adjusted for risk
* Performance relative to the broad index
* Performance over 3 different fixed timeframes

This big-picture portfolio perspective helps the individual investor to be aware of all outsized bets and risks at all times.

### Position Aggregation

This app has a flexible tagging interface that allows these metrics to be calculated in aggregate, on any arbitrary collection of positions. Similar positions can be grouped by applying the same label, for instance:

* Label positions into groups by account
* Label positions into groups by sector
* Label positions into groups by strategy

### Portfolio Balancing

The most powerful feature of this app is its robust balancing engine. The following balancing scenarios are supported:

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

**AS-IS:** This app has been designed for the author's needs only, in the author's spare time. By using this app, you are accepting it as-is.

**Quotes Are Not Current:** For most people, [the link above](https://roderickwoodman.github.io/comparingstocks/) will take you to the live, production version of the app on the Internet. At the moment however, because of technical, the stocks are limited to the DOW30 and quotes are not current so you will see price errors.

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
