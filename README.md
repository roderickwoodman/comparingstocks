([click here to visit this app on the Internet!](https://roderickwoodman.github.io/comparingstocks/))

## ComparingStocks
*A tool for generating meaningful performance and allocation data for your stock holdings*

Managing a portfolio is all about comparisons. It is not enough to know the common metrics on a position like its current value and its cost basis. The red and green numbers are nice to look at on a daily basis, but are too simplistic to be actionable.

Adding and removing a stock usually requires a more complex rebalancing operation across multiple stocks so as to remain similarly invested. And so, representing positions as portfolio fractions and having a balancing engine that allows these fractions to be adjusted are invaluable tools when changing a portfolio.

### Useful Data Formats

Unfortunately, stock positions are inherently quite different. Investments are made in different amounts on different dates and the underlying securities themselves have a wide range of performance and volatility to them. However, by framing an investor's portfolio holdings data in the following ways, many more actionable, apples-to-apples comparisons can be made:

  * For useful position size data, each of your holdings should be shown to you with:
      * **its percentage of your total portfolio value -** Percentages are more immediately comparable than share counts and dollars are.
      * **its cost basis -** Basis reveals your original investment, ex what the market has done with it since.
      * **its capital at risk -** The true downside of a position requires adjusting it by some stock-specific volatility metric.

  * For useful performance data, each of your holdings should be shown to you with:
      * **its gains in percentage -** Percentages are more immediately comparable than gains in dollars are.
      * **its gains sampled at multiple time windows -** A few recent look-back snapshots are sufficient for assessment and are also easier to focus on than every price fluctuation over all time is.
      * **its gains relative to the broad index -** Gains relative to the index (aka: "alpha") are an investor's ultimate scorecard. Absolute gains are only half-truths.

This big-picture portfolio perspective helps an investor to level a diverse collection of stocks and purchase histories so that he or she is aware of all outsized bets and risks at all times.

### Useful Portfolio Tools

In addition this app has the following two features that save the investor from doing even more back-of-the-envelope math before buying and selling stocks:

  * **aggregate positions -** A flexible position tagging interface allows these same metrics to be calculated on aggregate for any arbitrary combination of individual stock positions.
  * **many balancing scenarios -** A robust balancing engine makes it so that any aggregate group of positions can be balanced either by basis or by current value, while also adjusting for cash, for risk, and for liquidated positions if desired. The output of the balancing operation is the exact number of shares of each stock needed to be bought or sold to achieve the desired balance.

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
