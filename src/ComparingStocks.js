import React from 'react'
import { PositionRow } from './components/PositionRow'


export class ComparingStocks extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            allStocks: [ // FIXME: placeholder data for now
                // 'MSFT', 'MSFT', 'MSFT' // FIXME: default to demo key and MSFT, not rate-limited
                'V', 'MSFT', 'SBUX'
            ],
            allCurrentQuotes: [],
            allMonthlyQuotes: [],
            sort_column: 'symbol',
            sort_dir_asc: true,
            done: false
        }
        this.getCurrentQuotes = this.getCurrentQuotes.bind(this)
        this.debugGetCurrentQuotes = this.debugGetCurrentQuotes.bind(this)
        this.debugGetMonthlyQuotes = this.debugGetMonthlyQuotes.bind(this)
        this.changeSort = this.changeSort.bind(this)
    }

    async componentDidMount() {
        // this.getCurrentQuotes(this.state.allStocks)
        this.debugGetCurrentQuotes(this.state.allStocks)
        this.debugGetMonthlyQuotes(this.state.allStocks)
    }

    getQuoteUrl(ticker) {
        //let alpha_vantage_api_key = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY
        let alpha_vantage_api_key = 'demo' // FIXME: default to demo key and MSFT, not rate-limited 
        let url_prefix = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
        let url_suffix = '&apikey=' + alpha_vantage_api_key
        return url_prefix + ticker + url_suffix
    }

    async getCurrentQuotes(tickers) {
        let newQuotes = {}
        const quotesApiResults = await Promise.all(tickers.map(ticker =>
            fetch(this.getQuoteUrl(ticker))
            .then(res => res.json())
        ))
        quotesApiResults.forEach(function(item, idx) {
            let quoteResult = item['Global Quote']
            let newQuote = {}
            let ticker = quoteResult['01. symbol'] + idx
            newQuote['symbol'] = ticker
            newQuote['price'] = parseFloat(quoteResult['05. price'])
            newQuote['change'] = parseFloat(quoteResult['09. change'])
            newQuote['change_pct'] = parseFloat(quoteResult['10. change percent'].slice(0, -1))
            newQuote['volume'] = parseInt(quoteResult['06. volume'])
            newQuotes[ticker] = newQuote
        })
        this.setState({ allCurrentQuotes: newQuotes })
    }

    // DEBUG: use hardcoded, local responses for development
    debugGetCurrentQuotes(tickers) {
        let newQuotes = {}
        let hardcodedCurrentQuotes = [
            {
                "Global Quote": {
                    "01. symbol": "V",
                    "02. open": "189.4900",
                    "03. high": "192.1100",
                    "04. low": "188.8000",
                    "05. price": "191.8700",
                    "06. volume": "1752851",
                    "07. latest trading day": "2020-01-08",
                    "08. previous close": "188.6900",
                    "09. change": "3.1800",
                    "10. change percent": "1.6853%"
                }
            },
            {
                "Global Quote": {
                    "01. symbol": "MSFT",
                    "02. open": "158.9300",
                    "03. high": "160.1800",
                    "04. low": "157.9491",
                    "05. price": "159.9650",
                    "06. volume": "9797793",
                    "07. latest trading day": "2020-01-08",
                    "08. previous close": "157.5800",
                    "09. change": "2.3850",
                    "10. change percent": "1.5135%"
                }
            },
            {
                "Global Quote": {
                    "01. symbol": "SBUX",
                    "02. open": "87.9400",
                    "03. high": "89.1800",
                    "04. low": "87.7800",
                    "05. price": "89.1350",
                    "06. volume": "2517383",
                    "07. latest trading day": "2020-01-08",
                    "08. previous close": "87.8600",
                    "09. change": "1.2750",
                    "10. change percent": "1.4512%"
                }
            }
        ]
        hardcodedCurrentQuotes.forEach(function(item, idx) {
            let quoteResult = item['Global Quote']
            let newQuote = {}
            let ticker = quoteResult['01. symbol']
            newQuote['symbol'] = ticker
            newQuote['price'] = parseFloat(quoteResult['05. price'])
            newQuote['change'] = parseFloat(quoteResult['09. change'])
            newQuote['change_pct'] = parseFloat(quoteResult['10. change percent'].slice(0, -1))
            newQuote['volume'] = parseInt(quoteResult['06. volume'])
            newQuotes[ticker] = newQuote
        })
        this.setState({ allCurrentQuotes: newQuotes })
    }

    debugGetMonthlyQuotes(tickers) {
        let newQuotes = {}
        let hardcodedMonthlyQuotes = [
            {
                "Meta Data": {
                    "1. Information": "Monthly Adjusted Prices and Volumes",
                    "2. Symbol": "MSFT",
                    "3. Last Refreshed": "2020-01-08",
                    "4. Time Zone": "US/Eastern"
                },
                "Monthly Adjusted Time Series": {
                    "2020-01-08": {
                        "1. open": "158.7800",
                        "2. high": "160.8000",
                        "3. low": "156.5100",
                        "4. close": "160.0900",
                        "5. adjusted close": "160.0900",
                        "6. volume": "114017352",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-12-31": {
                        "1. open": "151.8100",
                        "2. high": "159.5500",
                        "3. low": "146.6500",
                        "4. close": "157.7000",
                        "5. adjusted close": "157.7000",
                        "6. volume": "452664147",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-11-29": {
                        "1. open": "144.2600",
                        "2. high": "152.5000",
                        "3. low": "142.9650",
                        "4. close": "151.3800",
                        "5. adjusted close": "151.3800",
                        "6. volume": "393028043",
                        "7. dividend amount": "0.5100"
                    },
                    "2019-10-31": {
                        "1. open": "139.6600",
                        "2. high": "145.6700",
                        "3. low": "133.2200",
                        "4. close": "143.3700",
                        "5. adjusted close": "142.8830",
                        "6. volume": "560654410",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-09-30": {
                        "1. open": "136.6100",
                        "2. high": "142.3700",
                        "3. low": "134.5100",
                        "4. close": "139.0300",
                        "5. adjusted close": "138.5577",
                        "6. volume": "477645820",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-08-30": {
                        "1. open": "137.0000",
                        "2. high": "140.9383",
                        "3. low": "130.7800",
                        "4. close": "137.8600",
                        "5. adjusted close": "137.3917",
                        "6. volume": "585509525",
                        "7. dividend amount": "0.4600"
                    },
                    "2019-07-31": {
                        "1. open": "136.6300",
                        "2. high": "141.6750",
                        "3. low": "134.6700",
                        "4. close": "136.2700",
                        "5. adjusted close": "135.3424",
                        "6. volume": "484553299",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-06-28": {
                        "1. open": "123.8500",
                        "2. high": "138.4000",
                        "3. low": "119.0100",
                        "4. close": "133.9600",
                        "5. adjusted close": "133.0481",
                        "6. volume": "508324437",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-05-31": {
                        "1. open": "130.5300",
                        "2. high": "130.6500",
                        "3. low": "123.0400",
                        "4. close": "123.6800",
                        "5. adjusted close": "122.8381",
                        "6. volume": "547218448",
                        "7. dividend amount": "0.4600"
                    },
                    "2019-04-30": {
                        "1. open": "118.9500",
                        "2. high": "131.3700",
                        "3. low": "118.1000",
                        "4. close": "130.6000",
                        "5. adjusted close": "129.2393",
                        "6. volume": "433157868",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-03-29": {
                        "1. open": "112.8900",
                        "2. high": "120.8200",
                        "3. low": "108.8000",
                        "4. close": "117.9400",
                        "5. adjusted close": "116.7112",
                        "6. volume": "589045341",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-02-28": {
                        "1. open": "103.7750",
                        "2. high": "113.2400",
                        "3. low": "102.3500",
                        "4. close": "112.0300",
                        "5. adjusted close": "110.8627",
                        "6. volume": "469095970",
                        "7. dividend amount": "0.4600"
                    },
                    "2019-01-31": {
                        "1. open": "99.5500",
                        "2. high": "107.9000",
                        "3. low": "97.2000",
                        "4. close": "104.4300",
                        "5. adjusted close": "102.9002",
                        "6. volume": "714204787",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-12-31": {
                        "1. open": "113.0000",
                        "2. high": "113.4200",
                        "3. low": "93.9600",
                        "4. close": "101.5700",
                        "5. adjusted close": "100.0821",
                        "6. volume": "944287635",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-11-30": {
                        "1. open": "107.0500",
                        "2. high": "112.2400",
                        "3. low": "99.3528",
                        "4. close": "110.8900",
                        "5. adjusted close": "109.2655",
                        "6. volume": "720228643",
                        "7. dividend amount": "0.4600"
                    },
                    "2018-10-31": {
                        "1. open": "114.7500",
                        "2. high": "116.1800",
                        "3. low": "100.1100",
                        "4. close": "106.8100",
                        "5. adjusted close": "104.7861",
                        "6. volume": "927547942",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-09-28": {
                        "1. open": "110.8500",
                        "2. high": "115.2900",
                        "3. low": "107.2300",
                        "4. close": "114.3700",
                        "5. adjusted close": "112.2029",
                        "6. volume": "480255674",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-08-31": {
                        "1. open": "106.0300",
                        "2. high": "112.7770",
                        "3. low": "104.8400",
                        "4. close": "112.3300",
                        "5. adjusted close": "110.2015",
                        "6. volume": "456630721",
                        "7. dividend amount": "0.4200"
                    },
                    "2018-07-31": {
                        "1. open": "98.1000",
                        "2. high": "111.1500",
                        "3. low": "98.0000",
                        "4. close": "106.0800",
                        "5. adjusted close": "103.6655",
                        "6. volume": "569501573",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-06-29": {
                        "1. open": "99.2798",
                        "2. high": "102.6900",
                        "3. low": "97.2600",
                        "4. close": "98.6100",
                        "5. adjusted close": "96.3655",
                        "6. volume": "602585341",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-05-31": {
                        "1. open": "93.2100",
                        "2. high": "99.9900",
                        "3. low": "92.4500",
                        "4. close": "98.8400",
                        "5. adjusted close": "96.5903",
                        "6. volume": "509418119",
                        "7. dividend amount": "0.4200"
                    },
                    "2018-04-30": {
                        "1. open": "90.4700",
                        "2. high": "97.9000",
                        "3. low": "87.5100",
                        "4. close": "93.5200",
                        "5. adjusted close": "90.9980",
                        "6. volume": "668258570",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-03-29": {
                        "1. open": "93.9900",
                        "2. high": "97.2400",
                        "3. low": "87.0800",
                        "4. close": "91.2700",
                        "5. adjusted close": "88.8087",
                        "6. volume": "732866406",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-02-28": {
                        "1. open": "94.7900",
                        "2. high": "96.0700",
                        "3. low": "83.8300",
                        "4. close": "93.7700",
                        "5. adjusted close": "91.2413",
                        "6. volume": "690287596",
                        "7. dividend amount": "0.4200"
                    },
                    "2018-01-31": {
                        "1. open": "86.1250",
                        "2. high": "95.4500",
                        "3. low": "85.5000",
                        "4. close": "95.0100",
                        "5. adjusted close": "92.0222",
                        "6. volume": "543377322",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-12-29": {
                        "1. open": "83.6000",
                        "2. high": "87.4999",
                        "3. low": "80.7000",
                        "4. close": "85.5400",
                        "5. adjusted close": "82.8500",
                        "6. volume": "447828256",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-11-30": {
                        "1. open": "83.6800",
                        "2. high": "85.0600",
                        "3. low": "82.2400",
                        "4. close": "84.1700",
                        "5. adjusted close": "81.5231",
                        "6. volume": "416152260",
                        "7. dividend amount": "0.4200"
                    },
                    "2017-10-31": {
                        "1. open": "74.7100",
                        "2. high": "86.2000",
                        "3. low": "73.7100",
                        "4. close": "83.1800",
                        "5. adjusted close": "80.1585",
                        "6. volume": "440510118",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-09-29": {
                        "1. open": "74.7100",
                        "2. high": "75.9700",
                        "3. low": "72.9200",
                        "4. close": "74.4900",
                        "5. adjusted close": "71.7842",
                        "6. volume": "367134396",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-08-31": {
                        "1. open": "73.1000",
                        "2. high": "74.9600",
                        "3. low": "71.2800",
                        "4. close": "74.7700",
                        "5. adjusted close": "72.0540",
                        "6. volume": "429156682",
                        "7. dividend amount": "0.3900"
                    },
                    "2017-07-31": {
                        "1. open": "69.3300",
                        "2. high": "74.4200",
                        "3. low": "68.0200",
                        "4. close": "72.7000",
                        "5. adjusted close": "69.6880",
                        "6. volume": "451248934",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-06-30": {
                        "1. open": "70.2400",
                        "2. high": "72.8900",
                        "3. low": "68.0900",
                        "4. close": "68.9300",
                        "5. adjusted close": "66.0742",
                        "6. volume": "610120893",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-05-31": {
                        "1. open": "68.6800",
                        "2. high": "70.7400",
                        "3. low": "67.1400",
                        "4. close": "69.8400",
                        "5. adjusted close": "66.9465",
                        "6. volume": "505249296",
                        "7. dividend amount": "0.3900"
                    },
                    "2017-04-28": {
                        "1. open": "65.8100",
                        "2. high": "69.1400",
                        "3. low": "64.8500",
                        "4. close": "68.4600",
                        "5. adjusted close": "65.2570",
                        "6. volume": "428857613",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-03-31": {
                        "1. open": "64.1300",
                        "2. high": "66.1900",
                        "3. low": "63.6200",
                        "4. close": "65.8600",
                        "5. adjusted close": "62.7786",
                        "6. volume": "489173200",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-02-28": {
                        "1. open": "64.3550",
                        "2. high": "65.2400",
                        "3. low": "62.7500",
                        "4. close": "63.9800",
                        "5. adjusted close": "60.9866",
                        "6. volume": "440744043",
                        "7. dividend amount": "0.3900"
                    },
                    "2017-01-31": {
                        "1. open": "62.7900",
                        "2. high": "65.9100",
                        "3. low": "61.9500",
                        "4. close": "64.6500",
                        "5. adjusted close": "61.2553",
                        "6. volume": "494435826",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-12-30": {
                        "1. open": "60.1100",
                        "2. high": "64.1000",
                        "3. low": "58.8000",
                        "4. close": "62.1400",
                        "5. adjusted close": "58.8771",
                        "6. volume": "513579428",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-11-30": {
                        "1. open": "59.9700",
                        "2. high": "61.4100",
                        "3. low": "57.2800",
                        "4. close": "60.2600",
                        "5. adjusted close": "57.0958",
                        "6. volume": "613056964",
                        "7. dividend amount": "0.3900"
                    },
                    "2016-10-31": {
                        "1. open": "57.4050",
                        "2. high": "61.3699",
                        "3. low": "56.3150",
                        "4. close": "59.9200",
                        "5. adjusted close": "56.4000",
                        "6. volume": "614841775",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-09-30": {
                        "1. open": "57.0100",
                        "2. high": "58.1900",
                        "3. low": "55.6100",
                        "4. close": "57.6000",
                        "5. adjusted close": "54.2163",
                        "6. volume": "526855083",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-08-31": {
                        "1. open": "56.6000",
                        "2. high": "58.7000",
                        "3. low": "56.1400",
                        "4. close": "57.4600",
                        "5. adjusted close": "54.0845",
                        "6. volume": "467079004",
                        "7. dividend amount": "0.3600"
                    },
                    "2016-07-29": {
                        "1. open": "51.1300",
                        "2. high": "57.2900",
                        "3. low": "50.3900",
                        "4. close": "56.6800",
                        "5. adjusted close": "53.0181",
                        "6. volume": "647587634",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-06-30": {
                        "1. open": "52.4400",
                        "2. high": "52.9500",
                        "3. low": "48.0350",
                        "4. close": "51.1700",
                        "5. adjusted close": "47.8640",
                        "6. volume": "823987498",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-05-31": {
                        "1. open": "50.0000",
                        "2. high": "53.0000",
                        "3. low": "49.4600",
                        "4. close": "53.0000",
                        "5. adjusted close": "49.5758",
                        "6. volume": "530869347",
                        "7. dividend amount": "0.3600"
                    },
                    "2016-04-29": {
                        "1. open": "55.0500",
                        "2. high": "56.7700",
                        "3. low": "49.3500",
                        "4. close": "49.8700",
                        "5. adjusted close": "46.3179",
                        "6. volume": "699025640",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-03-31": {
                        "1. open": "50.9700",
                        "2. high": "55.6400",
                        "3. low": "50.5800",
                        "4. close": "55.2300",
                        "5. adjusted close": "51.2961",
                        "6. volume": "640372350",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-02-29": {
                        "1. open": "54.8800",
                        "2. high": "55.0900",
                        "3. low": "48.1900",
                        "4. close": "50.8800",
                        "5. adjusted close": "47.2560",
                        "6. volume": "814770780",
                        "7. dividend amount": "0.3600"
                    },
                    "2016-01-29": {
                        "1. open": "54.3200",
                        "2. high": "55.3900",
                        "3. low": "49.1000",
                        "4. close": "55.0900",
                        "5. adjusted close": "50.8081",
                        "6. volume": "927914485",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-12-31": {
                        "1. open": "54.4100",
                        "2. high": "56.8500",
                        "3. low": "53.6800",
                        "4. close": "55.4800",
                        "5. adjusted close": "51.1678",
                        "6. volume": "793070000",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-11-30": {
                        "1. open": "52.8500",
                        "2. high": "54.9800",
                        "3. low": "52.5300",
                        "4. close": "54.3500",
                        "5. adjusted close": "50.1256",
                        "6. volume": "662622220",
                        "7. dividend amount": "0.3600"
                    },
                    "2015-10-30": {
                        "1. open": "44.7500",
                        "2. high": "54.3700",
                        "3. low": "43.7500",
                        "4. close": "52.6400",
                        "5. adjusted close": "48.2208",
                        "6. volume": "857330655",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-09-30": {
                        "1. open": "42.2300",
                        "2. high": "45.0000",
                        "3. low": "41.6600",
                        "4. close": "44.2600",
                        "5. adjusted close": "40.5443",
                        "6. volume": "670779566",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-08-31": {
                        "1. open": "46.9800",
                        "2. high": "48.4100",
                        "3. low": "39.7200",
                        "4. close": "43.5200",
                        "5. adjusted close": "39.8664",
                        "6. volume": "776277394",
                        "7. dividend amount": "0.3100"
                    },
                    "2015-07-31": {
                        "1. open": "44.4600",
                        "2. high": "47.4000",
                        "3. low": "43.3200",
                        "4. close": "46.7000",
                        "5. adjusted close": "42.5007",
                        "6. volume": "725458102",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-06-30": {
                        "1. open": "47.0600",
                        "2. high": "47.7700",
                        "3. low": "43.9400",
                        "4. close": "44.1500",
                        "5. adjusted close": "40.1800",
                        "6. volume": "664853340",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-05-29": {
                        "1. open": "48.5800",
                        "2. high": "48.9050",
                        "3. low": "46.0200",
                        "4. close": "46.8600",
                        "5. adjusted close": "42.6464",
                        "6. volume": "633072750",
                        "7. dividend amount": "0.3100"
                    },
                    "2015-04-30": {
                        "1. open": "40.6000",
                        "2. high": "49.5400",
                        "3. low": "40.1200",
                        "4. close": "48.6400",
                        "5. adjusted close": "43.9798",
                        "6. volume": "874535095",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-03-31": {
                        "1. open": "43.6700",
                        "2. high": "44.1900",
                        "3. low": "40.5400",
                        "4. close": "40.6550",
                        "5. adjusted close": "36.7598",
                        "6. volume": "824335340",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-02-27": {
                        "1. open": "40.5900",
                        "2. high": "44.3000",
                        "3. low": "40.2300",
                        "4. close": "43.8500",
                        "5. adjusted close": "39.6487",
                        "6. volume": "656509827",
                        "7. dividend amount": "0.3100"
                    },
                    "2015-01-30": {
                        "1. open": "46.6600",
                        "2. high": "47.9100",
                        "3. low": "40.3500",
                        "4. close": "40.4000",
                        "5. adjusted close": "36.2712",
                        "6. volume": "918738022",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-12-31": {
                        "1. open": "47.8800",
                        "2. high": "49.0600",
                        "3. low": "44.9000",
                        "4. close": "46.4500",
                        "5. adjusted close": "41.7029",
                        "6. volume": "626810606",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-11-28": {
                        "1. open": "46.8900",
                        "2. high": "50.0450",
                        "3. low": "46.7300",
                        "4. close": "47.8100",
                        "5. adjusted close": "42.9240",
                        "6. volume": "523008240",
                        "7. dividend amount": "0.3100"
                    },
                    "2014-10-31": {
                        "1. open": "46.2700",
                        "2. high": "46.9700",
                        "3. low": "42.1000",
                        "4. close": "46.9500",
                        "5. adjusted close": "41.8854",
                        "6. volume": "853297059",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-09-30": {
                        "1. open": "45.4300",
                        "2. high": "47.5700",
                        "3. low": "44.5300",
                        "4. close": "46.3600",
                        "5. adjusted close": "41.3591",
                        "6. volume": "860084532",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-08-29": {
                        "1. open": "43.2100",
                        "2. high": "45.4700",
                        "3. low": "42.2100",
                        "4. close": "45.4300",
                        "5. adjusted close": "40.5294",
                        "6. volume": "513429400",
                        "7. dividend amount": "0.2800"
                    },
                    "2014-07-31": {
                        "1. open": "41.8600",
                        "2. high": "45.7100",
                        "3. low": "41.0500",
                        "4. close": "43.1600",
                        "5. adjusted close": "38.2679",
                        "6. volume": "731616500",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-06-30": {
                        "1. open": "40.9500",
                        "2. high": "42.2900",
                        "3. low": "39.8600",
                        "4. close": "41.7000",
                        "5. adjusted close": "36.9734",
                        "6. volume": "555779700",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-05-30": {
                        "1. open": "40.2401",
                        "2. high": "40.9700",
                        "3. low": "38.5100",
                        "4. close": "40.9400",
                        "5. adjusted close": "36.2995",
                        "6. volume": "574362900",
                        "7. dividend amount": "0.2800"
                    },
                    "2014-04-30": {
                        "1. open": "41.1500",
                        "2. high": "41.6600",
                        "3. low": "38.9000",
                        "4. close": "40.4000",
                        "5. adjusted close": "35.5743",
                        "6. volume": "746113500",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-03-31": {
                        "1. open": "37.9200",
                        "2. high": "41.5000",
                        "3. low": "37.4950",
                        "4. close": "40.9900",
                        "5. adjusted close": "36.0938",
                        "6. volume": "778425700",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-02-28": {
                        "1. open": "37.7400",
                        "2. high": "38.4600",
                        "3. low": "35.6900",
                        "4. close": "38.3100",
                        "5. adjusted close": "33.7339",
                        "6. volume": "705304500",
                        "7. dividend amount": "0.2800"
                    },
                    "2014-01-31": {
                        "1. open": "37.3500",
                        "2. high": "37.8900",
                        "3. low": "34.6300",
                        "4. close": "37.8400",
                        "5. adjusted close": "33.0726",
                        "6. volume": "930226200",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-12-31": {
                        "1. open": "38.0900",
                        "2. high": "38.9800",
                        "3. low": "35.5300",
                        "4. close": "37.4100",
                        "5. adjusted close": "32.6968",
                        "6. volume": "826617700",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-11-29": {
                        "1. open": "35.6700",
                        "2. high": "38.2900",
                        "3. low": "35.3900",
                        "4. close": "38.1300",
                        "5. adjusted close": "33.3261",
                        "6. volume": "800431600",
                        "7. dividend amount": "0.2800"
                    },
                    "2013-10-31": {
                        "1. open": "33.3500",
                        "2. high": "36.2900",
                        "3. low": "32.8000",
                        "4. close": "35.4050",
                        "5. adjusted close": "30.7104",
                        "6. volume": "965331500",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-09-30": {
                        "1. open": "31.7500",
                        "2. high": "33.7500",
                        "3. low": "30.9500",
                        "4. close": "33.2800",
                        "5. adjusted close": "28.8671",
                        "6. volume": "1242961500",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-08-30": {
                        "1. open": "32.0600",
                        "2. high": "35.2000",
                        "3. low": "30.8400",
                        "4. close": "33.4000",
                        "5. adjusted close": "28.9712",
                        "6. volume": "1051265000",
                        "7. dividend amount": "0.2300"
                    },
                    "2013-07-31": {
                        "1. open": "34.7500",
                        "2. high": "36.4299",
                        "3. low": "31.0200",
                        "4. close": "31.8400",
                        "5. adjusted close": "27.4224",
                        "6. volume": "1111130600",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-06-28": {
                        "1. open": "34.9200",
                        "2. high": "35.7800",
                        "3. low": "32.5700",
                        "4. close": "34.5450",
                        "5. adjusted close": "29.7521",
                        "6. volume": "945155500",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-05-31": {
                        "1. open": "32.9300",
                        "2. high": "35.2800",
                        "3. low": "32.3200",
                        "4. close": "34.9000",
                        "5. adjusted close": "30.0578",
                        "6. volume": "1071860000",
                        "7. dividend amount": "0.2300"
                    },
                    "2013-04-30": {
                        "1. open": "28.6400",
                        "2. high": "33.1100",
                        "3. low": "28.1100",
                        "4. close": "33.1000",
                        "5. adjusted close": "28.3133",
                        "6. volume": "1322883228",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-03-28": {
                        "1. open": "27.7200",
                        "2. high": "28.6600",
                        "3. low": "27.5200",
                        "4. close": "28.6050",
                        "5. adjusted close": "24.4684",
                        "6. volume": "844946000",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-02-28": {
                        "1. open": "27.6700",
                        "2. high": "28.2000",
                        "3. low": "27.1000",
                        "4. close": "27.8000",
                        "5. adjusted close": "23.7798",
                        "6. volume": "780587000",
                        "7. dividend amount": "0.2300"
                    },
                    "2013-01-31": {
                        "1. open": "27.2500",
                        "2. high": "28.2300",
                        "3. low": "26.2800",
                        "4. close": "27.4500",
                        "5. adjusted close": "23.2894",
                        "6. volume": "1145054400",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-12-31": {
                        "1. open": "26.7800",
                        "2. high": "27.7300",
                        "3. low": "26.2600",
                        "4. close": "26.7097",
                        "5. adjusted close": "22.6613",
                        "6. volume": "947310900",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-11-30": {
                        "1. open": "28.8400",
                        "2. high": "30.2000",
                        "3. low": "26.3449",
                        "4. close": "26.6150",
                        "5. adjusted close": "22.5810",
                        "6. volume": "1310516100",
                        "7. dividend amount": "0.2300"
                    },
                    "2012-10-31": {
                        "1. open": "29.8100",
                        "2. high": "30.2500",
                        "3. low": "27.7600",
                        "4. close": "28.5400",
                        "5. adjusted close": "24.0103",
                        "6. volume": "1105402300",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-09-28": {
                        "1. open": "30.4500",
                        "2. high": "31.6100",
                        "3. low": "29.7400",
                        "4. close": "29.7600",
                        "5. adjusted close": "25.0367",
                        "6. volume": "893107700",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-08-31": {
                        "1. open": "29.5900",
                        "2. high": "30.9600",
                        "3. low": "28.9700",
                        "4. close": "30.8200",
                        "5. adjusted close": "25.9285",
                        "6. volume": "671748400",
                        "7. dividend amount": "0.2000"
                    },
                    "2012-07-31": {
                        "1. open": "30.6200",
                        "2. high": "31.0500",
                        "3. low": "28.5400",
                        "4. close": "29.4700",
                        "5. adjusted close": "24.6292",
                        "6. volume": "846604100",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-06-29": {
                        "1. open": "28.7600",
                        "2. high": "31.1400",
                        "3. low": "28.3200",
                        "4. close": "30.5900",
                        "5. adjusted close": "25.5653",
                        "6. volume": "973131400",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-05-31": {
                        "1. open": "32.0500",
                        "2. high": "32.3350",
                        "3. low": "28.6400",
                        "4. close": "29.1900",
                        "5. adjusted close": "24.3952",
                        "6. volume": "1014372600",
                        "7. dividend amount": "0.2000"
                    },
                    "2012-04-30": {
                        "1. open": "32.2200",
                        "2. high": "32.8900",
                        "3. low": "30.2300",
                        "4. close": "32.0150",
                        "5. adjusted close": "26.5802",
                        "6. volume": "940739700",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-03-30": {
                        "1. open": "31.9300",
                        "2. high": "32.9500",
                        "3. low": "31.4900",
                        "4. close": "32.2550",
                        "5. adjusted close": "26.7795",
                        "6. volume": "942366500",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-02-29": {
                        "1. open": "29.7900",
                        "2. high": "32.0000",
                        "3. low": "29.7100",
                        "4. close": "31.7400",
                        "5. adjusted close": "26.3519",
                        "6. volume": "984332300",
                        "7. dividend amount": "0.2000"
                    },
                    "2012-01-31": {
                        "1. open": "26.5500",
                        "2. high": "29.9500",
                        "3. low": "26.3900",
                        "4. close": "29.5300",
                        "5. adjusted close": "24.3560",
                        "6. volume": "1354858100",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-12-30": {
                        "1. open": "25.5600",
                        "2. high": "26.1900",
                        "3. low": "25.1600",
                        "4. close": "25.9600",
                        "5. adjusted close": "21.4115",
                        "6. volume": "1007166600",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-11-30": {
                        "1. open": "26.1900",
                        "2. high": "27.2000",
                        "3. low": "24.3000",
                        "4. close": "25.5800",
                        "5. adjusted close": "21.0981",
                        "6. volume": "1046207400",
                        "7. dividend amount": "0.2000"
                    },
                    "2011-10-31": {
                        "1. open": "24.7200",
                        "2. high": "27.5000",
                        "3. low": "24.2600",
                        "4. close": "26.6300",
                        "5. adjusted close": "21.8011",
                        "6. volume": "1218142500",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-09-30": {
                        "1. open": "26.4600",
                        "2. high": "27.5000",
                        "3. low": "24.6000",
                        "4. close": "24.8900",
                        "5. adjusted close": "20.3766",
                        "6. volume": "1279920200",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-08-31": {
                        "1. open": "27.5100",
                        "2. high": "27.6850",
                        "3. low": "23.7900",
                        "4. close": "26.6000",
                        "5. adjusted close": "21.7765",
                        "6. volume": "1719339500",
                        "7. dividend amount": "0.1600"
                    },
                    "2011-07-29": {
                        "1. open": "25.9300",
                        "2. high": "28.1450",
                        "3. low": "25.8400",
                        "4. close": "27.4000",
                        "5. adjusted close": "22.2908",
                        "6. volume": "1259328200",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-06-30": {
                        "1. open": "24.9900",
                        "2. high": "26.0000",
                        "3. low": "23.6500",
                        "4. close": "26.0000",
                        "5. adjusted close": "21.1518",
                        "6. volume": "1297757600",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-05-31": {
                        "1. open": "25.9400",
                        "2. high": "26.2500",
                        "3. low": "24.0300",
                        "4. close": "25.0100",
                        "5. adjusted close": "20.3464",
                        "6. volume": "1364062800",
                        "7. dividend amount": "0.1600"
                    },
                    "2011-04-29": {
                        "1. open": "25.5300",
                        "2. high": "26.8700",
                        "3. low": "24.7200",
                        "4. close": "25.9200",
                        "5. adjusted close": "20.9500",
                        "6. volume": "1313844800",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-03-31": {
                        "1. open": "26.6000",
                        "2. high": "26.7800",
                        "3. low": "24.6800",
                        "4. close": "25.3900",
                        "5. adjusted close": "20.5217",
                        "6. volume": "1310885200",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-02-28": {
                        "1. open": "27.8000",
                        "2. high": "28.3400",
                        "3. low": "26.4300",
                        "4. close": "26.5800",
                        "5. adjusted close": "21.4835",
                        "6. volume": "1114368500",
                        "7. dividend amount": "0.1600"
                    },
                    "2011-01-31": {
                        "1. open": "28.0500",
                        "2. high": "29.4600",
                        "3. low": "27.4200",
                        "4. close": "27.7250",
                        "5. adjusted close": "22.2767",
                        "6. volume": "1361258700",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-12-31": {
                        "1. open": "25.5700",
                        "2. high": "28.4000",
                        "3. low": "25.5600",
                        "4. close": "27.9100",
                        "5. adjusted close": "22.4254",
                        "6. volume": "1033710000",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-11-30": {
                        "1. open": "26.8800",
                        "2. high": "27.4900",
                        "3. low": "24.9300",
                        "4. close": "25.2575",
                        "5. adjusted close": "20.2941",
                        "6. volume": "1361176300",
                        "7. dividend amount": "0.1600"
                    },
                    "2010-10-29": {
                        "1. open": "24.4900",
                        "2. high": "27.2000",
                        "3. low": "23.7800",
                        "4. close": "26.6650",
                        "5. adjusted close": "21.2930",
                        "6. volume": "1281432800",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-09-30": {
                        "1. open": "23.6700",
                        "2. high": "25.5300",
                        "3. low": "23.5400",
                        "4. close": "24.4900",
                        "5. adjusted close": "19.5562",
                        "6. volume": "1273139500",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-08-31": {
                        "1. open": "25.9900",
                        "2. high": "26.3800",
                        "3. low": "23.3200",
                        "4. close": "23.4650",
                        "5. adjusted close": "18.7377",
                        "6. volume": "1279372100",
                        "7. dividend amount": "0.1300"
                    },
                    "2010-07-30": {
                        "1. open": "23.0900",
                        "2. high": "26.4100",
                        "3. low": "22.7300",
                        "4. close": "25.8100",
                        "5. adjusted close": "20.5024",
                        "6. volume": "1408590600",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-06-30": {
                        "1. open": "25.5300",
                        "2. high": "26.9300",
                        "3. low": "22.9500",
                        "4. close": "23.0100",
                        "5. adjusted close": "18.2782",
                        "6. volume": "1671811600",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-05-28": {
                        "1. open": "30.6700",
                        "2. high": "31.0606",
                        "3. low": "24.5600",
                        "4. close": "25.8000",
                        "5. adjusted close": "20.4945",
                        "6. volume": "1720130200",
                        "7. dividend amount": "0.1300"
                    },
                    "2010-04-30": {
                        "1. open": "29.3500",
                        "2. high": "31.5800",
                        "3. low": "28.6200",
                        "4. close": "30.5350",
                        "5. adjusted close": "24.1460",
                        "6. volume": "1319029500",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-03-31": {
                        "1. open": "28.7700",
                        "2. high": "30.5700",
                        "3. low": "28.2400",
                        "4. close": "29.2875",
                        "5. adjusted close": "23.1595",
                        "6. volume": "1110237200",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-02-26": {
                        "1. open": "28.3900",
                        "2. high": "29.0300",
                        "3. low": "27.5700",
                        "4. close": "28.6700",
                        "5. adjusted close": "22.6712",
                        "6. volume": "1074643300",
                        "7. dividend amount": "0.1300"
                    },
                    "2010-01-29": {
                        "1. open": "30.6200",
                        "2. high": "31.2400",
                        "3. low": "27.6600",
                        "4. close": "28.1800",
                        "5. adjusted close": "22.1820",
                        "6. volume": "1359650900",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-12-31": {
                        "1. open": "29.5200",
                        "2. high": "31.5000",
                        "3. low": "29.2500",
                        "4. close": "30.4800",
                        "5. adjusted close": "23.9925",
                        "6. volume": "920605500",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-11-30": {
                        "1. open": "27.7000",
                        "2. high": "30.1400",
                        "3. low": "27.4100",
                        "4. close": "29.4100",
                        "5. adjusted close": "23.1502",
                        "6. volume": "1018256700",
                        "7. dividend amount": "0.1300"
                    },
                    "2009-10-30": {
                        "1. open": "25.4050",
                        "2. high": "29.3500",
                        "3. low": "24.4300",
                        "4. close": "27.7300",
                        "5. adjusted close": "21.7336",
                        "6. volume": "1523430100",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-09-30": {
                        "1. open": "24.3500",
                        "2. high": "26.2500",
                        "3. low": "23.7600",
                        "4. close": "25.7200",
                        "5. adjusted close": "20.1583",
                        "6. volume": "1038979700",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-08-31": {
                        "1. open": "23.8200",
                        "2. high": "25.4900",
                        "3. low": "23.0300",
                        "4. close": "24.6500",
                        "5. adjusted close": "19.3197",
                        "6. volume": "993250400",
                        "7. dividend amount": "0.1300"
                    },
                    "2009-07-31": {
                        "1. open": "24.0500",
                        "2. high": "25.7200",
                        "3. low": "22.0000",
                        "4. close": "23.5200",
                        "5. adjusted close": "18.3329",
                        "6. volume": "1517459800",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-06-30": {
                        "1. open": "21.0000",
                        "2. high": "24.3400",
                        "3. low": "20.8600",
                        "4. close": "23.7700",
                        "5. adjusted close": "18.5278",
                        "6. volume": "1411144700",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-05-29": {
                        "1. open": "20.1900",
                        "2. high": "20.9400",
                        "3. low": "19.0100",
                        "4. close": "20.8900",
                        "5. adjusted close": "16.2830",
                        "6. volume": "1101122400",
                        "7. dividend amount": "0.1300"
                    },
                    "2009-04-30": {
                        "1. open": "18.2300",
                        "2. high": "21.2000",
                        "3. low": "18.1800",
                        "4. close": "20.2600",
                        "5. adjusted close": "15.6915",
                        "6. volume": "1562400700",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-03-31": {
                        "1. open": "16.0350",
                        "2. high": "18.8800",
                        "3. low": "14.8700",
                        "4. close": "18.3700",
                        "5. adjusted close": "14.2276",
                        "6. volume": "1625752800",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-02-27": {
                        "1. open": "17.0100",
                        "2. high": "19.9300",
                        "3. low": "16.1000",
                        "4. close": "16.1500",
                        "5. adjusted close": "12.5082",
                        "6. volume": "1456213400",
                        "7. dividend amount": "0.1300"
                    },
                    "2009-01-30": {
                        "1. open": "19.5328",
                        "2. high": "21.0000",
                        "3. low": "16.7500",
                        "4. close": "17.1000",
                        "5. adjusted close": "13.1495",
                        "6. volume": "1564043400",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-12-31": {
                        "1. open": "19.8750",
                        "2. high": "21.2500",
                        "3. low": "18.4700",
                        "4. close": "19.4400",
                        "5. adjusted close": "14.9489",
                        "6. volume": "1546943400",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-11-28": {
                        "1. open": "22.4800",
                        "2. high": "23.6600",
                        "3. low": "17.5000",
                        "4. close": "20.2200",
                        "5. adjusted close": "15.5487",
                        "6. volume": "1794911800",
                        "7. dividend amount": "0.1300"
                    },
                    "2008-10-31": {
                        "1. open": "26.3800",
                        "2. high": "27.4700",
                        "3. low": "20.6500",
                        "4. close": "22.3300",
                        "5. adjusted close": "17.0583",
                        "6. volume": "3044579400",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-09-30": {
                        "1. open": "27.6650",
                        "2. high": "27.7600",
                        "3. low": "23.5000",
                        "4. close": "26.6900",
                        "5. adjusted close": "20.3889",
                        "6. volume": "1927538700",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-08-29": {
                        "1. open": "25.9500",
                        "2. high": "28.5000",
                        "3. low": "25.0700",
                        "4. close": "27.2900",
                        "5. adjusted close": "20.8473",
                        "6. volume": "1206949700",
                        "7. dividend amount": "0.1100"
                    },
                    "2008-07-31": {
                        "1. open": "27.2200",
                        "2. high": "27.9100",
                        "3. low": "24.8700",
                        "4. close": "25.7200",
                        "5. adjusted close": "19.5692",
                        "6. volume": "1579425446",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-06-30": {
                        "1. open": "28.2400",
                        "2. high": "29.5700",
                        "3. low": "27.1100",
                        "4. close": "27.5100",
                        "5. adjusted close": "20.9311",
                        "6. volume": "1560439100",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-05-30": {
                        "1. open": "28.4800",
                        "2. high": "30.5300",
                        "3. low": "27.9500",
                        "4. close": "28.3200",
                        "5. adjusted close": "21.5474",
                        "6. volume": "1405170200",
                        "7. dividend amount": "0.1100"
                    },
                    "2008-04-30": {
                        "1. open": "28.8300",
                        "2. high": "32.1000",
                        "3. low": "27.9300",
                        "4. close": "28.5200",
                        "5. adjusted close": "21.6197",
                        "6. volume": "1444720000",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-03-31": {
                        "1. open": "27.2400",
                        "2. high": "29.5900",
                        "3. low": "26.8700",
                        "4. close": "28.3800",
                        "5. adjusted close": "21.5136",
                        "6. volume": "1452390200",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-02-29": {
                        "1. open": "31.0600",
                        "2. high": "33.2500",
                        "3. low": "27.0200",
                        "4. close": "27.1999",
                        "5. adjusted close": "20.6190",
                        "6. volume": "2324580800",
                        "7. dividend amount": "0.1100"
                    },
                    "2008-01-31": {
                        "1. open": "35.7900",
                        "2. high": "35.9600",
                        "3. low": "31.0400",
                        "4. close": "32.6000",
                        "5. adjusted close": "24.6164",
                        "6. volume": "1950301600",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-12-31": {
                        "1. open": "33.5000",
                        "2. high": "36.7200",
                        "3. low": "32.6300",
                        "4. close": "35.6000",
                        "5. adjusted close": "26.8817",
                        "6. volume": "1064817100",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-11-30": {
                        "1. open": "36.5300",
                        "2. high": "37.5000",
                        "3. low": "32.6800",
                        "4. close": "33.6000",
                        "5. adjusted close": "25.3715",
                        "6. volume": "1830846800",
                        "7. dividend amount": "0.1100"
                    },
                    "2007-10-31": {
                        "1. open": "29.4600",
                        "2. high": "37.0000",
                        "3. low": "29.2900",
                        "4. close": "36.8100",
                        "5. adjusted close": "27.7070",
                        "6. volume": "1772076700",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-09-28": {
                        "1. open": "28.5000",
                        "2. high": "29.8500",
                        "3. low": "28.2700",
                        "4. close": "29.4600",
                        "5. adjusted close": "22.1746",
                        "6. volume": "1117419500",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-08-31": {
                        "1. open": "28.9700",
                        "2. high": "30.1000",
                        "3. low": "27.5100",
                        "4. close": "28.7300",
                        "5. adjusted close": "21.6251",
                        "6. volume": "1228579500",
                        "7. dividend amount": "0.1000"
                    },
                    "2007-07-31": {
                        "1. open": "29.6700",
                        "2. high": "31.8400",
                        "3. low": "28.9500",
                        "4. close": "28.9900",
                        "5. adjusted close": "21.7439",
                        "6. volume": "1295548000",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-06-29": {
                        "1. open": "30.7900",
                        "2. high": "30.9000",
                        "3. low": "29.0400",
                        "4. close": "29.4700",
                        "5. adjusted close": "22.1039",
                        "6. volume": "1181412800",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-05-31": {
                        "1. open": "29.9400",
                        "2. high": "31.1600",
                        "3. low": "29.9000",
                        "4. close": "30.6901",
                        "5. adjusted close": "23.0191",
                        "6. volume": "1327154700",
                        "7. dividend amount": "0.1000"
                    },
                    "2007-04-30": {
                        "1. open": "27.8900",
                        "2. high": "30.7400",
                        "3. low": "27.5600",
                        "4. close": "29.9400",
                        "5. adjusted close": "22.3840",
                        "6. volume": "958964900",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-03-30": {
                        "1. open": "27.8200",
                        "2. high": "28.5500",
                        "3. low": "26.6000",
                        "4. close": "27.8700",
                        "5. adjusted close": "20.8364",
                        "6. volume": "1269506500",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-02-28": {
                        "1. open": "30.8400",
                        "2. high": "30.9400",
                        "3. low": "27.7900",
                        "4. close": "28.1700",
                        "5. adjusted close": "21.0607",
                        "6. volume": "1290850900",
                        "7. dividend amount": "0.1000"
                    },
                    "2007-01-31": {
                        "1. open": "29.9100",
                        "2. high": "31.4800",
                        "3. low": "29.4000",
                        "4. close": "30.8600",
                        "5. adjusted close": "22.9926",
                        "6. volume": "1324518200",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-12-29": {
                        "1. open": "29.2300",
                        "2. high": "30.2600",
                        "3. low": "28.8000",
                        "4. close": "29.8600",
                        "5. adjusted close": "22.2475",
                        "6. volume": "1137160900",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-11-30": {
                        "1. open": "28.7800",
                        "2. high": "30.0001",
                        "3. low": "28.5800",
                        "4. close": "29.3600",
                        "5. adjusted close": "21.8750",
                        "6. volume": "1239142000",
                        "7. dividend amount": "0.1000"
                    },
                    "2006-10-31": {
                        "1. open": "27.3200",
                        "2. high": "28.8501",
                        "3. low": "27.1500",
                        "4. close": "28.7100",
                        "5. adjusted close": "21.3178",
                        "6. volume": "1290967400",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-09-29": {
                        "1. open": "25.8900",
                        "2. high": "27.5200",
                        "3. low": "25.3900",
                        "4. close": "27.3500",
                        "5. adjusted close": "20.3079",
                        "6. volume": "1097482600",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-08-31": {
                        "1. open": "24.0200",
                        "2. high": "26.2501",
                        "3. low": "23.8500",
                        "4. close": "25.7000",
                        "5. adjusted close": "19.0828",
                        "6. volume": "1134188400",
                        "7. dividend amount": "0.0900"
                    },
                    "2006-07-31": {
                        "1. open": "23.5300",
                        "2. high": "24.6000",
                        "3. low": "22.2300",
                        "4. close": "24.0600",
                        "5. adjusted close": "17.8000",
                        "6. volume": "1332298100",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-06-30": {
                        "1. open": "22.7400",
                        "2. high": "23.6500",
                        "3. low": "21.4599",
                        "4. close": "23.3000",
                        "5. adjusted close": "17.2377",
                        "6. volume": "1971637200",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-05-31": {
                        "1. open": "24.3300",
                        "2. high": "25.0000",
                        "3. low": "22.4500",
                        "4. close": "22.6500",
                        "5. adjusted close": "16.7568",
                        "6. volume": "2309193400",
                        "7. dividend amount": "0.0900"
                    },
                    "2006-04-28": {
                        "1. open": "27.6700",
                        "2. high": "27.9410",
                        "3. low": "24.0000",
                        "4. close": "24.1500",
                        "5. adjusted close": "17.7974",
                        "6. volume": "1446126900",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-03-31": {
                        "1. open": "26.9900",
                        "2. high": "28.2200",
                        "3. low": "26.6200",
                        "4. close": "27.2100",
                        "5. adjusted close": "20.0524",
                        "6. volume": "1437940900",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-02-28": {
                        "1. open": "27.9500",
                        "2. high": "28.0700",
                        "3. low": "26.3400",
                        "4. close": "26.8700",
                        "5. adjusted close": "19.8019",
                        "6. volume": "1047699000",
                        "7. dividend amount": "0.0900"
                    },
                    "2006-01-31": {
                        "1. open": "26.2500",
                        "2. high": "28.3800",
                        "3. low": "26.1000",
                        "4. close": "28.1500",
                        "5. adjusted close": "20.6759",
                        "6. volume": "1388622700",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-12-30": {
                        "1. open": "27.7300",
                        "2. high": "28.1010",
                        "3. low": "26.1000",
                        "4. close": "26.1500",
                        "5. adjusted close": "19.2070",
                        "6. volume": "1271695500",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-11-30": {
                        "1. open": "25.6100",
                        "2. high": "28.2500",
                        "3. low": "25.6100",
                        "4. close": "27.6800",
                        "5. adjusted close": "20.3307",
                        "6. volume": "1444948300",
                        "7. dividend amount": "0.0800"
                    },
                    "2005-10-31": {
                        "1. open": "25.7100",
                        "2. high": "25.8000",
                        "3. low": "24.2500",
                        "4. close": "25.7000",
                        "5. adjusted close": "18.8217",
                        "6. volume": "1439659900",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-09-30": {
                        "1. open": "27.3800",
                        "2. high": "27.3900",
                        "3. low": "25.1200",
                        "4. close": "25.7300",
                        "5. adjusted close": "18.8437",
                        "6. volume": "1348861500",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-08-31": {
                        "1. open": "25.8200",
                        "2. high": "27.9400",
                        "3. low": "25.7600",
                        "4. close": "27.3800",
                        "5. adjusted close": "20.0521",
                        "6. volume": "1441979300",
                        "7. dividend amount": "0.0800"
                    },
                    "2005-07-29": {
                        "1. open": "24.8500",
                        "2. high": "26.4800",
                        "3. low": "24.5000",
                        "4. close": "25.6100",
                        "5. adjusted close": "18.7006",
                        "6. volume": "1321407700",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-06-30": {
                        "1. open": "25.7300",
                        "2. high": "26.0000",
                        "3. low": "24.8200",
                        "4. close": "24.8400",
                        "5. adjusted close": "18.1384",
                        "6. volume": "1303029500",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-05-31": {
                        "1. open": "25.2300",
                        "2. high": "26.0900",
                        "3. low": "24.3100",
                        "4. close": "25.8000",
                        "5. adjusted close": "18.8394",
                        "6. volume": "1270563700",
                        "7. dividend amount": "0.0800"
                    },
                    "2005-04-29": {
                        "1. open": "24.2400",
                        "2. high": "25.4500",
                        "3. low": "23.9400",
                        "4. close": "25.3000",
                        "5. adjusted close": "18.4165",
                        "6. volume": "1520253700",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-03-31": {
                        "1. open": "25.2000",
                        "2. high": "25.7900",
                        "3. low": "23.8200",
                        "4. close": "24.1700",
                        "5. adjusted close": "17.5939",
                        "6. volume": "1541411300",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-02-28": {
                        "1. open": "26.2500",
                        "2. high": "26.5000",
                        "3. low": "25.1296",
                        "4. close": "25.1600",
                        "5. adjusted close": "18.3146",
                        "6. volume": "1361126000",
                        "7. dividend amount": "0.0800"
                    },
                    "2005-01-31": {
                        "1. open": "26.8000",
                        "2. high": "27.1000",
                        "3. low": "25.6400",
                        "4. close": "26.2800",
                        "5. adjusted close": "19.0710",
                        "6. volume": "1521414300",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-12-31": {
                        "1. open": "26.9500",
                        "2. high": "27.4400",
                        "3. low": "26.6790",
                        "4. close": "26.7200",
                        "5. adjusted close": "19.3903",
                        "6. volume": "1803777700",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-11-30": {
                        "1. open": "28.1500",
                        "2. high": "30.2000",
                        "3. low": "24.8600",
                        "4. close": "26.8100",
                        "5. adjusted close": "19.4556",
                        "6. volume": "1739407300",
                        "7. dividend amount": "3.0800"
                    },
                    "2004-10-29": {
                        "1. open": "27.8100",
                        "2. high": "28.8900",
                        "3. low": "27.4200",
                        "4. close": "27.9700",
                        "5. adjusted close": "18.2457",
                        "6. volume": "1300591200",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-09-30": {
                        "1. open": "27.2400",
                        "2. high": "27.7900",
                        "3. low": "26.7400",
                        "4. close": "27.6500",
                        "5. adjusted close": "18.0369",
                        "6. volume": "1141012300",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-08-31": {
                        "1. open": "28.2700",
                        "2. high": "28.5500",
                        "3. low": "25.9500",
                        "4. close": "27.3000",
                        "5. adjusted close": "17.8086",
                        "6. volume": "1094195300",
                        "7. dividend amount": "0.0800"
                    },
                    "2004-07-30": {
                        "1. open": "28.6900",
                        "2. high": "29.8900",
                        "3. low": "27.2500",
                        "4. close": "28.4900",
                        "5. adjusted close": "18.5305",
                        "6. volume": "1550446900",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-06-30": {
                        "1. open": "26.1200",
                        "2. high": "28.8000",
                        "3. low": "25.8600",
                        "4. close": "28.5600",
                        "5. adjusted close": "18.5760",
                        "6. volume": "1534889700",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-05-28": {
                        "1. open": "26.2100",
                        "2. high": "26.6000",
                        "3. low": "25.4200",
                        "4. close": "26.2300",
                        "5. adjusted close": "17.0605",
                        "6. volume": "1141456900",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-04-30": {
                        "1. open": "24.9500",
                        "2. high": "27.7200",
                        "3. low": "24.8500",
                        "4. close": "26.1300",
                        "5. adjusted close": "16.9955",
                        "6. volume": "1558947800",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-03-31": {
                        "1. open": "26.6500",
                        "2. high": "26.7200",
                        "3. low": "24.0100",
                        "4. close": "24.9300",
                        "5. adjusted close": "16.2150",
                        "6. volume": "1703041000",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-02-27": {
                        "1. open": "27.6300",
                        "2. high": "27.8000",
                        "3. low": "26.3500",
                        "4. close": "26.5300",
                        "5. adjusted close": "17.2556",
                        "6. volume": "1032065600",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-01-30": {
                        "1. open": "27.5800",
                        "2. high": "28.8300",
                        "3. low": "27.2600",
                        "4. close": "27.6500",
                        "5. adjusted close": "17.9841",
                        "6. volume": "1232189000",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-12-31": {
                        "1. open": "25.9000",
                        "2. high": "27.5500",
                        "3. low": "25.5000",
                        "4. close": "27.3700",
                        "5. adjusted close": "17.8020",
                        "6. volume": "1476461300",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-11-28": {
                        "1. open": "26.3500",
                        "2. high": "26.7500",
                        "3. low": "24.8400",
                        "4. close": "25.7100",
                        "5. adjusted close": "16.7223",
                        "6. volume": "1442336700",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-10-31": {
                        "1. open": "28.0300",
                        "2. high": "29.4600",
                        "3. low": "25.9100",
                        "4. close": "26.1400",
                        "5. adjusted close": "17.0020",
                        "6. volume": "1400032500",
                        "7. dividend amount": "0.1600"
                    },
                    "2003-09-30": {
                        "1. open": "26.7000",
                        "2. high": "30.0000",
                        "3. low": "26.4700",
                        "4. close": "27.8000",
                        "5. adjusted close": "17.9827",
                        "6. volume": "1253309100",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-08-29": {
                        "1. open": "26.3300",
                        "2. high": "26.9500",
                        "3. low": "25.4300",
                        "4. close": "26.5200",
                        "5. adjusted close": "17.1547",
                        "6. volume": "966506900",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-07-31": {
                        "1. open": "25.5900",
                        "2. high": "27.8100",
                        "3. low": "25.3900",
                        "4. close": "26.4100",
                        "5. adjusted close": "17.0836",
                        "6. volume": "1292011000",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-06-30": {
                        "1. open": "24.9800",
                        "2. high": "26.5100",
                        "3. low": "23.6000",
                        "4. close": "25.6400",
                        "5. adjusted close": "16.5855",
                        "6. volume": "1569995800",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-05-30": {
                        "1. open": "25.5400",
                        "2. high": "26.5000",
                        "3. low": "23.8900",
                        "4. close": "24.6100",
                        "5. adjusted close": "15.9192",
                        "6. volume": "1311003700",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-04-30": {
                        "1. open": "24.4600",
                        "2. high": "26.4300",
                        "3. low": "23.9500",
                        "4. close": "25.5700",
                        "5. adjusted close": "16.5402",
                        "6. volume": "1249617700",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-03-31": {
                        "1. open": "24.0200",
                        "2. high": "26.8000",
                        "3. low": "22.5500",
                        "4. close": "24.2100",
                        "5. adjusted close": "15.6605",
                        "6. volume": "1371902600",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-02-28": {
                        "1. open": "47.9300",
                        "2. high": "49.1000",
                        "3. low": "23.3000",
                        "4. close": "23.7000",
                        "5. adjusted close": "15.3306",
                        "6. volume": "910628150",
                        "7. dividend amount": "0.0800"
                    },
                    "2003-01-31": {
                        "1. open": "52.3000",
                        "2. high": "57.3200",
                        "3. low": "47.0300",
                        "4. close": "47.4600",
                        "5. adjusted close": "15.3001",
                        "6. volume": "859331100",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-12-31": {
                        "1. open": "58.6500",
                        "2. high": "58.9600",
                        "3. low": "51.2600",
                        "4. close": "51.7000",
                        "5. adjusted close": "16.6670",
                        "6. volume": "634185100",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-11-29": {
                        "1. open": "52.4300",
                        "2. high": "58.6400",
                        "3. low": "51.9000",
                        "4. close": "57.6800",
                        "5. adjusted close": "18.5948",
                        "6. volume": "777998600",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-10-31": {
                        "1. open": "44.3200",
                        "2. high": "54.0700",
                        "3. low": "43.1900",
                        "4. close": "53.4700",
                        "5. adjusted close": "17.2376",
                        "6. volume": "1237685300",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-09-30": {
                        "1. open": "48.5200",
                        "2. high": "51.1000",
                        "3. low": "43.1100",
                        "4. close": "43.7400",
                        "5. adjusted close": "14.1008",
                        "6. volume": "847852900",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-08-30": {
                        "1. open": "47.5800",
                        "2. high": "53.4500",
                        "3. low": "43.8000",
                        "4. close": "49.0800",
                        "5. adjusted close": "15.8223",
                        "6. volume": "857878600",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-07-31": {
                        "1. open": "54.1200",
                        "2. high": "54.9300",
                        "3. low": "41.4100",
                        "4. close": "47.9800",
                        "5. adjusted close": "15.4677",
                        "6. volume": "1216094000",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-06-28": {
                        "1. open": "50.9900",
                        "2. high": "56.4400",
                        "3. low": "49.1700",
                        "4. close": "54.7000",
                        "5. adjusted close": "17.6341",
                        "6. volume": "917036500",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-05-31": {
                        "1. open": "52.1600",
                        "2. high": "56.4400",
                        "3. low": "48.3500",
                        "4. close": "50.9100",
                        "5. adjusted close": "16.4123",
                        "6. volume": "710133100",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-04-30": {
                        "1. open": "59.8300",
                        "2. high": "60.4000",
                        "3. low": "51.4400",
                        "4. close": "52.2600",
                        "5. adjusted close": "16.8475",
                        "6. volume": "708739700",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-03-28": {
                        "1. open": "59.0500",
                        "2. high": "65.0000",
                        "3. low": "58.3100",
                        "4. close": "60.3100",
                        "5. adjusted close": "19.4427",
                        "6. volume": "536622100",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-02-28": {
                        "1. open": "64.1500",
                        "2. high": "64.5000",
                        "3. low": "57.1500",
                        "4. close": "58.3400",
                        "5. adjusted close": "18.8076",
                        "6. volume": "565579600",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-01-31": {
                        "1. open": "66.6500",
                        "2. high": "70.6200",
                        "3. low": "61.3300",
                        "4. close": "63.7100",
                        "5. adjusted close": "20.5387",
                        "6. volume": "680057900",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-12-31": {
                        "1. open": "63.8300",
                        "2. high": "69.8900",
                        "3. low": "63.8000",
                        "4. close": "66.2500",
                        "5. adjusted close": "21.3576",
                        "6. volume": "488544500",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-11-30": {
                        "1. open": "60.0800",
                        "2. high": "68.3400",
                        "3. low": "59.6000",
                        "4. close": "64.2100",
                        "5. adjusted close": "20.6999",
                        "6. volume": "665484300",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-10-31": {
                        "1. open": "50.9400",
                        "2. high": "63.6300",
                        "3. low": "50.4100",
                        "4. close": "58.1500",
                        "5. adjusted close": "18.7463",
                        "6. volume": "875445500",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-09-28": {
                        "1. open": "57.1900",
                        "2. high": "59.0800",
                        "3. low": "47.5000",
                        "4. close": "51.1700",
                        "5. adjusted close": "16.4961",
                        "6. volume": "755412200",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-08-31": {
                        "1. open": "66.8000",
                        "2. high": "67.5400",
                        "3. low": "56.3000",
                        "4. close": "57.0500",
                        "5. adjusted close": "18.3917",
                        "6. volume": "576948200",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-07-31": {
                        "1. open": "72.0500",
                        "2. high": "73.1500",
                        "3. low": "64.2000",
                        "4. close": "66.1900",
                        "5. adjusted close": "21.3382",
                        "6. volume": "727600500",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-06-29": {
                        "1. open": "69.6000",
                        "2. high": "76.1500",
                        "3. low": "66.0100",
                        "4. close": "73.0000",
                        "5. adjusted close": "23.5336",
                        "6. volume": "724588900",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-05-31": {
                        "1. open": "67.6600",
                        "2. high": "72.1500",
                        "3. low": "67.2500",
                        "4. close": "69.1800",
                        "5. adjusted close": "22.3021",
                        "6. volume": "888652900",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-04-30": {
                        "1. open": "54.8100",
                        "2. high": "71.1000",
                        "3. low": "51.0600",
                        "4. close": "67.7500",
                        "5. adjusted close": "21.8411",
                        "6. volume": "1037903500",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-03-30": {
                        "1. open": "58.5600",
                        "2. high": "61.1300",
                        "3. low": "49.7500",
                        "4. close": "54.6900",
                        "5. adjusted close": "17.6309",
                        "6. volume": "947674900",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-02-28": {
                        "1. open": "60.8100",
                        "2. high": "65.0600",
                        "3. low": "53.8800",
                        "4. close": "59.0000",
                        "5. adjusted close": "19.0203",
                        "6. volume": "768447800",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-01-31": {
                        "1. open": "44.1300",
                        "2. high": "64.7500",
                        "3. low": "42.8800",
                        "4. close": "61.0600",
                        "5. adjusted close": "19.6844",
                        "6. volume": "1002765600",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-12-29": {
                        "1. open": "58.0600",
                        "2. high": "60.6300",
                        "3. low": "40.3100",
                        "4. close": "43.3800",
                        "5. adjusted close": "13.9848",
                        "6. volume": "1028334100",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-11-30": {
                        "1. open": "68.5000",
                        "2. high": "72.3700",
                        "3. low": "57.0000",
                        "4. close": "57.3800",
                        "5. adjusted close": "18.4981",
                        "6. volume": "991731300",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-10-31": {
                        "1. open": "60.5000",
                        "2. high": "70.1200",
                        "3. low": "48.4400",
                        "4. close": "68.8700",
                        "5. adjusted close": "22.2022",
                        "6. volume": "1234707800",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-09-29": {
                        "1. open": "70.0000",
                        "2. high": "72.0600",
                        "3. low": "58.6300",
                        "4. close": "60.3100",
                        "5. adjusted close": "19.4427",
                        "6. volume": "712766900",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-08-31": {
                        "1. open": "69.9400",
                        "2. high": "74.8700",
                        "3. low": "68.1200",
                        "4. close": "69.8100",
                        "5. adjusted close": "22.5052",
                        "6. volume": "609699900",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-07-31": {
                        "1. open": "79.6900",
                        "2. high": "82.8700",
                        "3. low": "67.2500",
                        "4. close": "69.8100",
                        "5. adjusted close": "22.5052",
                        "6. volume": "617092900",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-06-30": {
                        "1. open": "64.3700",
                        "2. high": "82.1900",
                        "3. low": "63.8100",
                        "4. close": "80.0000",
                        "5. adjusted close": "25.7903",
                        "6. volume": "733525100",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-05-31": {
                        "1. open": "72.8700",
                        "2. high": "74.0000",
                        "3. low": "60.3800",
                        "4. close": "62.5600",
                        "5. adjusted close": "20.1680",
                        "6. volume": "672215400",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-04-28": {
                        "1. open": "94.4400",
                        "2. high": "96.5000",
                        "3. low": "65.0000",
                        "4. close": "69.7500",
                        "5. adjusted close": "22.4859",
                        "6. volume": "1129073300",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-03-31": {
                        "1. open": "89.6200",
                        "2. high": "115.0000",
                        "3. low": "88.9400",
                        "4. close": "106.2500",
                        "5. adjusted close": "34.2527",
                        "6. volume": "1014093800",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-02-29": {
                        "1. open": "98.5000",
                        "2. high": "110.0000",
                        "3. low": "88.1200",
                        "4. close": "89.3700",
                        "5. adjusted close": "28.8110",
                        "6. volume": "667243800",
                        "7. dividend amount": "0.0000"
                    }
                }
            },
            {
                "Meta Data": {
                    "1. Information": "Monthly Adjusted Prices and Volumes",
                    "2. Symbol": "V",
                    "3. Last Refreshed": "2020-01-08",
                    "4. Time Zone": "US/Eastern"
                },
                "Monthly Adjusted Time Series": {
                    "2020-01-08": {
                        "1. open": "189.0000",
                        "2. high": "192.5000",
                        "3. low": "187.1630",
                        "4. close": "191.9200",
                        "5. adjusted close": "191.9200",
                        "6. volume": "33845703",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-12-31": {
                        "1. open": "184.2400",
                        "2. high": "189.8862",
                        "3. low": "179.6600",
                        "4. close": "187.9000",
                        "5. adjusted close": "187.9000",
                        "6. volume": "160394084",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-11-29": {
                        "1. open": "180.1300",
                        "2. high": "184.8500",
                        "3. low": "175.1800",
                        "4. close": "184.5100",
                        "5. adjusted close": "184.5100",
                        "6. volume": "134065026",
                        "7. dividend amount": "0.3000"
                    },
                    "2019-10-31": {
                        "1. open": "173.0200",
                        "2. high": "180.1800",
                        "3. low": "168.5900",
                        "4. close": "178.8600",
                        "5. adjusted close": "178.5620",
                        "6. volume": "162923578",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-09-30": {
                        "1. open": "180.5200",
                        "2. high": "187.0500",
                        "3. low": "172.0100",
                        "4. close": "172.0100",
                        "5. adjusted close": "171.7234",
                        "6. volume": "171931176",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-08-30": {
                        "1. open": "179.1900",
                        "2. high": "182.4000",
                        "3. low": "166.9750",
                        "4. close": "180.8200",
                        "5. adjusted close": "180.5187",
                        "6. volume": "154470525",
                        "7. dividend amount": "0.2500"
                    },
                    "2019-07-31": {
                        "1. open": "175.3300",
                        "2. high": "184.0700",
                        "3. low": "172.7400",
                        "4. close": "178.0000",
                        "5. adjusted close": "177.4517",
                        "6. volume": "126736340",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-06-28": {
                        "1. open": "161.5400",
                        "2. high": "174.9400",
                        "3. low": "156.7500",
                        "4. close": "173.5500",
                        "5. adjusted close": "173.0154",
                        "6. volume": "158885114",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-05-31": {
                        "1. open": "165.5400",
                        "2. high": "165.7700",
                        "3. low": "156.4200",
                        "4. close": "161.3300",
                        "5. adjusted close": "160.8331",
                        "6. volume": "147282119",
                        "7. dividend amount": "0.2500"
                    },
                    "2019-04-30": {
                        "1. open": "157.5300",
                        "2. high": "165.7000",
                        "3. low": "156.3200",
                        "4. close": "164.4300",
                        "5. adjusted close": "163.6753",
                        "6. volume": "136490658",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-03-29": {
                        "1. open": "149.4600",
                        "2. high": "156.8200",
                        "3. low": "144.5000",
                        "4. close": "156.1900",
                        "5. adjusted close": "155.4732",
                        "6. volume": "207401562",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-02-28": {
                        "1. open": "135.3900",
                        "2. high": "148.8200",
                        "3. low": "135.2600",
                        "4. close": "148.1200",
                        "5. adjusted close": "147.4402",
                        "6. volume": "154776247",
                        "7. dividend amount": "0.2500"
                    },
                    "2019-01-31": {
                        "1. open": "130.0000",
                        "2. high": "139.9000",
                        "3. low": "127.8800",
                        "4. close": "135.0100",
                        "5. adjusted close": "134.1561",
                        "6. volume": "193205412",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-12-31": {
                        "1. open": "145.0000",
                        "2. high": "145.7200",
                        "3. low": "121.6000",
                        "4. close": "131.9400",
                        "5. adjusted close": "131.1055",
                        "6. volume": "242677721",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-11-30": {
                        "1. open": "139.0000",
                        "2. high": "145.4600",
                        "3. low": "129.5400",
                        "4. close": "141.7100",
                        "5. adjusted close": "140.8137",
                        "6. volume": "208766205",
                        "7. dividend amount": "0.2500"
                    },
                    "2018-10-31": {
                        "1. open": "150.8900",
                        "2. high": "151.5600",
                        "3. low": "129.7900",
                        "4. close": "137.8500",
                        "5. adjusted close": "136.7371",
                        "6. volume": "254092004",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-09-28": {
                        "1. open": "146.9300",
                        "2. high": "150.6400",
                        "3. low": "142.5400",
                        "4. close": "150.0900",
                        "5. adjusted close": "148.8783",
                        "6. volume": "147500495",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-08-31": {
                        "1. open": "137.7400",
                        "2. high": "147.7100",
                        "3. low": "137.0000",
                        "4. close": "146.8900",
                        "5. adjusted close": "145.7041",
                        "6. volume": "143157273",
                        "7. dividend amount": "0.2100"
                    },
                    "2018-07-31": {
                        "1. open": "131.9600",
                        "2. high": "143.1400",
                        "3. low": "131.1500",
                        "4. close": "136.7400",
                        "5. adjusted close": "135.4339",
                        "6. volume": "161562542",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-06-29": {
                        "1. open": "131.8400",
                        "2. high": "136.6900",
                        "3. low": "129.5300",
                        "4. close": "132.4500",
                        "5. adjusted close": "131.1849",
                        "6. volume": "154720393",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-05-31": {
                        "1. open": "126.8600",
                        "2. high": "132.5000",
                        "3. low": "125.3217",
                        "4. close": "130.7200",
                        "5. adjusted close": "129.4714",
                        "6. volume": "147562270",
                        "7. dividend amount": "0.2100"
                    },
                    "2018-04-30": {
                        "1. open": "119.2700",
                        "2. high": "127.9000",
                        "3. low": "116.7102",
                        "4. close": "126.8800",
                        "5. adjusted close": "125.4653",
                        "6. volume": "165231144",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-03-29": {
                        "1. open": "123.2600",
                        "2. high": "125.4400",
                        "3. low": "116.0300",
                        "4. close": "119.6200",
                        "5. adjusted close": "118.2862",
                        "6. volume": "182392051",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-02-28": {
                        "1. open": "124.7400",
                        "2. high": "126.2600",
                        "3. low": "111.0201",
                        "4. close": "122.9400",
                        "5. adjusted close": "121.5692",
                        "6. volume": "183890719",
                        "7. dividend amount": "0.2100"
                    },
                    "2018-01-31": {
                        "1. open": "114.5700",
                        "2. high": "126.8800",
                        "3. low": "113.9500",
                        "4. close": "124.2300",
                        "5. adjusted close": "122.6342",
                        "6. volume": "144967375",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-12-29": {
                        "1. open": "112.3800",
                        "2. high": "114.9199",
                        "3. low": "106.6000",
                        "4. close": "114.0200",
                        "5. adjusted close": "112.5554",
                        "6. volume": "175640154",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-11-30": {
                        "1. open": "110.5000",
                        "2. high": "113.6200",
                        "3. low": "106.9000",
                        "4. close": "112.5900",
                        "5. adjusted close": "111.1437",
                        "6. volume": "136052597",
                        "7. dividend amount": "0.1950"
                    },
                    "2017-10-31": {
                        "1. open": "105.5400",
                        "2. high": "110.7400",
                        "3. low": "104.8977",
                        "4. close": "109.9800",
                        "5. adjusted close": "108.3769",
                        "6. volume": "140428442",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-09-29": {
                        "1. open": "104.0400",
                        "2. high": "106.8350",
                        "3. low": "102.2600",
                        "4. close": "105.2400",
                        "5. adjusted close": "103.7060",
                        "6. volume": "137450408",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-08-31": {
                        "1. open": "100.3600",
                        "2. high": "104.2000",
                        "3. low": "99.4300",
                        "4. close": "103.5200",
                        "5. adjusted close": "102.0111",
                        "6. volume": "148740209",
                        "7. dividend amount": "0.1650"
                    },
                    "2017-07-31": {
                        "1. open": "94.3800",
                        "2. high": "101.1800",
                        "3. low": "93.1900",
                        "4. close": "99.5600",
                        "5. adjusted close": "97.9524",
                        "6. volume": "154989518",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-06-30": {
                        "1. open": "95.4000",
                        "2. high": "96.6000",
                        "3. low": "92.8000",
                        "4. close": "93.7800",
                        "5. adjusted close": "92.2657",
                        "6. volume": "197251059",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-05-31": {
                        "1. open": "91.2900",
                        "2. high": "95.5300",
                        "3. low": "91.1400",
                        "4. close": "95.2300",
                        "5. adjusted close": "93.6923",
                        "6. volume": "155976358",
                        "7. dividend amount": "0.1650"
                    },
                    "2017-04-28": {
                        "1. open": "89.1400",
                        "2. high": "92.8000",
                        "3. low": "88.1300",
                        "4. close": "91.2200",
                        "5. adjusted close": "89.5859",
                        "6. volume": "156139058",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-03-31": {
                        "1. open": "88.7400",
                        "2. high": "92.0500",
                        "3. low": "87.8500",
                        "4. close": "88.8700",
                        "5. adjusted close": "87.2780",
                        "6. volume": "176898019",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-02-28": {
                        "1. open": "82.9000",
                        "2. high": "88.4900",
                        "3. low": "81.5700",
                        "4. close": "87.9400",
                        "5. adjusted close": "86.3647",
                        "6. volume": "167783472",
                        "7. dividend amount": "0.1650"
                    },
                    "2017-01-31": {
                        "1. open": "78.7600",
                        "2. high": "84.2700",
                        "3. low": "78.4900",
                        "4. close": "82.7100",
                        "5. adjusted close": "81.0756",
                        "6. volume": "159153885",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-12-30": {
                        "1. open": "77.5700",
                        "2. high": "80.3900",
                        "3. low": "75.1700",
                        "4. close": "78.0200",
                        "5. adjusted close": "76.4782",
                        "6. volume": "244868085",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-11-30": {
                        "1. open": "82.6400",
                        "2. high": "83.9600",
                        "3. low": "77.2800",
                        "4. close": "77.3200",
                        "5. adjusted close": "75.7921",
                        "6. volume": "234696164",
                        "7. dividend amount": "0.1650"
                    },
                    "2016-10-31": {
                        "1. open": "82.4200",
                        "2. high": "83.7000",
                        "3. low": "81.1100",
                        "4. close": "82.5100",
                        "5. adjusted close": "80.7132",
                        "6. volume": "178635744",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-09-30": {
                        "1. open": "81.1400",
                        "2. high": "83.7900",
                        "3. low": "80.9700",
                        "4. close": "82.7000",
                        "5. adjusted close": "80.8991",
                        "6. volume": "179003676",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-08-31": {
                        "1. open": "78.3100",
                        "2. high": "81.7600",
                        "3. low": "77.7300",
                        "4. close": "80.9000",
                        "5. adjusted close": "79.1383",
                        "6. volume": "149237623",
                        "7. dividend amount": "0.1400"
                    },
                    "2016-07-29": {
                        "1. open": "74.5000",
                        "2. high": "80.1700",
                        "3. low": "73.8300",
                        "4. close": "78.0500",
                        "5. adjusted close": "76.2183",
                        "6. volume": "183918469",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-06-30": {
                        "1. open": "78.6900",
                        "2. high": "81.7100",
                        "3. low": "73.2500",
                        "4. close": "74.1700",
                        "5. adjusted close": "72.4294",
                        "6. volume": "233222035",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-05-31": {
                        "1. open": "77.8100",
                        "2. high": "79.8700",
                        "3. low": "76.2200",
                        "4. close": "78.9400",
                        "5. adjusted close": "77.0875",
                        "6. volume": "146453556",
                        "7. dividend amount": "0.1400"
                    },
                    "2016-04-29": {
                        "1. open": "76.2500",
                        "2. high": "81.7300",
                        "3. low": "75.8000",
                        "4. close": "77.2400",
                        "5. adjusted close": "75.2910",
                        "6. volume": "174268331",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-03-31": {
                        "1. open": "72.9900",
                        "2. high": "77.0000",
                        "3. low": "69.5800",
                        "4. close": "76.4800",
                        "5. adjusted close": "74.5502",
                        "6. volume": "195451016",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-02-29": {
                        "1. open": "74.0800",
                        "2. high": "74.7800",
                        "3. low": "66.1200",
                        "4. close": "72.3900",
                        "5. adjusted close": "70.5634",
                        "6. volume": "213955896",
                        "7. dividend amount": "0.1400"
                    },
                    "2016-01-29": {
                        "1. open": "76.0600",
                        "2. high": "76.5100",
                        "3. low": "68.7600",
                        "4. close": "74.4900",
                        "5. adjusted close": "72.4695",
                        "6. volume": "260380987",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-12-31": {
                        "1. open": "79.5300",
                        "2. high": "80.4900",
                        "3. low": "75.5200",
                        "4. close": "77.5500",
                        "5. adjusted close": "75.4465",
                        "6. volume": "196690064",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-11-30": {
                        "1. open": "75.1900",
                        "2. high": "81.0100",
                        "3. low": "74.5300",
                        "4. close": "79.0100",
                        "5. adjusted close": "76.8669",
                        "6. volume": "183615398",
                        "7. dividend amount": "0.1400"
                    },
                    "2015-10-30": {
                        "1. open": "70.0900",
                        "2. high": "78.8900",
                        "3. low": "68.3600",
                        "4. close": "77.5800",
                        "5. adjusted close": "75.3430",
                        "6. volume": "177419211",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-09-30": {
                        "1. open": "69.4100",
                        "2. high": "72.3200",
                        "3. low": "67.0300",
                        "4. close": "69.6600",
                        "5. adjusted close": "67.6514",
                        "6. volume": "208292303",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-08-31": {
                        "1. open": "75.5900",
                        "2. high": "76.1700",
                        "3. low": "60.0000",
                        "4. close": "71.3000",
                        "5. adjusted close": "69.2441",
                        "6. volume": "178934538",
                        "7. dividend amount": "0.1200"
                    },
                    "2015-07-31": {
                        "1. open": "67.9400",
                        "2. high": "76.9200",
                        "3. low": "66.5300",
                        "4. close": "75.3400",
                        "5. adjusted close": "73.0484",
                        "6. volume": "177273461",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-06-30": {
                        "1. open": "69.1300",
                        "2. high": "70.0200",
                        "3. low": "66.6900",
                        "4. close": "67.1500",
                        "5. adjusted close": "65.1075",
                        "6. volume": "131118485",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-05-29": {
                        "1. open": "65.2200",
                        "2. high": "70.6900",
                        "3. low": "65.1500",
                        "4. close": "68.6800",
                        "5. adjusted close": "66.5910",
                        "6. volume": "144581935",
                        "7. dividend amount": "0.1200"
                    },
                    "2015-04-30": {
                        "1. open": "65.4500",
                        "2. high": "69.9800",
                        "3. low": "64.3500",
                        "4. close": "66.0500",
                        "5. adjusted close": "63.9292",
                        "6. volume": "160608587",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-03-31": {
                        "1. open": "276.7100",
                        "2. high": "278.6500",
                        "3. low": "65.0200",
                        "4. close": "65.4100",
                        "5. adjusted close": "63.3098",
                        "6. volume": "136699508",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-02-27": {
                        "1. open": "256.3100",
                        "2. high": "274.5000",
                        "3. low": "249.7000",
                        "4. close": "271.3100",
                        "5. adjusted close": "65.6496",
                        "6. volume": "49187104",
                        "7. dividend amount": "0.4800"
                    },
                    "2015-01-30": {
                        "1. open": "263.3800",
                        "2. high": "266.7500",
                        "3. low": "245.1700",
                        "4. close": "254.9100",
                        "5. adjusted close": "61.5702",
                        "6. volume": "56093964",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-12-31": {
                        "1. open": "256.2700",
                        "2. high": "269.3200",
                        "3. low": "252.3500",
                        "4. close": "262.2000",
                        "5. adjusted close": "63.3310",
                        "6. volume": "50490539",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-11-28": {
                        "1. open": "240.9800",
                        "2. high": "259.5000",
                        "3. low": "239.0000",
                        "4. close": "258.1900",
                        "5. adjusted close": "62.3624",
                        "6. volume": "51380169",
                        "7. dividend amount": "0.4800"
                    },
                    "2014-10-31": {
                        "1. open": "212.8500",
                        "2. high": "242.5000",
                        "3. low": "195.1900",
                        "4. close": "241.4300",
                        "5. adjusted close": "58.2034",
                        "6. volume": "80839596",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-09-30": {
                        "1. open": "213.4100",
                        "2. high": "218.6500",
                        "3. low": "209.1200",
                        "4. close": "213.3700",
                        "5. adjusted close": "51.4387",
                        "6. volume": "50857195",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-08-29": {
                        "1. open": "209.8700",
                        "2. high": "218.0000",
                        "3. low": "208.2100",
                        "4. close": "212.5200",
                        "5. adjusted close": "51.2338",
                        "6. volume": "44936500",
                        "7. dividend amount": "0.4000"
                    },
                    "2014-07-31": {
                        "1. open": "211.9500",
                        "2. high": "224.7500",
                        "3. low": "211.0100",
                        "4. close": "211.0100",
                        "5. adjusted close": "50.7737",
                        "6. volume": "55415300",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-06-30": {
                        "1. open": "215.3700",
                        "2. high": "215.6900",
                        "3. low": "207.3100",
                        "4. close": "210.7100",
                        "5. adjusted close": "50.7016",
                        "6. volume": "50554700",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-05-30": {
                        "1. open": "204.1000",
                        "2. high": "215.9500",
                        "3. low": "203.0000",
                        "4. close": "214.8300",
                        "5. adjusted close": "51.6929",
                        "6. volume": "54955700",
                        "7. dividend amount": "0.4000"
                    },
                    "2014-04-30": {
                        "1. open": "217.0800",
                        "2. high": "218.1586",
                        "3. low": "194.8400",
                        "4. close": "202.6100",
                        "5. adjusted close": "48.6598",
                        "6. volume": "96853500",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-03-31": {
                        "1. open": "223.2400",
                        "2. high": "232.6700",
                        "3. low": "210.5200",
                        "4. close": "215.8600",
                        "5. adjusted close": "51.8419",
                        "6. volume": "66709900",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-02-28": {
                        "1. open": "216.5100",
                        "2. high": "228.4800",
                        "3. low": "211.3800",
                        "4. close": "225.9400",
                        "5. adjusted close": "54.2628",
                        "6. volume": "57835200",
                        "7. dividend amount": "0.4000"
                    },
                    "2014-01-31": {
                        "1. open": "221.5400",
                        "2. high": "235.5000",
                        "3. low": "215.1090",
                        "4. close": "215.4300",
                        "5. adjusted close": "51.6465",
                        "6. volume": "75352000",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-12-31": {
                        "1. open": "204.1000",
                        "2. high": "222.7200",
                        "3. low": "199.4300",
                        "4. close": "222.6800",
                        "5. adjusted close": "53.3846",
                        "6. volume": "70411400",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-11-29": {
                        "1. open": "198.9500",
                        "2. high": "205.0699",
                        "3. low": "195.0000",
                        "4. close": "203.4600",
                        "5. adjusted close": "48.7769",
                        "6. volume": "51368400",
                        "7. dividend amount": "0.4000"
                    },
                    "2013-10-31": {
                        "1. open": "191.2900",
                        "2. high": "205.2500",
                        "3. low": "180.1100",
                        "4. close": "196.6700",
                        "5. adjusted close": "47.0548",
                        "6. volume": "67642100",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-09-30": {
                        "1. open": "176.0300",
                        "2. high": "200.8600",
                        "3. low": "175.0500",
                        "4. close": "191.1000",
                        "5. adjusted close": "45.7222",
                        "6. volume": "71214300",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-08-30": {
                        "1. open": "181.7600",
                        "2. high": "185.1400",
                        "3. low": "172.2100",
                        "4. close": "174.4200",
                        "5. adjusted close": "41.7314",
                        "6. volume": "92972300",
                        "7. dividend amount": "0.3300"
                    },
                    "2013-07-31": {
                        "1. open": "183.9000",
                        "2. high": "196.0000",
                        "3. low": "170.9900",
                        "4. close": "177.0100",
                        "5. adjusted close": "42.2728",
                        "6. volume": "84007800",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-06-28": {
                        "1. open": "178.7500",
                        "2. high": "185.2300",
                        "3. low": "175.6800",
                        "4. close": "182.7500",
                        "5. adjusted close": "43.6436",
                        "6. volume": "62189200",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-05-31": {
                        "1. open": "166.9900",
                        "2. high": "184.9000",
                        "3. low": "163.6000",
                        "4. close": "178.1400",
                        "5. adjusted close": "42.5427",
                        "6. volume": "77751600",
                        "7. dividend amount": "0.3300"
                    },
                    "2013-04-30": {
                        "1. open": "169.7500",
                        "2. high": "170.9900",
                        "3. low": "161.2700",
                        "4. close": "168.4600",
                        "5. adjusted close": "40.1580",
                        "6. volume": "51905700",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-03-28": {
                        "1. open": "157.9300",
                        "2. high": "170.9600",
                        "3. low": "155.6800",
                        "4. close": "169.8400",
                        "5. adjusted close": "40.4870",
                        "6. volume": "64842600",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-02-28": {
                        "1. open": "159.0000",
                        "2. high": "160.8800",
                        "3. low": "154.1400",
                        "4. close": "158.6400",
                        "5. adjusted close": "37.8171",
                        "6. volume": "61217500",
                        "7. dividend amount": "0.3300"
                    },
                    "2013-01-31": {
                        "1. open": "154.1600",
                        "2. high": "162.7700",
                        "3. low": "153.9300",
                        "4. close": "157.9100",
                        "5. adjusted close": "37.5630",
                        "6. volume": "59355700",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-12-31": {
                        "1. open": "150.0000",
                        "2. high": "152.5100",
                        "3. low": "146.1000",
                        "4. close": "151.5800",
                        "5. adjusted close": "36.0572",
                        "6. volume": "54031200",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-11-30": {
                        "1. open": "140.8200",
                        "2. high": "149.9300",
                        "3. low": "138.5300",
                        "4. close": "149.7100",
                        "5. adjusted close": "35.6124",
                        "6. volume": "62366800",
                        "7. dividend amount": "0.3300"
                    },
                    "2012-10-31": {
                        "1. open": "134.8700",
                        "2. high": "143.1000",
                        "3. low": "134.8700",
                        "4. close": "138.7600",
                        "5. adjusted close": "32.9300",
                        "6. volume": "57055600",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-09-28": {
                        "1. open": "128.3600",
                        "2. high": "136.6500",
                        "3. low": "126.9500",
                        "4. close": "134.2800",
                        "5. adjusted close": "31.8668",
                        "6. volume": "63213900",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-08-31": {
                        "1. open": "128.5000",
                        "2. high": "132.5800",
                        "3. low": "125.8100",
                        "4. close": "128.2500",
                        "5. adjusted close": "30.4358",
                        "6. volume": "54565800",
                        "7. dividend amount": "0.4400"
                    },
                    "2012-07-31": {
                        "1. open": "124.2600",
                        "2. high": "132.3500",
                        "3. low": "119.1000",
                        "4. close": "129.0700",
                        "5. adjusted close": "30.5255",
                        "6. volume": "73691000",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-06-29": {
                        "1. open": "113.6400",
                        "2. high": "124.9500",
                        "3. low": "111.9401",
                        "4. close": "123.6300",
                        "5. adjusted close": "29.2389",
                        "6. volume": "73804200",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-05-31": {
                        "1. open": "123.4700",
                        "2. high": "125.3500",
                        "3. low": "112.5000",
                        "4. close": "115.2000",
                        "5. adjusted close": "27.2452",
                        "6. volume": "100344000",
                        "7. dividend amount": "0.2200"
                    },
                    "2012-04-30": {
                        "1. open": "118.0000",
                        "2. high": "124.2100",
                        "3. low": "116.4800",
                        "4. close": "122.9800",
                        "5. adjusted close": "29.0308",
                        "6. volume": "62665100",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-03-30": {
                        "1. open": "117.4500",
                        "2. high": "120.6960",
                        "3. low": "113.5400",
                        "4. close": "118.0000",
                        "5. adjusted close": "27.8552",
                        "6. volume": "62867300",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-02-29": {
                        "1. open": "101.1800",
                        "2. high": "119.3600",
                        "3. low": "100.6025",
                        "4. close": "116.3700",
                        "5. adjusted close": "27.4705",
                        "6. volume": "89913900",
                        "7. dividend amount": "0.2200"
                    },
                    "2012-01-31": {
                        "1. open": "103.4000",
                        "2. high": "104.2000",
                        "3. low": "98.3300",
                        "4. close": "100.6400",
                        "5. adjusted close": "23.7119",
                        "6. volume": "76346100",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-12-30": {
                        "1. open": "95.9200",
                        "2. high": "103.4500",
                        "3. low": "95.0500",
                        "4. close": "101.5300",
                        "5. adjusted close": "23.9216",
                        "6. volume": "78358900",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-11-30": {
                        "1. open": "91.1600",
                        "2. high": "97.0300",
                        "3. low": "88.7800",
                        "4. close": "96.9700",
                        "5. adjusted close": "22.8472",
                        "6. volume": "84173500",
                        "7. dividend amount": "0.2200"
                    },
                    "2011-10-31": {
                        "1. open": "84.9700",
                        "2. high": "95.8700",
                        "3. low": "81.7100",
                        "4. close": "93.2600",
                        "5. adjusted close": "21.9215",
                        "6. volume": "104767000",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-09-30": {
                        "1. open": "87.7200",
                        "2. high": "94.7500",
                        "3. low": "83.2500",
                        "4. close": "85.7200",
                        "5. adjusted close": "20.1491",
                        "6. volume": "120505600",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-08-31": {
                        "1. open": "87.0000",
                        "2. high": "88.8500",
                        "3. low": "76.1100",
                        "4. close": "87.8800",
                        "5. adjusted close": "20.6568",
                        "6. volume": "160948700",
                        "7. dividend amount": "0.1500"
                    },
                    "2011-07-29": {
                        "1. open": "84.1000",
                        "2. high": "90.8300",
                        "3. low": "83.6000",
                        "4. close": "85.5400",
                        "5. adjusted close": "20.0710",
                        "6. volume": "113194800",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-06-30": {
                        "1. open": "80.7600",
                        "2. high": "87.3600",
                        "3. low": "73.1100",
                        "4. close": "84.2600",
                        "5. adjusted close": "19.7706",
                        "6. volume": "196557500",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-05-31": {
                        "1. open": "78.4600",
                        "2. high": "81.3000",
                        "3. low": "76.6000",
                        "4. close": "81.0600",
                        "5. adjusted close": "19.0198",
                        "6. volume": "99881900",
                        "7. dividend amount": "0.1500"
                    },
                    "2011-04-29": {
                        "1. open": "73.9900",
                        "2. high": "79.0000",
                        "3. low": "73.2615",
                        "4. close": "78.1200",
                        "5. adjusted close": "18.2957",
                        "6. volume": "80182500",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-03-31": {
                        "1. open": "73.8700",
                        "2. high": "75.9400",
                        "3. low": "70.4500",
                        "4. close": "73.6200",
                        "5. adjusted close": "17.2418",
                        "6. volume": "132083000",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-02-28": {
                        "1. open": "70.2100",
                        "2. high": "77.0800",
                        "3. low": "70.2100",
                        "4. close": "73.0500",
                        "5. adjusted close": "17.1083",
                        "6. volume": "114333300",
                        "7. dividend amount": "0.1500"
                    },
                    "2011-01-31": {
                        "1. open": "70.4000",
                        "2. high": "73.5500",
                        "3. low": "67.5100",
                        "4. close": "69.8500",
                        "5. adjusted close": "16.3254",
                        "6. volume": "139509300",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-12-31": {
                        "1. open": "74.9400",
                        "2. high": "81.7500",
                        "3. low": "66.5000",
                        "4. close": "70.3800",
                        "5. adjusted close": "16.4493",
                        "6. volume": "220235300",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-11-30": {
                        "1. open": "78.5800",
                        "2. high": "80.4700",
                        "3. low": "72.9200",
                        "4. close": "73.8500",
                        "5. adjusted close": "17.2603",
                        "6. volume": "79270200",
                        "7. dividend amount": "0.1500"
                    },
                    "2010-10-29": {
                        "1. open": "74.7400",
                        "2. high": "80.8800",
                        "3. low": "72.5810",
                        "4. close": "78.1600",
                        "5. adjusted close": "18.2315",
                        "6. volume": "102407400",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-09-30": {
                        "1. open": "69.8300",
                        "2. high": "74.9700",
                        "3. low": "64.9000",
                        "4. close": "74.2600",
                        "5. adjusted close": "17.3218",
                        "6. volume": "158973300",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-08-31": {
                        "1. open": "70.9800",
                        "2. high": "75.7300",
                        "3. low": "68.0100",
                        "4. close": "68.9800",
                        "5. adjusted close": "16.0902",
                        "6. volume": "125363400",
                        "7. dividend amount": "0.1250"
                    },
                    "2010-07-30": {
                        "1. open": "71.0000",
                        "2. high": "77.8000",
                        "3. low": "70.1100",
                        "4. close": "73.3500",
                        "5. adjusted close": "17.0805",
                        "6. volume": "117947400",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-06-30": {
                        "1. open": "72.4900",
                        "2. high": "83.7900",
                        "3. low": "70.0200",
                        "4. close": "70.7500",
                        "5. adjusted close": "16.4751",
                        "6. volume": "197268700",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-05-28": {
                        "1. open": "90.5500",
                        "2. high": "91.2700",
                        "3. low": "68.2900",
                        "4. close": "72.4600",
                        "5. adjusted close": "16.8732",
                        "6. volume": "329707000",
                        "7. dividend amount": "0.1250"
                    },
                    "2010-04-30": {
                        "1. open": "91.6800",
                        "2. high": "97.1920",
                        "3. low": "90.0200",
                        "4. close": "90.2300",
                        "5. adjusted close": "20.9806",
                        "6. volume": "82607100",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-03-31": {
                        "1. open": "85.5000",
                        "2. high": "93.6300",
                        "3. low": "85.2800",
                        "4. close": "91.0300",
                        "5. adjusted close": "21.1666",
                        "6. volume": "117882000",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-02-26": {
                        "1. open": "82.2900",
                        "2. high": "87.7600",
                        "3. low": "80.5400",
                        "4. close": "85.2800",
                        "5. adjusted close": "19.8296",
                        "6. volume": "99527800",
                        "7. dividend amount": "0.1250"
                    },
                    "2010-01-29": {
                        "1. open": "88.0000",
                        "2. high": "88.7700",
                        "3. low": "80.6100",
                        "4. close": "82.0300",
                        "5. adjusted close": "19.0455",
                        "6. volume": "87018500",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-12-31": {
                        "1. open": "81.4400",
                        "2. high": "89.6900",
                        "3. low": "78.7100",
                        "4. close": "87.4600",
                        "5. adjusted close": "20.3062",
                        "6. volume": "204952500",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-11-30": {
                        "1. open": "76.0900",
                        "2. high": "81.9000",
                        "3. low": "75.8000",
                        "4. close": "81.0000",
                        "5. adjusted close": "18.8063",
                        "6. volume": "90154700",
                        "7. dividend amount": "0.1250"
                    },
                    "2009-10-30": {
                        "1. open": "68.7700",
                        "2. high": "78.2000",
                        "3. low": "66.5452",
                        "4. close": "75.7600",
                        "5. adjusted close": "17.5622",
                        "6. volume": "159370800",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-09-30": {
                        "1. open": "70.7800",
                        "2. high": "74.9900",
                        "3. low": "68.6100",
                        "4. close": "69.1100",
                        "5. adjusted close": "16.0207",
                        "6. volume": "99051700",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-08-31": {
                        "1. open": "66.1900",
                        "2. high": "71.3200",
                        "3. low": "65.9000",
                        "4. close": "71.1000",
                        "5. adjusted close": "16.4820",
                        "6. volume": "93978700",
                        "7. dividend amount": "0.1050"
                    },
                    "2009-07-31": {
                        "1. open": "62.2800",
                        "2. high": "69.6800",
                        "3. low": "58.0000",
                        "4. close": "65.4600",
                        "5. adjusted close": "15.1513",
                        "6. volume": "153747700",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-06-30": {
                        "1. open": "68.5000",
                        "2. high": "71.2400",
                        "3. low": "60.2700",
                        "4. close": "62.2600",
                        "5. adjusted close": "14.4106",
                        "6. volume": "193053500",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-05-29": {
                        "1. open": "64.1500",
                        "2. high": "68.5600",
                        "3. low": "62.6400",
                        "4. close": "67.7100",
                        "5. adjusted close": "15.6721",
                        "6. volume": "198672200",
                        "7. dividend amount": "0.1050"
                    },
                    "2009-04-30": {
                        "1. open": "54.7500",
                        "2. high": "68.0000",
                        "3. low": "53.6300",
                        "4. close": "64.9600",
                        "5. adjusted close": "15.0111",
                        "6. volume": "222924500",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-03-31": {
                        "1. open": "55.9300",
                        "2. high": "56.9700",
                        "3. low": "48.7400",
                        "4. close": "55.6000",
                        "5. adjusted close": "12.8482",
                        "6. volume": "231948800",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-02-27": {
                        "1. open": "48.2500",
                        "2. high": "57.9500",
                        "3. low": "47.5400",
                        "4. close": "56.7100",
                        "5. adjusted close": "13.1047",
                        "6. volume": "186385800",
                        "7. dividend amount": "0.1050"
                    },
                    "2009-01-30": {
                        "1. open": "52.9200",
                        "2. high": "57.9800",
                        "3. low": "41.7800",
                        "4. close": "49.3500",
                        "5. adjusted close": "11.3822",
                        "6. volume": "160611600",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-12-31": {
                        "1. open": "51.0000",
                        "2. high": "57.6700",
                        "3. low": "47.5300",
                        "4. close": "52.4500",
                        "5. adjusted close": "12.0972",
                        "6. volume": "141021400",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-11-28": {
                        "1. open": "55.3500",
                        "2. high": "60.4500",
                        "3. low": "43.5400",
                        "4. close": "52.5600",
                        "5. adjusted close": "12.1225",
                        "6. volume": "191852000",
                        "7. dividend amount": "0.1050"
                    },
                    "2008-10-31": {
                        "1. open": "60.7500",
                        "2. high": "62.1100",
                        "3. low": "43.7400",
                        "4. close": "55.3500",
                        "5. adjusted close": "12.7402",
                        "6. volume": "302537300",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-09-30": {
                        "1. open": "76.8300",
                        "2. high": "77.5000",
                        "3. low": "55.8900",
                        "4. close": "61.3900",
                        "5. adjusted close": "14.1304",
                        "6. volume": "254818400",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-08-29": {
                        "1. open": "73.3000",
                        "2. high": "76.5300",
                        "3. low": "69.1100",
                        "4. close": "75.9000",
                        "5. adjusted close": "17.4703",
                        "6. volume": "158540800",
                        "7. dividend amount": "0.1050"
                    },
                    "2008-07-31": {
                        "1. open": "79.2000",
                        "2. high": "82.4000",
                        "3. low": "66.5100",
                        "4. close": "73.0600",
                        "5. adjusted close": "16.7927",
                        "6. volume": "333151100",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-06-30": {
                        "1. open": "86.2100",
                        "2. high": "88.1000",
                        "3. low": "77.6000",
                        "4. close": "81.3100",
                        "5. adjusted close": "18.6890",
                        "6. volume": "255456900",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-05-30": {
                        "1. open": "84.6800",
                        "2. high": "89.8400",
                        "3. low": "74.3600",
                        "4. close": "86.3600",
                        "5. adjusted close": "19.8497",
                        "6. volume": "388428400",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-04-30": {
                        "1. open": "63.0000",
                        "2. high": "84.8100",
                        "3. low": "60.3100",
                        "4. close": "83.4500",
                        "5. adjusted close": "19.1809",
                        "6. volume": "346330900",
                        "7. dividend amount": "0.0000"
                    }
                }
            },
            {
                "Meta Data": {
                    "1. Information": "Monthly Adjusted Prices and Volumes",
                    "2. Symbol": "SBUX",
                    "3. Last Refreshed": "2020-01-08",
                    "4. Time Zone": "US/Eastern"
                },
                "Monthly Adjusted Time Series": {
                    "2020-01-08": {
                        "1. open": "88.1200",
                        "2. high": "89.3500",
                        "3. low": "87.1300",
                        "4. close": "88.8800",
                        "5. adjusted close": "88.8800",
                        "6. volume": "30581065",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-12-31": {
                        "1. open": "85.3800",
                        "2. high": "89.3000",
                        "3. low": "83.8200",
                        "4. close": "87.9200",
                        "5. adjusted close": "87.9200",
                        "6. volume": "132610092",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-11-29": {
                        "1. open": "84.7900",
                        "2. high": "86.7300",
                        "3. low": "81.0301",
                        "4. close": "85.4300",
                        "5. adjusted close": "85.4300",
                        "6. volume": "138850644",
                        "7. dividend amount": "0.4100"
                    },
                    "2019-10-31": {
                        "1. open": "88.6300",
                        "2. high": "88.8940",
                        "3. low": "82.1262",
                        "4. close": "84.5600",
                        "5. adjusted close": "84.1459",
                        "6. volume": "139146184",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-09-30": {
                        "1. open": "96.4200",
                        "2. high": "97.2100",
                        "3. low": "87.6100",
                        "4. close": "88.4200",
                        "5. adjusted close": "87.9870",
                        "6. volume": "136443480",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-08-30": {
                        "1. open": "95.0000",
                        "2. high": "98.1400",
                        "3. low": "93.0300",
                        "4. close": "96.5600",
                        "5. adjusted close": "96.0872",
                        "6. volume": "142257551",
                        "7. dividend amount": "0.3600"
                    },
                    "2019-07-31": {
                        "1. open": "84.6200",
                        "2. high": "99.7200",
                        "3. low": "84.0300",
                        "4. close": "94.6900",
                        "5. adjusted close": "93.8714",
                        "6. volume": "166023385",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-06-28": {
                        "1. open": "76.1200",
                        "2. high": "85.2000",
                        "3. low": "75.6500",
                        "4. close": "83.8300",
                        "5. adjusted close": "83.1053",
                        "6. volume": "163307513",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-05-31": {
                        "1. open": "77.6700",
                        "2. high": "79.6501",
                        "3. low": "74.3300",
                        "4. close": "76.0600",
                        "5. adjusted close": "75.4025",
                        "6. volume": "168827944",
                        "7. dividend amount": "0.3600"
                    },
                    "2019-04-30": {
                        "1. open": "74.7600",
                        "2. high": "77.7900",
                        "3. low": "73.7300",
                        "4. close": "77.6800",
                        "5. adjusted close": "76.6549",
                        "6. volume": "146497696",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-03-29": {
                        "1. open": "70.6300",
                        "2. high": "74.4801",
                        "3. low": "69.0300",
                        "4. close": "74.3400",
                        "5. adjusted close": "73.3590",
                        "6. volume": "192665359",
                        "7. dividend amount": "0.0000"
                    },
                    "2019-02-28": {
                        "1. open": "68.5900",
                        "2. high": "72.0700",
                        "3. low": "67.0800",
                        "4. close": "70.2600",
                        "5. adjusted close": "69.3328",
                        "6. volume": "215347812",
                        "7. dividend amount": "0.3600"
                    },
                    "2019-01-31": {
                        "1. open": "63.6800",
                        "2. high": "69.4900",
                        "3. low": "61.3950",
                        "4. close": "68.1400",
                        "5. adjusted close": "66.8910",
                        "6. volume": "276734947",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-12-31": {
                        "1. open": "67.3700",
                        "2. high": "68.1500",
                        "3. low": "60.4200",
                        "4. close": "64.4000",
                        "5. adjusted close": "63.2196",
                        "6. volume": "250213941",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-11-30": {
                        "1. open": "58.3000",
                        "2. high": "68.9800",
                        "3. low": "58.0700",
                        "4. close": "66.7200",
                        "5. adjusted close": "65.4971",
                        "6. volume": "326989373",
                        "7. dividend amount": "0.3600"
                    },
                    "2018-10-31": {
                        "1. open": "56.9100",
                        "2. high": "59.7000",
                        "3. low": "54.7050",
                        "4. close": "58.2700",
                        "5. adjusted close": "56.8964",
                        "6. volume": "285963142",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-09-28": {
                        "1. open": "53.4400",
                        "2. high": "57.8400",
                        "3. low": "53.2148",
                        "4. close": "56.8400",
                        "5. adjusted close": "55.5001",
                        "6. volume": "177505869",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-08-31": {
                        "1. open": "52.2400",
                        "2. high": "54.4400",
                        "3. low": "51.1950",
                        "4. close": "53.4500",
                        "5. adjusted close": "52.1900",
                        "6. volume": "198193488",
                        "7. dividend amount": "0.3600"
                    },
                    "2018-07-31": {
                        "1. open": "48.6400",
                        "2. high": "52.8450",
                        "3. low": "48.4000",
                        "4. close": "52.3900",
                        "5. adjusted close": "50.8003",
                        "6. volume": "244837235",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-06-29": {
                        "1. open": "56.8400",
                        "2. high": "57.9400",
                        "3. low": "47.3700",
                        "4. close": "48.8500",
                        "5. adjusted close": "47.3677",
                        "6. volume": "338561410",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-05-31": {
                        "1. open": "57.6700",
                        "2. high": "59.0400",
                        "3. low": "55.5400",
                        "4. close": "56.6700",
                        "5. adjusted close": "54.9504",
                        "6. volume": "150516464",
                        "7. dividend amount": "0.3000"
                    },
                    "2018-04-30": {
                        "1. open": "57.5200",
                        "2. high": "60.1800",
                        "3. low": "55.3800",
                        "4. close": "57.5700",
                        "5. adjusted close": "55.5310",
                        "6. volume": "178573092",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-03-29": {
                        "1. open": "57.0000",
                        "2. high": "60.7000",
                        "3. low": "55.6805",
                        "4. close": "57.8900",
                        "5. adjusted close": "55.8397",
                        "6. volume": "182361240",
                        "7. dividend amount": "0.0000"
                    },
                    "2018-02-28": {
                        "1. open": "56.2800",
                        "2. high": "57.9200",
                        "3. low": "53.5600",
                        "4. close": "57.1000",
                        "5. adjusted close": "55.0777",
                        "6. volume": "230144559",
                        "7. dividend amount": "0.3000"
                    },
                    "2018-01-31": {
                        "1. open": "57.9500",
                        "2. high": "61.9400",
                        "3. low": "56.5500",
                        "4. close": "56.8100",
                        "5. adjusted close": "54.4977",
                        "6. volume": "236290122",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-12-29": {
                        "1. open": "57.5000",
                        "2. high": "60.0500",
                        "3. low": "56.4610",
                        "4. close": "57.4300",
                        "5. adjusted close": "55.0925",
                        "6. volume": "169758332",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-11-30": {
                        "1. open": "55.1000",
                        "2. high": "58.1399",
                        "3. low": "54.0500",
                        "4. close": "57.8200",
                        "5. adjusted close": "55.4666",
                        "6. volume": "209067295",
                        "7. dividend amount": "0.3000"
                    },
                    "2017-10-31": {
                        "1. open": "53.8600",
                        "2. high": "56.4300",
                        "3. low": "53.6600",
                        "4. close": "54.8400",
                        "5. adjusted close": "52.3310",
                        "6. volume": "176151561",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-09-29": {
                        "1. open": "54.9000",
                        "2. high": "55.6000",
                        "3. low": "53.0500",
                        "4. close": "53.7100",
                        "5. adjusted close": "51.2527",
                        "6. volume": "181225388",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-08-31": {
                        "1. open": "54.5700",
                        "2. high": "56.1200",
                        "3. low": "52.5800",
                        "4. close": "54.8600",
                        "5. adjusted close": "52.3501",
                        "6. volume": "231616354",
                        "7. dividend amount": "0.2500"
                    },
                    "2017-07-31": {
                        "1. open": "58.9000",
                        "2. high": "59.6600",
                        "3. low": "53.4100",
                        "4. close": "53.9800",
                        "5. adjusted close": "51.2753",
                        "6. volume": "215322072",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-06-30": {
                        "1. open": "63.5100",
                        "2. high": "64.8700",
                        "3. low": "57.9550",
                        "4. close": "58.3100",
                        "5. adjusted close": "55.3883",
                        "6. volume": "167580211",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-05-31": {
                        "1. open": "60.0000",
                        "2. high": "63.6100",
                        "3. low": "58.8700",
                        "4. close": "63.6100",
                        "5. adjusted close": "60.4227",
                        "6. volume": "158403811",
                        "7. dividend amount": "0.2500"
                    },
                    "2017-04-28": {
                        "1. open": "58.2800",
                        "2. high": "61.9400",
                        "3. low": "57.3800",
                        "4. close": "60.0600",
                        "5. adjusted close": "56.8177",
                        "6. volume": "176877493",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-03-31": {
                        "1. open": "57.2700",
                        "2. high": "58.6600",
                        "3. low": "54.0900",
                        "4. close": "58.3900",
                        "5. adjusted close": "55.2378",
                        "6. volume": "225546650",
                        "7. dividend amount": "0.0000"
                    },
                    "2017-02-28": {
                        "1. open": "55.4900",
                        "2. high": "57.8500",
                        "3. low": "53.8100",
                        "4. close": "56.8700",
                        "5. adjusted close": "53.7999",
                        "6. volume": "196153792",
                        "7. dividend amount": "0.2500"
                    },
                    "2017-01-31": {
                        "1. open": "55.9100",
                        "2. high": "59.0000",
                        "3. low": "54.8800",
                        "4. close": "55.2200",
                        "5. adjusted close": "52.0036",
                        "6. volume": "188767845",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-12-30": {
                        "1. open": "57.3400",
                        "2. high": "59.5400",
                        "3. low": "55.4000",
                        "4. close": "55.5200",
                        "5. adjusted close": "52.2861",
                        "6. volume": "165873543",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-11-30": {
                        "1. open": "53.1400",
                        "2. high": "58.2500",
                        "3. low": "50.8400",
                        "4. close": "57.9700",
                        "5. adjusted close": "54.5934",
                        "6. volume": "237025776",
                        "7. dividend amount": "0.2500"
                    },
                    "2016-10-31": {
                        "1. open": "54.1000",
                        "2. high": "54.4600",
                        "3. low": "52.5900",
                        "4. close": "53.0700",
                        "5. adjusted close": "49.7510",
                        "6. volume": "148547103",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-09-30": {
                        "1. open": "56.3000",
                        "2. high": "56.6500",
                        "3. low": "52.9000",
                        "4. close": "54.1400",
                        "5. adjusted close": "50.7541",
                        "6. volume": "192746456",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-08-31": {
                        "1. open": "58.0000",
                        "2. high": "58.0500",
                        "3. low": "54.8500",
                        "4. close": "56.2300",
                        "5. adjusted close": "52.7134",
                        "6. volume": "179342415",
                        "7. dividend amount": "0.2000"
                    },
                    "2016-07-29": {
                        "1. open": "57.0400",
                        "2. high": "58.8400",
                        "3. low": "56.0600",
                        "4. close": "58.0500",
                        "5. adjusted close": "54.2284",
                        "6. volume": "203692842",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-06-30": {
                        "1. open": "54.7600",
                        "2. high": "57.1900",
                        "3. low": "53.4100",
                        "4. close": "57.1200",
                        "5. adjusted close": "53.3596",
                        "6. volume": "176269532",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-05-31": {
                        "1. open": "56.2900",
                        "2. high": "57.6000",
                        "3. low": "54.1900",
                        "4. close": "54.8900",
                        "5. adjusted close": "51.2764",
                        "6. volume": "164837619",
                        "7. dividend amount": "0.2000"
                    },
                    "2016-04-29": {
                        "1. open": "59.6100",
                        "2. high": "61.6400",
                        "3. low": "55.2900",
                        "4. close": "56.2300",
                        "5. adjusted close": "52.3421",
                        "6. volume": "197551901",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-03-31": {
                        "1. open": "58.7700",
                        "2. high": "60.4500",
                        "3. low": "56.5700",
                        "4. close": "59.7000",
                        "5. adjusted close": "55.5722",
                        "6. volume": "180386271",
                        "7. dividend amount": "0.0000"
                    },
                    "2016-02-29": {
                        "1. open": "60.6600",
                        "2. high": "61.7850",
                        "3. low": "52.6300",
                        "4. close": "58.2100",
                        "5. adjusted close": "54.1852",
                        "6. volume": "223871375",
                        "7. dividend amount": "0.2000"
                    },
                    "2016-01-29": {
                        "1. open": "58.7700",
                        "2. high": "60.8800",
                        "3. low": "54.9400",
                        "4. close": "60.7700",
                        "5. adjusted close": "56.3824",
                        "6. volume": "262884958",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-12-31": {
                        "1. open": "61.0800",
                        "2. high": "62.5390",
                        "3. low": "58.2700",
                        "4. close": "60.0300",
                        "5. adjusted close": "55.6958",
                        "6. volume": "174962881",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-11-30": {
                        "1. open": "63.0100",
                        "2. high": "63.1900",
                        "3. low": "59.5000",
                        "4. close": "61.3900",
                        "5. adjusted close": "56.9576",
                        "6. volume": "141502568",
                        "7. dividend amount": "0.2000"
                    },
                    "2015-10-30": {
                        "1. open": "56.9900",
                        "2. high": "64.0000",
                        "3. low": "55.8900",
                        "4. close": "62.5700",
                        "5. adjusted close": "57.8638",
                        "6. volume": "195656151",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-09-30": {
                        "1. open": "52.8200",
                        "2. high": "58.9600",
                        "3. low": "52.7400",
                        "4. close": "56.8400",
                        "5. adjusted close": "52.5647",
                        "6. volume": "187308241",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-08-31": {
                        "1. open": "58.6200",
                        "2. high": "59.3198",
                        "3. low": "42.0500",
                        "4. close": "54.7100",
                        "5. adjusted close": "50.5949",
                        "6. volume": "223575103",
                        "7. dividend amount": "0.1600"
                    },
                    "2015-07-31": {
                        "1. open": "53.8600",
                        "2. high": "59.3100",
                        "3. low": "53.3101",
                        "4. close": "57.9300",
                        "5. adjusted close": "53.4271",
                        "6. volume": "177930694",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-06-30": {
                        "1. open": "51.9600",
                        "2. high": "54.7500",
                        "3. low": "51.1000",
                        "4. close": "53.6150",
                        "5. adjusted close": "49.4475",
                        "6. volume": "150833733",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-05-29": {
                        "1. open": "49.9500",
                        "2. high": "52.2300",
                        "3. low": "48.5700",
                        "4. close": "51.9600",
                        "5. adjusted close": "47.9212",
                        "6. volume": "134474323",
                        "7. dividend amount": "0.1600"
                    },
                    "2015-04-30": {
                        "1. open": "94.2800",
                        "2. high": "95.2800",
                        "3. low": "47.2500",
                        "4. close": "49.5800",
                        "5. adjusted close": "45.5786",
                        "6. volume": "158746009",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-03-31": {
                        "1. open": "93.3300",
                        "2. high": "99.2000",
                        "3. low": "91.2200",
                        "4. close": "94.7000",
                        "5. adjusted close": "43.5285",
                        "6. volume": "97965663",
                        "7. dividend amount": "0.0000"
                    },
                    "2015-02-27": {
                        "1. open": "87.6800",
                        "2. high": "94.8300",
                        "3. low": "85.8600",
                        "4. close": "93.4850",
                        "5. adjusted close": "42.9701",
                        "6. volume": "75132832",
                        "7. dividend amount": "0.3200"
                    },
                    "2015-01-30": {
                        "1. open": "82.1300",
                        "2. high": "89.5900",
                        "3. low": "78.5600",
                        "4. close": "87.5300",
                        "5. adjusted close": "40.0879",
                        "6. volume": "133589204",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-12-31": {
                        "1. open": "81.0000",
                        "2. high": "84.2000",
                        "3. low": "78.4400",
                        "4. close": "82.0500",
                        "5. adjusted close": "37.5781",
                        "6. volume": "111090167",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-11-28": {
                        "1. open": "75.9700",
                        "2. high": "81.6400",
                        "3. low": "75.4700",
                        "4. close": "81.2100",
                        "5. adjusted close": "37.1934",
                        "6. volume": "70253373",
                        "7. dividend amount": "0.3200"
                    },
                    "2014-10-31": {
                        "1. open": "75.6800",
                        "2. high": "77.6650",
                        "3. low": "70.7700",
                        "4. close": "75.5600",
                        "5. adjusted close": "34.4637",
                        "6. volume": "116204390",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-09-30": {
                        "1. open": "77.7000",
                        "2. high": "77.9800",
                        "3. low": "73.7800",
                        "4. close": "75.4600",
                        "5. adjusted close": "34.4181",
                        "6. volume": "83276081",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-08-29": {
                        "1. open": "77.5000",
                        "2. high": "78.4700",
                        "3. low": "76.1600",
                        "4. close": "77.8100",
                        "5. adjusted close": "35.4900",
                        "6. volume": "61838800",
                        "7. dividend amount": "0.2600"
                    },
                    "2014-07-31": {
                        "1. open": "77.8900",
                        "2. high": "80.6400",
                        "3. low": "77.1200",
                        "4. close": "77.6800",
                        "5. adjusted close": "35.3111",
                        "6. volume": "87158600",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-06-30": {
                        "1. open": "73.2200",
                        "2. high": "78.3500",
                        "3. low": "73.1600",
                        "4. close": "77.3800",
                        "5. adjusted close": "35.1748",
                        "6. volume": "78709100",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-05-30": {
                        "1. open": "70.7500",
                        "2. high": "73.7800",
                        "3. low": "69.1400",
                        "4. close": "73.2400",
                        "5. adjusted close": "33.2928",
                        "6. volume": "82742300",
                        "7. dividend amount": "0.2600"
                    },
                    "2014-04-30": {
                        "1. open": "73.6400",
                        "2. high": "74.9800",
                        "3. low": "67.9300",
                        "4. close": "70.6200",
                        "5. adjusted close": "31.9823",
                        "6. volume": "114999900",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-03-31": {
                        "1. open": "70.0100",
                        "2. high": "78.6400",
                        "3. low": "70.0000",
                        "4. close": "73.3800",
                        "5. adjusted close": "33.2323",
                        "6. volume": "121939900",
                        "7. dividend amount": "0.0000"
                    },
                    "2014-02-28": {
                        "1. open": "71.0000",
                        "2. high": "75.1900",
                        "3. low": "68.6700",
                        "4. close": "70.9600",
                        "5. adjusted close": "32.1363",
                        "6. volume": "129933500",
                        "7. dividend amount": "0.2600"
                    },
                    "2014-01-31": {
                        "1. open": "78.0700",
                        "2. high": "78.2700",
                        "3. low": "70.8700",
                        "4. close": "71.1200",
                        "5. adjusted close": "32.0907",
                        "6. volume": "145589500",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-12-31": {
                        "1. open": "81.4900",
                        "2. high": "81.6890",
                        "3. low": "75.9100",
                        "4. close": "78.3900",
                        "5. adjusted close": "35.3710",
                        "6. volume": "93360700",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-11-29": {
                        "1. open": "81.5400",
                        "2. high": "82.5000",
                        "3. low": "79.0000",
                        "4. close": "81.4600",
                        "5. adjusted close": "36.7563",
                        "6. volume": "87903200",
                        "7. dividend amount": "0.2600"
                    },
                    "2013-10-31": {
                        "1. open": "76.9800",
                        "2. high": "81.6200",
                        "3. low": "74.4525",
                        "4. close": "81.0500",
                        "5. adjusted close": "36.4537",
                        "6. volume": "102493100",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-09-30": {
                        "1. open": "71.7000",
                        "2. high": "77.8450",
                        "3. low": "70.9300",
                        "4. close": "76.9700",
                        "5. adjusted close": "34.6187",
                        "6. volume": "74744200",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-08-30": {
                        "1. open": "72.2700",
                        "2. high": "74.2700",
                        "3. low": "69.8600",
                        "4. close": "70.5200",
                        "5. adjusted close": "31.7177",
                        "6. volume": "73530300",
                        "7. dividend amount": "0.2100"
                    },
                    "2013-07-31": {
                        "1. open": "66.0900",
                        "2. high": "73.5200",
                        "3. low": "65.8200",
                        "4. close": "71.2890",
                        "5. adjusted close": "31.9713",
                        "6. volume": "108628900",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-06-28": {
                        "1. open": "63.2600",
                        "2. high": "67.4800",
                        "3. low": "62.3100",
                        "4. close": "65.5100",
                        "5. adjusted close": "29.3796",
                        "6. volume": "100976500",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-05-31": {
                        "1. open": "60.5500",
                        "2. high": "64.9300",
                        "3. low": "59.6000",
                        "4. close": "63.1400",
                        "5. adjusted close": "28.3167",
                        "6. volume": "84191100",
                        "7. dividend amount": "0.2100"
                    },
                    "2013-04-30": {
                        "1. open": "57.1300",
                        "2. high": "60.9200",
                        "3. low": "56.6500",
                        "4. close": "60.8400",
                        "5. adjusted close": "27.1934",
                        "6. volume": "106024600",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-03-28": {
                        "1. open": "54.6300",
                        "2. high": "58.9700",
                        "3. low": "54.0000",
                        "4. close": "56.9500",
                        "5. adjusted close": "25.4547",
                        "6. volume": "110056200",
                        "7. dividend amount": "0.0000"
                    },
                    "2013-02-28": {
                        "1. open": "56.5700",
                        "2. high": "57.1000",
                        "3. low": "52.5200",
                        "4. close": "54.8500",
                        "5. adjusted close": "24.5160",
                        "6. volume": "96350500",
                        "7. dividend amount": "0.2100"
                    },
                    "2013-01-31": {
                        "1. open": "54.5900",
                        "2. high": "57.2700",
                        "3. low": "53.6800",
                        "4. close": "56.1200",
                        "5. adjusted close": "24.9903",
                        "6. volume": "141741900",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-12-31": {
                        "1. open": "52.1400",
                        "2. high": "54.9000",
                        "3. low": "49.5600",
                        "4. close": "53.6300",
                        "5. adjusted close": "23.8815",
                        "6. volume": "154788400",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-11-30": {
                        "1. open": "45.7400",
                        "2. high": "52.3050",
                        "3. low": "45.3900",
                        "4. close": "51.8700",
                        "5. adjusted close": "23.0978",
                        "6. volume": "166357800",
                        "7. dividend amount": "0.2100"
                    },
                    "2012-10-31": {
                        "1. open": "50.9300",
                        "2. high": "51.3000",
                        "3. low": "44.2700",
                        "4. close": "45.9000",
                        "5. adjusted close": "20.3544",
                        "6. volume": "206379000",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-09-28": {
                        "1. open": "49.4500",
                        "2. high": "52.0000",
                        "3. low": "48.9900",
                        "4. close": "50.7100",
                        "5. adjusted close": "22.4874",
                        "6. volume": "137083600",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-08-31": {
                        "1. open": "45.4700",
                        "2. high": "50.0600",
                        "3. low": "43.0400",
                        "4. close": "49.6100",
                        "5. adjusted close": "21.9996",
                        "6. volume": "208933700",
                        "7. dividend amount": "0.1700"
                    },
                    "2012-07-31": {
                        "1. open": "53.4400",
                        "2. high": "54.2750",
                        "3. low": "45.0900",
                        "4. close": "45.2800",
                        "5. adjusted close": "20.0012",
                        "6. volume": "166625200",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-06-29": {
                        "1. open": "53.1600",
                        "2. high": "55.9700",
                        "3. low": "51.0300",
                        "4. close": "53.3200",
                        "5. adjusted close": "23.5527",
                        "6. volume": "148947301",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-05-31": {
                        "1. open": "57.5100",
                        "2. high": "58.4300",
                        "3. low": "51.4300",
                        "4. close": "54.8900",
                        "5. adjusted close": "24.2462",
                        "6. volume": "176972300",
                        "7. dividend amount": "0.1700"
                    },
                    "2012-04-30": {
                        "1. open": "56.0300",
                        "2. high": "62.0000",
                        "3. low": "55.9600",
                        "4. close": "57.3700",
                        "5. adjusted close": "25.2643",
                        "6. volume": "211880800",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-03-30": {
                        "1. open": "48.6900",
                        "2. high": "56.5500",
                        "3. low": "48.1000",
                        "4. close": "55.8900",
                        "5. adjusted close": "24.6125",
                        "6. volume": "151305300",
                        "7. dividend amount": "0.0000"
                    },
                    "2012-02-29": {
                        "1. open": "48.3400",
                        "2. high": "49.3600",
                        "3. low": "47.4100",
                        "4. close": "48.5600",
                        "5. adjusted close": "21.3846",
                        "6. volume": "89455100",
                        "7. dividend amount": "0.1700"
                    },
                    "2012-01-31": {
                        "1. open": "46.8500",
                        "2. high": "48.6200",
                        "3. low": "45.2800",
                        "4. close": "47.9200",
                        "5. adjusted close": "21.0287",
                        "6. volume": "122632100",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-12-30": {
                        "1. open": "43.2000",
                        "2. high": "46.5000",
                        "3. low": "42.6700",
                        "4. close": "46.0100",
                        "5. adjusted close": "20.1905",
                        "6. volume": "102066800",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-11-30": {
                        "1. open": "41.3300",
                        "2. high": "44.6950",
                        "3. low": "40.5500",
                        "4. close": "43.4800",
                        "5. adjusted close": "19.0803",
                        "6. volume": "144161700",
                        "7. dividend amount": "0.1700"
                    },
                    "2011-10-31": {
                        "1. open": "36.8499",
                        "2. high": "43.4300",
                        "3. low": "35.1200",
                        "4. close": "42.3600",
                        "5. adjusted close": "18.5173",
                        "6. volume": "149957600",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-09-30": {
                        "1. open": "38.8400",
                        "2. high": "42.0000",
                        "3. low": "36.4200",
                        "4. close": "37.2900",
                        "5. adjusted close": "16.3010",
                        "6. volume": "172008300",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-08-31": {
                        "1. open": "40.4400",
                        "2. high": "40.7700",
                        "3. low": "33.7200",
                        "4. close": "38.6200",
                        "5. adjusted close": "16.8824",
                        "6. volume": "230165600",
                        "7. dividend amount": "0.1300"
                    },
                    "2011-07-29": {
                        "1. open": "39.6200",
                        "2. high": "41.1100",
                        "3. low": "38.9000",
                        "4. close": "40.0900",
                        "5. adjusted close": "17.4583",
                        "6. volume": "140009000",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-06-30": {
                        "1. open": "36.5400",
                        "2. high": "39.7900",
                        "3. low": "34.6100",
                        "4. close": "39.4900",
                        "5. adjusted close": "17.1971",
                        "6. volume": "143448600",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-05-31": {
                        "1. open": "36.4800",
                        "2. high": "37.6700",
                        "3. low": "34.8400",
                        "4. close": "36.7900",
                        "5. adjusted close": "16.0213",
                        "6. volume": "126557400",
                        "7. dividend amount": "0.1300"
                    },
                    "2011-04-29": {
                        "1. open": "37.2500",
                        "2. high": "37.6600",
                        "3. low": "35.0000",
                        "4. close": "36.2000",
                        "5. adjusted close": "15.7078",
                        "6. volume": "133174800",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-03-31": {
                        "1. open": "33.2300",
                        "2. high": "38.2100",
                        "3. low": "31.7200",
                        "4. close": "36.9500",
                        "5. adjusted close": "16.0332",
                        "6. volume": "234510700",
                        "7. dividend amount": "0.0000"
                    },
                    "2011-02-28": {
                        "1. open": "31.7600",
                        "2. high": "34.0300",
                        "3. low": "31.1700",
                        "4. close": "32.9800",
                        "5. adjusted close": "14.3106",
                        "6. volume": "138809700",
                        "7. dividend amount": "0.1300"
                    },
                    "2011-01-31": {
                        "1. open": "32.4900",
                        "2. high": "33.7800",
                        "3. low": "30.7500",
                        "4. close": "31.5300",
                        "5. adjusted close": "13.6266",
                        "6. volume": "182008100",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-12-31": {
                        "1. open": "31.0100",
                        "2. high": "33.1500",
                        "3. low": "31.0100",
                        "4. close": "32.1300",
                        "5. adjusted close": "13.8859",
                        "6. volume": "117202900",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-11-30": {
                        "1. open": "28.6800",
                        "2. high": "31.5100",
                        "3. low": "28.4400",
                        "4. close": "30.6000",
                        "5. adjusted close": "13.2247",
                        "6. volume": "164022400",
                        "7. dividend amount": "0.1300"
                    },
                    "2010-10-29": {
                        "1. open": "25.8900",
                        "2. high": "28.8000",
                        "3. low": "25.3700",
                        "4. close": "28.5600",
                        "5. adjusted close": "12.2895",
                        "6. volume": "141847200",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-09-30": {
                        "1. open": "23.1800",
                        "2. high": "26.5700",
                        "3. low": "23.0300",
                        "4. close": "25.5500",
                        "5. adjusted close": "10.9943",
                        "6. volume": "150589200",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-08-31": {
                        "1. open": "25.0200",
                        "2. high": "25.7200",
                        "3. low": "22.5000",
                        "4. close": "22.9800",
                        "5. adjusted close": "9.8884",
                        "6. volume": "165195400",
                        "7. dividend amount": "0.1300"
                    },
                    "2010-07-30": {
                        "1. open": "24.4300",
                        "2. high": "26.4400",
                        "3. low": "23.4700",
                        "4. close": "24.8500",
                        "5. adjusted close": "10.6371",
                        "6. volume": "197717800",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-06-30": {
                        "1. open": "25.7500",
                        "2. high": "28.5000",
                        "3. low": "24.2700",
                        "4. close": "24.3000",
                        "5. adjusted close": "10.4016",
                        "6. volume": "216810000",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-05-28": {
                        "1. open": "26.0200",
                        "2. high": "27.9300",
                        "3. low": "24.0700",
                        "4. close": "25.8900",
                        "5. adjusted close": "11.0822",
                        "6. volume": "237117500",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-04-30": {
                        "1. open": "24.5400",
                        "2. high": "27.5900",
                        "3. low": "23.9500",
                        "4. close": "25.9800",
                        "5. adjusted close": "11.1208",
                        "6. volume": "199750000",
                        "7. dividend amount": "0.1000"
                    },
                    "2010-03-31": {
                        "1. open": "22.9300",
                        "2. high": "26.0000",
                        "3. low": "22.8700",
                        "4. close": "24.2700",
                        "5. adjusted close": "10.3467",
                        "6. volume": "206235200",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-02-26": {
                        "1. open": "21.9900",
                        "2. high": "23.4600",
                        "3. low": "21.2600",
                        "4. close": "22.9100",
                        "5. adjusted close": "9.7670",
                        "6. volume": "151216100",
                        "7. dividend amount": "0.0000"
                    },
                    "2010-01-29": {
                        "1. open": "23.2800",
                        "2. high": "24.4500",
                        "3. low": "21.7500",
                        "4. close": "21.7900",
                        "5. adjusted close": "9.2895",
                        "6. volume": "203695000",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-12-31": {
                        "1. open": "21.9500",
                        "2. high": "23.9500",
                        "3. low": "20.9500",
                        "4. close": "23.0600",
                        "5. adjusted close": "9.8309",
                        "6. volume": "197137700",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-11-30": {
                        "1. open": "18.9800",
                        "2. high": "22.1000",
                        "3. low": "18.8500",
                        "4. close": "21.9000",
                        "5. adjusted close": "9.3364",
                        "6. volume": "218406000",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-10-30": {
                        "1. open": "20.5400",
                        "2. high": "21.1100",
                        "3. low": "18.6900",
                        "4. close": "18.9800",
                        "5. adjusted close": "8.0915",
                        "6. volume": "200765369",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-09-30": {
                        "1. open": "18.9800",
                        "2. high": "20.9400",
                        "3. low": "18.2100",
                        "4. close": "20.6500",
                        "5. adjusted close": "8.8035",
                        "6. volume": "249477900",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-08-31": {
                        "1. open": "17.9800",
                        "2. high": "19.8500",
                        "3. low": "17.6700",
                        "4. close": "18.9900",
                        "5. adjusted close": "8.0958",
                        "6. volume": "246854000",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-07-31": {
                        "1. open": "13.9800",
                        "2. high": "17.9000",
                        "3. low": "12.7600",
                        "4. close": "17.7000",
                        "5. adjusted close": "7.5458",
                        "6. volume": "336690400",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-06-30": {
                        "1. open": "14.5700",
                        "2. high": "15.4000",
                        "3. low": "13.5400",
                        "4. close": "13.8900",
                        "5. adjusted close": "5.9216",
                        "6. volume": "260655500",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-05-29": {
                        "1. open": "14.4200",
                        "2. high": "14.5000",
                        "3. low": "12.5200",
                        "4. close": "14.3900",
                        "5. adjusted close": "6.1347",
                        "6. volume": "277779900",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-04-30": {
                        "1. open": "10.9900",
                        "2. high": "15.4400",
                        "3. low": "10.8100",
                        "4. close": "14.4600",
                        "5. adjusted close": "6.1646",
                        "6. volume": "328341700",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-03-31": {
                        "1. open": "8.9800",
                        "2. high": "12.4300",
                        "3. low": "8.1200",
                        "4. close": "11.1100",
                        "5. adjusted close": "4.7364",
                        "6. volume": "287384500",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-02-27": {
                        "1. open": "9.2600",
                        "2. high": "10.7700",
                        "3. low": "8.9000",
                        "4. close": "9.1500",
                        "5. adjusted close": "3.9008",
                        "6. volume": "243732800",
                        "7. dividend amount": "0.0000"
                    },
                    "2009-01-30": {
                        "1. open": "9.4100",
                        "2. high": "10.3600",
                        "3. low": "8.5000",
                        "4. close": "9.4400",
                        "5. adjusted close": "4.0244",
                        "6. volume": "207446737",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-12-31": {
                        "1. open": "8.6300",
                        "2. high": "10.3679",
                        "3. low": "7.9300",
                        "4. close": "9.4600",
                        "5. adjusted close": "4.0330",
                        "6. volume": "231764800",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-11-28": {
                        "1. open": "12.6700",
                        "2. high": "13.1500",
                        "3. low": "7.0600",
                        "4. close": "8.9300",
                        "5. adjusted close": "3.8070",
                        "6. volume": "328740600",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-10-31": {
                        "1. open": "14.5600",
                        "2. high": "15.0600",
                        "3. low": "9.1600",
                        "4. close": "13.1300",
                        "5. adjusted close": "5.5976",
                        "6. volume": "387293000",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-09-30": {
                        "1. open": "15.9600",
                        "2. high": "16.8200",
                        "3. low": "14.1300",
                        "4. close": "14.8700",
                        "5. adjusted close": "6.3394",
                        "6. volume": "276646800",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-08-29": {
                        "1. open": "14.8700",
                        "2. high": "17.1800",
                        "3. low": "14.0100",
                        "4. close": "15.5600",
                        "5. adjusted close": "6.6335",
                        "6. volume": "259088500",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-07-31": {
                        "1. open": "15.5200",
                        "2. high": "16.0500",
                        "3. low": "13.3300",
                        "4. close": "14.6900",
                        "5. adjusted close": "6.2626",
                        "6. volume": "345980300",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-06-30": {
                        "1. open": "18.1500",
                        "2. high": "18.5600",
                        "3. low": "15.7300",
                        "4. close": "15.7400",
                        "5. adjusted close": "6.7103",
                        "6. volume": "255107100",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-05-30": {
                        "1. open": "16.0000",
                        "2. high": "18.4100",
                        "3. low": "15.6800",
                        "4. close": "18.1900",
                        "5. adjusted close": "7.7547",
                        "6. volume": "299133924",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-04-30": {
                        "1. open": "17.8300",
                        "2. high": "18.8900",
                        "3. low": "15.3900",
                        "4. close": "16.2300",
                        "5. adjusted close": "6.9191",
                        "6. volume": "335531300",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-03-31": {
                        "1. open": "18.0200",
                        "2. high": "18.5000",
                        "3. low": "16.7700",
                        "4. close": "17.5000",
                        "5. adjusted close": "7.4606",
                        "6. volume": "297348700",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-02-29": {
                        "1. open": "18.9700",
                        "2. high": "19.3500",
                        "3. low": "17.7500",
                        "4. close": "17.9780",
                        "5. adjusted close": "7.6644",
                        "6. volume": "251565200",
                        "7. dividend amount": "0.0000"
                    },
                    "2008-01-31": {
                        "1. open": "20.1400",
                        "2. high": "21.0100",
                        "3. low": "17.6600",
                        "4. close": "18.9100",
                        "5. adjusted close": "8.0617",
                        "6. volume": "471459400",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-12-31": {
                        "1. open": "23.2300",
                        "2. high": "23.4300",
                        "3. low": "19.8900",
                        "4. close": "20.4700",
                        "5. adjusted close": "8.7267",
                        "6. volume": "231297500",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-11-30": {
                        "1. open": "26.4000",
                        "2. high": "26.6800",
                        "3. low": "21.7700",
                        "4. close": "23.3900",
                        "5. adjusted close": "9.9716",
                        "6. volume": "411435200",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-10-31": {
                        "1. open": "26.1600",
                        "2. high": "26.9200",
                        "3. low": "25.6300",
                        "4. close": "26.6800",
                        "5. adjusted close": "11.3742",
                        "6. volume": "203250600",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-09-28": {
                        "1. open": "27.6700",
                        "2. high": "28.1900",
                        "3. low": "25.9500",
                        "4. close": "26.2000",
                        "5. adjusted close": "11.1695",
                        "6. volume": "190019300",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-08-31": {
                        "1. open": "26.5100",
                        "2. high": "28.6000",
                        "3. low": "26.0300",
                        "4. close": "27.5500",
                        "5. adjusted close": "11.7451",
                        "6. volume": "276750400",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-07-31": {
                        "1. open": "26.4000",
                        "2. high": "28.5000",
                        "3. low": "25.6300",
                        "4. close": "26.6800",
                        "5. adjusted close": "11.3742",
                        "6. volume": "329705300",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-06-29": {
                        "1. open": "28.8000",
                        "2. high": "29.1500",
                        "3. low": "25.2200",
                        "4. close": "26.2400",
                        "5. adjusted close": "11.1866",
                        "6. volume": "349317900",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-05-31": {
                        "1. open": "31.1600",
                        "2. high": "31.9000",
                        "3. low": "28.0300",
                        "4. close": "28.8100",
                        "5. adjusted close": "12.2822",
                        "6. volume": "324793100",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-04-30": {
                        "1. open": "31.5400",
                        "2. high": "32.3000",
                        "3. low": "30.3000",
                        "4. close": "31.0200",
                        "5. adjusted close": "13.2244",
                        "6. volume": "176515200",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-03-30": {
                        "1. open": "30.2000",
                        "2. high": "32.4500",
                        "3. low": "28.8600",
                        "4. close": "31.3600",
                        "5. adjusted close": "13.3693",
                        "6. volume": "277997800",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-02-28": {
                        "1. open": "35.1312",
                        "2. high": "35.4200",
                        "3. low": "30.2400",
                        "4. close": "30.9000",
                        "5. adjusted close": "13.1732",
                        "6. volume": "194506600",
                        "7. dividend amount": "0.0000"
                    },
                    "2007-01-31": {
                        "1. open": "35.6000",
                        "2. high": "36.6100",
                        "3. low": "33.4900",
                        "4. close": "34.9400",
                        "5. adjusted close": "14.8956",
                        "6. volume": "161763700",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-12-29": {
                        "1. open": "35.2500",
                        "2. high": "37.1400",
                        "3. low": "34.8999",
                        "4. close": "35.4200",
                        "5. adjusted close": "15.1002",
                        "6. volume": "104973900",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-11-30": {
                        "1. open": "37.9900",
                        "2. high": "40.0100",
                        "3. low": "35.1600",
                        "4. close": "35.2950",
                        "5. adjusted close": "15.0469",
                        "6. volume": "164805800",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-10-31": {
                        "1. open": "34.1500",
                        "2. high": "39.5000",
                        "3. low": "33.6100",
                        "4. close": "37.7500",
                        "5. adjusted close": "16.0935",
                        "6. volume": "184537300",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-09-29": {
                        "1. open": "31.6100",
                        "2. high": "35.0400",
                        "3. low": "30.5300",
                        "4. close": "34.0500",
                        "5. adjusted close": "14.5161",
                        "6. volume": "159054200",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-08-31": {
                        "1. open": "33.9900",
                        "2. high": "33.9900",
                        "3. low": "28.7200",
                        "4. close": "31.0100",
                        "5. adjusted close": "13.2201",
                        "6. volume": "264913600",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-07-31": {
                        "1. open": "37.9600",
                        "2. high": "38.3300",
                        "3. low": "32.9300",
                        "4. close": "34.2300",
                        "5. adjusted close": "14.5929",
                        "6. volume": "155221500",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-06-30": {
                        "1. open": "35.4900",
                        "2. high": "38.0200",
                        "3. low": "34.9100",
                        "4. close": "37.7600",
                        "5. adjusted close": "16.0978",
                        "6. volume": "127290700",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-05-31": {
                        "1. open": "37.6900",
                        "2. high": "39.8800",
                        "3. low": "34.6000",
                        "4. close": "35.6500",
                        "5. adjusted close": "15.1983",
                        "6. volume": "167954100",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-04-28": {
                        "1. open": "38.0000",
                        "2. high": "39.5000",
                        "3. low": "36.7700",
                        "4. close": "37.2700",
                        "5. adjusted close": "15.8889",
                        "6. volume": "98161100",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-03-31": {
                        "1. open": "36.3600",
                        "2. high": "38.1100",
                        "3. low": "34.7300",
                        "4. close": "37.6300",
                        "5. adjusted close": "16.0424",
                        "6. volume": "112978300",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-02-28": {
                        "1. open": "31.3100",
                        "2. high": "36.8700",
                        "3. low": "31.1400",
                        "4. close": "36.3200",
                        "5. adjusted close": "15.4839",
                        "6. volume": "124101300",
                        "7. dividend amount": "0.0000"
                    },
                    "2006-01-31": {
                        "1. open": "30.5700",
                        "2. high": "32.3200",
                        "3. low": "29.9000",
                        "4. close": "31.7000",
                        "5. adjusted close": "13.5143",
                        "6. volume": "83682800",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-12-30": {
                        "1. open": "30.8100",
                        "2. high": "32.4600",
                        "3. low": "29.9400",
                        "4. close": "30.0100",
                        "5. adjusted close": "12.7938",
                        "6. volume": "90693700",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-11-30": {
                        "1. open": "28.3000",
                        "2. high": "32.0000",
                        "3. low": "28.0700",
                        "4. close": "30.4500",
                        "5. adjusted close": "12.9814",
                        "6. volume": "116347100",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-10-31": {
                        "1. open": "50.2000",
                        "2. high": "55.2500",
                        "3. low": "26.8700",
                        "4. close": "28.2800",
                        "5. adjusted close": "12.0563",
                        "6. volume": "83384650",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-09-30": {
                        "1. open": "49.8000",
                        "2. high": "50.1600",
                        "3. low": "46.0100",
                        "4. close": "50.1000",
                        "5. adjusted close": "10.6793",
                        "6. volume": "66552600",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-08-31": {
                        "1. open": "52.5500",
                        "2. high": "52.7700",
                        "3. low": "48.0000",
                        "4. close": "49.0300",
                        "5. adjusted close": "10.4512",
                        "6. volume": "54132800",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-07-29": {
                        "1. open": "51.7300",
                        "2. high": "54.3900",
                        "3. low": "49.2800",
                        "4. close": "52.5500",
                        "5. adjusted close": "11.2015",
                        "6. volume": "68155400",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-06-30": {
                        "1. open": "54.9200",
                        "2. high": "56.9000",
                        "3. low": "51.5200",
                        "4. close": "51.6600",
                        "5. adjusted close": "11.0118",
                        "6. volume": "57109100",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-05-31": {
                        "1. open": "49.9000",
                        "2. high": "55.7200",
                        "3. low": "49.2000",
                        "4. close": "54.7900",
                        "5. adjusted close": "11.6790",
                        "6. volume": "65783600",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-04-29": {
                        "1. open": "52.1800",
                        "2. high": "52.3800",
                        "3. low": "44.5800",
                        "4. close": "49.5200",
                        "5. adjusted close": "10.5556",
                        "6. volume": "106415800",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-03-31": {
                        "1. open": "51.8100",
                        "2. high": "55.5900",
                        "3. low": "50.7200",
                        "4. close": "51.6600",
                        "5. adjusted close": "11.0118",
                        "6. volume": "67321500",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-02-28": {
                        "1. open": "54.1600",
                        "2. high": "54.9800",
                        "3. low": "49.1400",
                        "4. close": "51.8100",
                        "5. adjusted close": "11.0438",
                        "6. volume": "79065900",
                        "7. dividend amount": "0.0000"
                    },
                    "2005-01-31": {
                        "1. open": "63.2900",
                        "2. high": "63.3400",
                        "3. low": "52.1000",
                        "4. close": "54.0000",
                        "5. adjusted close": "11.5106",
                        "6. volume": "116661300",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-12-31": {
                        "1. open": "56.3300",
                        "2. high": "64.2600",
                        "3. low": "56.2900",
                        "4. close": "62.3600",
                        "5. adjusted close": "13.2926",
                        "6. volume": "63447900",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-11-30": {
                        "1. open": "52.6700",
                        "2. high": "57.0000",
                        "3. low": "52.6000",
                        "4. close": "56.2600",
                        "5. adjusted close": "11.9923",
                        "6. volume": "61317900",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-10-29": {
                        "1. open": "45.9600",
                        "2. high": "53.2500",
                        "3. low": "45.2900",
                        "4. close": "52.8800",
                        "5. adjusted close": "11.2719",
                        "6. volume": "73035500",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-09-30": {
                        "1. open": "43.0500",
                        "2. high": "46.2900",
                        "3. low": "42.7900",
                        "4. close": "45.4600",
                        "5. adjusted close": "9.6902",
                        "6. volume": "51802600",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-08-31": {
                        "1. open": "46.8500",
                        "2. high": "47.1300",
                        "3. low": "42.0500",
                        "4. close": "43.2400",
                        "5. adjusted close": "9.2170",
                        "6. volume": "81626500",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-07-30": {
                        "1. open": "44.6200",
                        "2. high": "48.4000",
                        "3. low": "44.0200",
                        "4. close": "46.9900",
                        "5. adjusted close": "10.0164",
                        "6. volume": "77025100",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-06-30": {
                        "1. open": "40.6900",
                        "2. high": "44.4000",
                        "3. low": "40.6200",
                        "4. close": "43.4900",
                        "5. adjusted close": "9.2703",
                        "6. volume": "60905900",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-05-28": {
                        "1. open": "38.8900",
                        "2. high": "41.2000",
                        "3. low": "37.0300",
                        "4. close": "40.6000",
                        "5. adjusted close": "8.6543",
                        "6. volume": "57748900",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-04-30": {
                        "1. open": "38.1400",
                        "2. high": "39.9100",
                        "3. low": "36.7400",
                        "4. close": "38.9200",
                        "5. adjusted close": "8.2962",
                        "6. volume": "60073500",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-03-31": {
                        "1. open": "37.8500",
                        "2. high": "38.7400",
                        "3. low": "36.5100",
                        "4. close": "37.8700",
                        "5. adjusted close": "8.0723",
                        "6. volume": "72086600",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-02-27": {
                        "1. open": "36.8200",
                        "2. high": "39.6800",
                        "3. low": "36.0000",
                        "4. close": "37.4000",
                        "5. adjusted close": "7.9722",
                        "6. volume": "67969400",
                        "7. dividend amount": "0.0000"
                    },
                    "2004-01-30": {
                        "1. open": "33.4500",
                        "2. high": "36.8100",
                        "3. low": "32.9000",
                        "4. close": "36.6100",
                        "5. adjusted close": "7.8038",
                        "6. volume": "67403700",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-12-31": {
                        "1. open": "32.0800",
                        "2. high": "33.4300",
                        "3. low": "31.4200",
                        "4. close": "33.1600",
                        "5. adjusted close": "7.0684",
                        "6. volume": "50343000",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-11-28": {
                        "1. open": "31.3600",
                        "2. high": "33.0500",
                        "3. low": "30.0000",
                        "4. close": "32.1700",
                        "5. adjusted close": "6.8573",
                        "6. volume": "54252200",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-10-31": {
                        "1. open": "29.0400",
                        "2. high": "32.0010",
                        "3. low": "28.8000",
                        "4. close": "31.5900",
                        "5. adjusted close": "6.7337",
                        "6. volume": "56096200",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-09-30": {
                        "1. open": "28.0900",
                        "2. high": "30.9500",
                        "3. low": "28.0600",
                        "4. close": "28.8000",
                        "5. adjusted close": "6.1390",
                        "6. volume": "78639800",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-08-29": {
                        "1. open": "27.4000",
                        "2. high": "28.5300",
                        "3. low": "26.0000",
                        "4. close": "28.3900",
                        "5. adjusted close": "6.0516",
                        "6. volume": "49065500",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-07-31": {
                        "1. open": "24.9500",
                        "2. high": "27.7690",
                        "3. low": "24.7800",
                        "4. close": "27.3300",
                        "5. adjusted close": "5.8256",
                        "6. volume": "84190200",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-06-30": {
                        "1. open": "24.5600",
                        "2. high": "25.4560",
                        "3. low": "23.7500",
                        "4. close": "24.5500",
                        "5. adjusted close": "5.2331",
                        "6. volume": "69774300",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-05-30": {
                        "1. open": "23.4200",
                        "2. high": "24.8300",
                        "3. low": "22.8000",
                        "4. close": "24.6700",
                        "5. adjusted close": "5.2586",
                        "6. volume": "95413300",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-04-30": {
                        "1. open": "25.8100",
                        "2. high": "26.8700",
                        "3. low": "23.3500",
                        "4. close": "23.5100",
                        "5. adjusted close": "5.0114",
                        "6. volume": "106551200",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-03-31": {
                        "1. open": "23.6200",
                        "2. high": "26.5200",
                        "3. low": "22.2000",
                        "4. close": "25.7600",
                        "5. adjusted close": "5.4910",
                        "6. volume": "93972700",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-02-28": {
                        "1. open": "22.6700",
                        "2. high": "23.5200",
                        "3. low": "21.6000",
                        "4. close": "23.4500",
                        "5. adjusted close": "4.9986",
                        "6. volume": "73490800",
                        "7. dividend amount": "0.0000"
                    },
                    "2003-01-31": {
                        "1. open": "20.4700",
                        "2. high": "23.3000",
                        "3. low": "19.6200",
                        "4. close": "22.7200",
                        "5. adjusted close": "4.8430",
                        "6. volume": "90031600",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-12-31": {
                        "1. open": "22.0000",
                        "2. high": "22.0900",
                        "3. low": "20.1800",
                        "4. close": "20.3800",
                        "5. adjusted close": "4.3442",
                        "6. volume": "70806600",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-11-29": {
                        "1. open": "24.0500",
                        "2. high": "24.1600",
                        "3. low": "20.8500",
                        "4. close": "21.7400",
                        "5. adjusted close": "4.6341",
                        "6. volume": "75453400",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-10-31": {
                        "1. open": "20.6600",
                        "2. high": "24.1000",
                        "3. low": "20.6600",
                        "4. close": "23.8400",
                        "5. adjusted close": "5.0817",
                        "6. volume": "107740100",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-09-30": {
                        "1. open": "19.9900",
                        "2. high": "21.5700",
                        "3. low": "19.6000",
                        "4. close": "20.6400",
                        "5. adjusted close": "4.3996",
                        "6. volume": "70864100",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-08-30": {
                        "1. open": "19.5200",
                        "2. high": "21.8200",
                        "3. low": "18.4800",
                        "4. close": "20.1000",
                        "5. adjusted close": "4.2845",
                        "6. volume": "81003000",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-07-31": {
                        "1. open": "24.4200",
                        "2. high": "24.9600",
                        "3. low": "18.4400",
                        "4. close": "19.6300",
                        "5. adjusted close": "4.1843",
                        "6. volume": "119645920",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-06-28": {
                        "1. open": "24.3000",
                        "2. high": "25.3000",
                        "3. low": "22.4400",
                        "4. close": "24.8500",
                        "5. adjusted close": "5.2970",
                        "6. volume": "88722900",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-05-31": {
                        "1. open": "22.8500",
                        "2. high": "24.5000",
                        "3. low": "21.9300",
                        "4. close": "24.2800",
                        "5. adjusted close": "5.1755",
                        "6. volume": "87164900",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-04-30": {
                        "1. open": "23.3300",
                        "2. high": "25.7000",
                        "3. low": "22.6400",
                        "4. close": "22.8200",
                        "5. adjusted close": "4.8643",
                        "6. volume": "78853200",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-03-28": {
                        "1. open": "23.5600",
                        "2. high": "24.5300",
                        "3. low": "22.3500",
                        "4. close": "23.1300",
                        "5. adjusted close": "4.9304",
                        "6. volume": "64989600",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-02-28": {
                        "1. open": "23.8500",
                        "2. high": "23.8500",
                        "3. low": "20.8200",
                        "4. close": "23.0100",
                        "5. adjusted close": "4.9048",
                        "6. volume": "55804400",
                        "7. dividend amount": "0.0000"
                    },
                    "2002-01-31": {
                        "1. open": "19.1100",
                        "2. high": "23.8800",
                        "3. low": "19.0000",
                        "4. close": "23.7700",
                        "5. adjusted close": "5.0668",
                        "6. volume": "105308800",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-12-31": {
                        "1. open": "18.9100",
                        "2. high": "19.9700",
                        "3. low": "17.6000",
                        "4. close": "19.0500",
                        "5. adjusted close": "4.0607",
                        "6. volume": "70911800",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-11-30": {
                        "1. open": "17.1500",
                        "2. high": "19.5500",
                        "3. low": "16.6800",
                        "4. close": "17.7200",
                        "5. adjusted close": "3.7772",
                        "6. volume": "94309900",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-10-31": {
                        "1. open": "14.8000",
                        "2. high": "17.9500",
                        "3. low": "14.1600",
                        "4. close": "17.1200",
                        "5. adjusted close": "3.6493",
                        "6. volume": "97201500",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-09-28": {
                        "1. open": "16.8600",
                        "2. high": "17.3200",
                        "3. low": "13.4600",
                        "4. close": "14.9400",
                        "5. adjusted close": "3.1846",
                        "6. volume": "84833700",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-08-31": {
                        "1. open": "18.1300",
                        "2. high": "19.0900",
                        "3. low": "16.8000",
                        "4. close": "16.8700",
                        "5. adjusted close": "3.5960",
                        "6. volume": "87104800",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-07-31": {
                        "1. open": "22.4900",
                        "2. high": "22.9000",
                        "3. low": "17.9000",
                        "4. close": "18.0400",
                        "5. adjusted close": "3.8454",
                        "6. volume": "94129600",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-06-29": {
                        "1. open": "20.0100",
                        "2. high": "23.3100",
                        "3. low": "18.9300",
                        "4. close": "23.0000",
                        "5. adjusted close": "4.9027",
                        "6. volume": "73768600",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-05-31": {
                        "1. open": "19.3500",
                        "2. high": "21.5300",
                        "3. low": "18.0000",
                        "4. close": "19.5200",
                        "5. adjusted close": "4.1609",
                        "6. volume": "94233100",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-04-30": {
                        "1. open": "42.5600",
                        "2. high": "43.5600",
                        "3. low": "18.5000",
                        "4. close": "19.3500",
                        "5. adjusted close": "4.1246",
                        "6. volume": "74504600",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-03-30": {
                        "1. open": "47.5000",
                        "2. high": "49.0600",
                        "3. low": "38.5600",
                        "4. close": "42.4400",
                        "5. adjusted close": "4.5232",
                        "6. volume": "58850300",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-02-28": {
                        "1. open": "49.3800",
                        "2. high": "51.3100",
                        "3. low": "46.2500",
                        "4. close": "47.6300",
                        "5. adjusted close": "5.0764",
                        "6. volume": "40774700",
                        "7. dividend amount": "0.0000"
                    },
                    "2001-01-31": {
                        "1. open": "43.9200",
                        "2. high": "50.0600",
                        "3. low": "40.3800",
                        "4. close": "49.9400",
                        "5. adjusted close": "5.3226",
                        "6. volume": "50383600",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-12-29": {
                        "1. open": "46.2500",
                        "2. high": "47.0000",
                        "3. low": "41.3800",
                        "4. close": "44.2500",
                        "5. adjusted close": "4.7161",
                        "6. volume": "43535900",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-11-30": {
                        "1. open": "44.3100",
                        "2. high": "50.8100",
                        "3. low": "43.0000",
                        "4. close": "45.5600",
                        "5. adjusted close": "4.8558",
                        "6. volume": "60969200",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-10-31": {
                        "1. open": "40.1300",
                        "2. high": "44.8800",
                        "3. low": "36.7500",
                        "4. close": "44.6900",
                        "5. adjusted close": "4.7630",
                        "6. volume": "39489800",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-09-29": {
                        "1. open": "38.2500",
                        "2. high": "41.7500",
                        "3. low": "35.8800",
                        "4. close": "40.0600",
                        "5. adjusted close": "4.2696",
                        "6. volume": "27059800",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-08-31": {
                        "1. open": "37.4700",
                        "2. high": "44.1300",
                        "3. low": "34.5600",
                        "4. close": "36.6300",
                        "5. adjusted close": "3.9040",
                        "6. volume": "49693100",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-07-31": {
                        "1. open": "38.0000",
                        "2. high": "42.7500",
                        "3. low": "35.9400",
                        "4. close": "37.5000",
                        "5. adjusted close": "3.9967",
                        "6. volume": "42120500",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-06-30": {
                        "1. open": "34.1300",
                        "2. high": "39.5000",
                        "3. low": "32.0000",
                        "4. close": "38.1900",
                        "5. adjusted close": "4.0703",
                        "6. volume": "82465800",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-05-31": {
                        "1. open": "31.0000",
                        "2. high": "35.0000",
                        "3. low": "28.0000",
                        "4. close": "33.5000",
                        "5. adjusted close": "3.5704",
                        "6. volume": "49548300",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-04-28": {
                        "1. open": "40.1900",
                        "2. high": "43.5000",
                        "3. low": "30.0000",
                        "4. close": "30.2300",
                        "5. adjusted close": "3.2219",
                        "6. volume": "62301700",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-03-31": {
                        "1. open": "35.1300",
                        "2. high": "45.2500",
                        "3. low": "32.6300",
                        "4. close": "44.8100",
                        "5. adjusted close": "4.7758",
                        "6. volume": "50016400",
                        "7. dividend amount": "0.0000"
                    },
                    "2000-02-29": {
                        "1. open": "31.7500",
                        "2. high": "36.1900",
                        "3. low": "30.3800",
                        "4. close": "35.1300",
                        "5. adjusted close": "3.7441",
                        "6. volume": "50079500",
                        "7. dividend amount": "0.0000"
                    }
                }
            }
        ]
        hardcodedMonthlyQuotes.forEach(function(item, idx) {
            let quoteMeta = item['Meta Data']
            let newQuote = {}
            let ticker = quoteMeta['2. Symbol']
            newQuote['symbol'] = ticker
            newQuote['monthly_prices'] = Object.entries(item['Monthly Adjusted Time Series']).map(price => price[1]['5. adjusted close'])
            newQuotes[ticker] = newQuote
        })
        this.setState({ allMonthlyQuotes: newQuotes })
    }

    changeSort(new_sort_column) {
        if (new_sort_column === this.state.sort_column) {
            this.setState(prevState => ({
                sort_dir_asc: !prevState.sort_dir_asc
            }))
        }
        this.setState({ sort_column: new_sort_column })
    }

    render() {
        let self = this
        let sort_column = this.state.sort_column
        let sort_triangle = (this.state.sort_dir_asc === true) ? String.fromCharCode(9650) : String.fromCharCode(9660)
        let sorted_positions = Object.keys(this.state.allCurrentQuotes).sort(function(a, b) {
            if (self.state.allCurrentQuotes.hasOwnProperty(a) && self.state.allCurrentQuotes.hasOwnProperty(b)) {
                let value_a = self.state.allCurrentQuotes[a][self.state.sort_column]
                let value_b = self.state.allCurrentQuotes[b][self.state.sort_column]
                if (self.state.sort_dir_asc === true) {
                    if (value_a < value_b) {
                        return -1
                    }
                    if (value_a > value_b) {
                        return 1
                    }
                } else {
                    if (value_a < value_b) {
                        return 1
                    }
                    if (value_a > value_b) {
                        return -1
                    }
                }
            }
            return 0
        })
        return (
            <div id="page-wrapper">
                <table id="position-listing">
                    <thead>
                        <tr>
                            <th onClick={ (e) => this.changeSort('symbol') }>Symbol{ sort_column === 'symbol' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('price') }>Price{ sort_column === 'price' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('change') }>Change{ sort_column === 'change' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('change_pct') }>Change Pct{ sort_column === 'change_pct' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('volume') }>Volume{ sort_column === 'volume' ? sort_triangle : '' }</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted_positions.map(ticker => (
                            <PositionRow 
                                key={ticker}
                                position={this.state.allCurrentQuotes[ticker]} 
                        />))}
                    </tbody>
                </table>
            </div>
        )
    }

}