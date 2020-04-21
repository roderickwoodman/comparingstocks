import React from 'react'
import PropTypes from 'prop-types'


export class Console extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            data_sort_dir: 'desc',
            expanded_message_sets: []
        }
        this.getClasses = this.getClasses.bind(this)
        this.getMessageSetClasses = this.getMessageSetClasses.bind(this)
        this.formatTimestamp = this.formatTimestamp.bind(this)
        this.onToggleExpandMessageSet = this.onToggleExpandMessageSet.bind(this)
        this.onToggleSortOrder = this.onToggleSortOrder.bind(this)
    }

    getClasses(message) {
        let classes = 'message'
        if (message.toUpperCase().startsWith('ERROR')) {
            classes += ' warning'
        }
        return classes
    }

    getMessageSetClasses(message_set_count) {
        let classes = 'message_set'
        if (parseInt(message_set_count) > 1) {
            classes += ' multiline'
        }
        return classes
    }

    formatTimestamp(epoch) {
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        let localISOTime = (new Date(new Date(epoch) - tzoffset)).toISOString()
        let iso = localISOTime.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/)
        return iso[1] + ' ' + iso[2]
    }

    onToggleSortOrder() {
        this.setState(prevState => {
            let new_sort_dir = (prevState.data_sort_dir === 'asc') ? 'desc' : 'asc'
            return { 
                data_sort_dir: new_sort_dir 
            }
        })
    }

    onToggleExpandMessageSet(identifier) {
        this.setState(prevState => {
            let new_expanded_message_sets = JSON.parse(JSON.stringify(prevState.expanded_message_sets))
            if (!new_expanded_message_sets.includes(identifier)) {
                new_expanded_message_sets = [identifier]
            } else {
                new_expanded_message_sets = []
            }
            return { expanded_message_sets: new_expanded_message_sets }
        })
    }

    render() {

        const PopulateMessageSet = ({message_set}) => {
            let timestamp = this.formatTimestamp(message_set.modified_at)
            let count = message_set.messages.length
            return (
                <div className={this.getMessageSetClasses(count)}>
                    <p className="summary" onClick={ (e) => this.onToggleExpandMessageSet(timestamp)}>[{timestamp}] <span className={this.getClasses(message_set.summary)}>{message_set.summary}</span></p>
                    { message_set.messages.length > 1 && this.state.expanded_message_sets.includes(timestamp) && message_set.messages.map ( (message, i) => (
                        <p key={i} onClick={ (e) => this.onToggleExpandMessageSet(timestamp)}><span className={this.getClasses(message)}>{message}</span></p>
                    ))}
                </div>
            )
        }

        let message_sets = this.props.all_console_messages
        let ordered_message_sets
        let self = this
        ordered_message_sets = message_sets.sort(function(a,b) {
            if (a.modified_at < b.modified_at) {
                return (self.state.data_sort_dir === 'asc') ? -1 : 1
            } else if (a.modified_at > b.modified_at) {
                return (self.state.data_sort_dir === 'asc') ? 1 : -1
            } else {
                return 0
            }

        })
        return (
            <div id="console-messages-wrapper">
                <button onClick={ (e)=>this.onToggleSortOrder() } className="strong">&#x21c5;</button> History:
                <div id="console-messages">
                { ordered_message_sets && ordered_message_sets.map( (message_set, i) => (
                    <PopulateMessageSet key={i} message_set={message_set} />
                ))}
                </div>
            </div>
        )
    }
}

Console.propTypes = {
    all_console_messages: PropTypes.array.isRequired,
}