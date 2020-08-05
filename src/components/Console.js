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

    const getMessageSetClasses = (message_set_count) => {
        let classes = 'message_set'
        if (parseInt(message_set_count) > 1) {
            classes += ' multiline'
        }
        return classes
    }

    const formatTimestamp = (epoch) => {
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        let localISOTime = (new Date(new Date(parseInt(epoch)) - tzoffset)).toISOString()
        let iso = localISOTime.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/)
        return iso[1] + ' ' + iso[2]
    }

    const onToggleSortOrder = () => {
        let new_sort_dir = (dataSortDir === 'asc') ? 'desc' : 'asc'
        setDataSortDir(new_sort_dir)
    }

    const onToggleExpandMessageSet = (identifier) => {
        let new_expanded_message_sets = JSON.parse(JSON.stringify(expandedMessageSets))
        if (!new_expanded_message_sets.includes(identifier)) {
            new_expanded_message_sets = [identifier]
        } else {
            new_expanded_message_sets = []
        }
        setExpandedMessageSets(new_expanded_message_sets)
    }

    const PopulateMessageSet = (to_populate) => {
        let timestamp = formatTimestamp(to_populate.message_set.modified_at)
        let count = to_populate.message_set.messages.length
        return (
            <div className={getMessageSetClasses(count)}>
                <p className="summary" onClick={ (e) => onToggleExpandMessageSet(timestamp)}>[{timestamp}] <span className={getClasses(to_populate.message_set.summary)}>{to_populate.message_set.summary}</span></p>
                { to_populate.message_set.messages.length > 1 && expandedMessageSets.includes(timestamp) && to_populate.message_set.messages.map ( (message, i) => (
                    <p key={i} onClick={ (e) => onToggleExpandMessageSet(timestamp)}><span className={getClasses(message)}>{message}</span></p>
                ))}
            </div>
        )
    }

    let message_sets = props.all_console_messages
    let ordered_message_sets
    ordered_message_sets = message_sets.sort(function(a,b) {
        if (a.modified_at < b.modified_at) {
            return (dataSortDir === 'asc') ? -1 : 1
        } else if (a.modified_at > b.modified_at) {
            return (dataSortDir === 'asc') ? 1 : -1
        } else {
            return 0
        }
    })

    return (
        <div id="console-messages-wrapper">
            <button onClick={ (e)=>onToggleSortOrder() } className="strong">&#x21c5;</button> History:
            <div id="console-messages">
            { ordered_message_sets && ordered_message_sets.map( (message_set, i) => (
                <PopulateMessageSet key={i} message_set={message_set} />
            ))}
            </div>
        </div>
    )
}

Console.propTypes = {
    all_console_messages: PropTypes.array.isRequired,
}