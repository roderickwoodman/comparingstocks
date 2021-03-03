import React, { useState } from 'react'
import PropTypes from 'prop-types'


export const Console = (props) => {

    const [dataSortDir, setDataSortDir] = useState('desc')
    const [expandedMessageSets, setExpandedMessageSets] = useState([])

    const getClasses = (message) => {
        let classes = 'message'
        if (message.toUpperCase().startsWith('ERROR')) {
            classes += ' warning'
        }
        return classes
    }

    const getMessageSetClasses = (messageSetCount) => {
        let classes = 'messageSet'
        if (parseInt(messageSetCount) > 1) {
            classes += ' multiline'
        }
        return classes
    }

    const formatTimestamp = (epoch) => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        const localISOTime = (new Date(new Date(parseInt(epoch)) - tzoffset)).toISOString()
        const iso = localISOTime.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/)
        return iso[1] + ' ' + iso[2]
    }

    const onToggleSortOrder = () => {
        const newSortDir = (dataSortDir === 'asc') ? 'desc' : 'asc'
        setDataSortDir(newSortDir)
    }

    const onToggleExpandMessageSet = (identifier) => {
        let newExpandedMessageSets = JSON.parse(JSON.stringify(expandedMessageSets))
        if (!newExpandedMessageSets.includes(identifier)) {
            newExpandedMessageSets = [identifier]
        } else {
            newExpandedMessageSets = []
        }
        setExpandedMessageSets(newExpandedMessageSets)
    }

    const PopulateMessageSet = (toPopulate) => {
        const timestamp = formatTimestamp(toPopulate.messageSet.modifiedAt)
        const count = toPopulate.messageSet.messages.length
        return (
            <div className={getMessageSetClasses(count)}>
                <p className="summary" onClick={ (e) => onToggleExpandMessageSet(timestamp)}>[{timestamp}] <span className={getClasses(toPopulate.messageSet.summary)}>{toPopulate.messageSet.summary}</span></p>
                { toPopulate.messageSet.messages.length > 1 && expandedMessageSets.includes(timestamp) && toPopulate.messageSet.messages.map ( (message, i) => (
                    <p key={i} onClick={ (e) => onToggleExpandMessageSet(timestamp)}><span className={getClasses(message)}>{message}</span></p>
                ))}
            </div>
        )
    }

    const messageSets = props.allConsoleMessages
    let orderedMessageSets
    orderedMessageSets = messageSets.sort(function(a,b) {
        if (a.modifiedAt < b.modifiedAt) {
            return (dataSortDir === 'asc') ? -1 : 1
        } else if (a.modifiedAt > b.modifiedAt) {
            return (dataSortDir === 'asc') ? 1 : -1
        } else {
            return 0
        }
    })

    return (
        <div id="console-messages-wrapper">
            <button onClick={ (e)=>onToggleSortOrder() } className="strong">&#x21c5;</button> History:
            <div id="console-messages">
            { orderedMessageSets && orderedMessageSets.map( (messageSet, i) => (
                <PopulateMessageSet key={i} messageSet={messageSet} />
            ))}
            </div>
        </div>
    )
}

Console.propTypes = {
    allConsoleMessages: PropTypes.array.isRequired,
}