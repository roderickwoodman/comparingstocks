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
        let user_tag = addToTag
        let user_tickers = String(userTickersString)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.toUpperCase())
            .map(str => str.replace(/[^A-Z]/g, ""))
        validateTickers(user_tag, Array.from(new Set(user_tickers)))
    }

    const validateTickers = (tag, tickers) => {
        let tickers_to_add = []
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
                let tagged_tickers = []
                Object.keys(props.allTags).forEach(function(tag) {
                    if (tag !== 'untagged') {
                        tagged_tickers = tagged_tickers.concat(props.allTags[tag])
                    }
                })
                if (tag === 'untagged' && tagged_tickers.includes(ticker)) {
                    newMessages.push('ERROR: Ticker ' + ticker + ' has already been added to another named tag.')
                } else {
                    if (tag === 'untagged') {
                        newMessages.push('Ticker ' + ticker + ' has now been added.')
                    } else {
                        newMessages.push('Ticker ' + ticker + ' has now been added to tag "' + tag + '".')
                    }
                    tickers_to_add.push(ticker)
                }
            }
        })
        let numErrors = newMessages.filter(message => message.includes('ERROR')).length
        let summary
        let tag_status_str = (tag !== 'untagged') ? ' to tag "' + tag + '"' : ''
        if (newMessages.length === 1) {
            summary = newMessages[0]
        } else if (numErrors === 0) {
            summary = 'Added ' + tickers.length + ' tickers' + tag_status_str + '.'
        } else {
            summary = 'ERROR: ' + numErrors + ' of ' + tickers.length + ' tickers could not be added' + tag_status_str + '.'
        }
        let newConsoleMessageSet = props.createConsoleMessageSet(summary)
        if (newMessages.length > 1) {
            newConsoleMessageSet.messages = [...newMessages]
        }
        if (numErrors > 0) {
            newConsoleMessageSet.hasErrors = true
        }
        props.onNewTickers(tag, tickers_to_add)
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
                        {Object.keys(props.allTags).sort().filter(tag_name => tag_name !== 'untagged').map(tag_name => (
                        <option key={tag_name} value={tag_name}>{tag_name}</option>
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