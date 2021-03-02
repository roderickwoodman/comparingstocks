import React, { useState } from 'react'
import PropTypes from 'prop-types'


export const TickerAdd = (props) => {

    const [userTickersString, setUserTickersString] = useState('')
    const [addToTag, setAddToTag] = useState('untagged')

    const handleTickersChange = (event) => {
        setUserTickersString(event.target.value)
    }

    const handleTagChange = (event) => {
        setAddToTag(event.target.value)
    }

    const handleReset = (event) => {
        setUserTickersString('')
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        let userTag = addToTag
        let userTickers = String(userTickersString)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.toUpperCase())
            .map(str => str.replace(/[^A-Z]/g, ""))
        validateTickers(userTag, Array.from(new Set(userTickers)))
    }

    const validateTickers = (tag, tickers) => {
        let tickersToAdd = []
        let newMessages = []
        tickers.forEach(function(ticker) {
            // ticker does not exist
            if (!props.allStocks.includes(ticker)) {
                newMessages.push('ERROR: Ticker ' + ticker + ' does not exist.')

            // ticker is already in the target tag
            } else if (props.allTags[tag].includes(ticker)) {
                if (tag === 'untagged') {
                    newMessages.push('ERROR: Ticker ' + ticker + ' has already been added.')
                } else {
                    newMessages.push('ERROR: Ticker ' + ticker + ' has already been added to tag "'+ tag +'".')
                }

            // ticker is being added to a tag that it is not already in
            } else {
                let taggedTickers = []
                Object.keys(props.allTags).forEach(function(tag) {
                    if (tag !== 'untagged') {
                        taggedTickers = taggedTickers.concat(props.allTags[tag])
                    }
                })
                if (tag === 'untagged' && taggedTickers.includes(ticker)) {
                    newMessages.push('ERROR: Ticker ' + ticker + ' has already been added to another named tag.')
                } else {
                    if (tag === 'untagged') {
                        newMessages.push('Ticker ' + ticker + ' has now been added.')
                    } else {
                        newMessages.push('Ticker ' + ticker + ' has now been added to tag "' + tag + '".')
                    }
                    tickersToAdd.push(ticker)
                }
            }
        })
        let numErrors = newMessages.filter(message => message.includes('ERROR')).length
        let summary
        let tagStatusStr = (tag !== 'untagged') ? ' to tag "' + tag + '"' : ''
        if (newMessages.length === 1) {
            summary = newMessages[0]
        } else if (numErrors === 0) {
            summary = 'Added ' + tickers.length + ' tickers' + tagStatusStr + '.'
        } else {
            summary = 'ERROR: ' + numErrors + ' of ' + tickers.length + ' tickers could not be added' + tagStatusStr + '.'
        }
        let newConsoleMessageSet = props.createConsoleMessageSet(summary)
        if (newMessages.length > 1) {
            newConsoleMessageSet.messages = [...newMessages]
        }
        if (numErrors > 0) {
            newConsoleMessageSet.hasErrors = true
        }
        props.onNewTickers(tag, tickersToAdd)
        props.onNewConsoleMessages(newConsoleMessageSet)
        handleReset()
    }

    return (
        <section id="add-ticker">
            <form onSubmit={handleSubmit} onReset={handleReset}>
                <label>New Ticker(s):</label>
                <input value={userTickersString} onChange={handleTickersChange} placeholder="Dow30 tickers only" required />
                <label>
                    Add to Tag:
                    <select value={addToTag} onChange={handleTagChange}>
                        <option key="untagged" value="untagged">(no tag)</option>
                        {Object.keys(props.allTags).sort().filter(tagName => tagName !== 'untagged').map(tagName => (
                        <option key={tagName} value={tagName}>{tagName}</option>
                        ))}
                    </select>
                </label>
                <section className="buttonrow">
                    <input className="btn btn-sm btn-primary" type="submit" value="Add Ticker(s)" disabled={userTickersString===''}/>
                </section>
            </form>
        </section>
    )
}

TickerAdd.propTypes = {
    allStocks: PropTypes.array.isRequired,
    allTags: PropTypes.object.isRequired,
    onNewTickers: PropTypes.func.isRequired,
    createConsoleMessageSet: PropTypes.func.isRequired,
    onNewConsoleMessages: PropTypes.func.isRequired
}