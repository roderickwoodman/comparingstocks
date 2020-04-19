import React from 'react'
import PropTypes from 'prop-types'


export class Console extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            data_sort_dir: 'desc'
        }
        this.getClasses = this.getClasses.bind(this)
        this.formatTimestamp = this.formatTimestamp.bind(this)
        this.onToggleSortOrder = this.onToggleSortOrder.bind(this)
    }

    getClasses(message) {
        let classes = 'message'
        if (message.toLowerCase().includes('error')) {
            classes += ' warning'
        }
        return classes
    }

    formatTimestamp(epoch) {
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        let localISOTime = (new Date(new Date(epoch) - tzoffset)).toISOString()
        let iso = localISOTime.match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/)
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

    render() {

        const PopulateMessageSet = ({key, message_set}) => {
            let timestamp = this.formatTimestamp(message_set.modified_at)
            return (
                <div class="message_set">
                    <p class="summary">[{timestamp}] <span className={this.getClasses(message_set.summary)}>{message_set.summary}</span></p>
                    { message_set.messages.map (message => (
                        <p key={key}><span className={this.getClasses(message)}>{message}</span></p>
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
                { ordered_message_sets && ordered_message_sets.map( message_set => (
                    <PopulateMessageSet key={message_set.modified_at} message_set={message_set} />
                ))}
                </div>
            </div>
        )
    }
}

Console.propTypes = {
    all_console_messages: PropTypes.array.isRequired,
}