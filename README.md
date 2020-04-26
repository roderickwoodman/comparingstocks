([click here to visit this app on the Internet!](https://roderickwoodman.github.io/comparingstocks/))

## ComparingStocks
*A tool for generating meaningful performance and allocation data for your stock holdings*

Most financial websites give you only the most superficial data about your stock portfolio as a whole. They typically give you your current holdings in dollars and shares and then for performance they tell you the lifetime gain. It is all simple math, and it is all useless for managing a portfolio. This is because the funds that are needed to increase a position must always come from trimming back on other positions. Yes, comparisons are unavoidable. And so, fundamentally, all individual investors need tools that will compare their positions to each other.

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

In addition this app has the following two features that save the investor from doing even more back-of-the-envelope math before buying and selling stocks:

  * **aggregate positions -** A flexible position tagging interface allows these same metrics to be calculated on aggregate for any arbitrary combination of individual stock positions.
  * **many balancing scenarios -** A robust balancing engine makes it so that any aggregate group of positions can be balanced either by basis or by current value, while also adjusting for cash, for risk, and for liquidated positions if desired. The output of the balancing operation is the exact number of shares of each stock needed to be bought or sold to achieve the desired balance.

In all, **ComparingStocks** attempts to be a long-term portfolio management tool for the individual investor.

### Development Mode

For most people, [the link above](https://roderickwoodman.github.io/comparingstocks/) will take you to the live, production version of the app on the Internet. But for developers who would like to run this app in development mode...

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

As with other Create React App projects, from the project directory you can run:

### `npm start`

This runs the app in the development mode.<br> 
 Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

