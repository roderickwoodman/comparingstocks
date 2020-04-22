import React from 'react'
import PropTypes from 'prop-types'


export class TagDelete extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            delete_tag_list: ['untagged'],
        }
        this.handleTagChange = this.handleTagChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.isDisabled = this.isDisabled.bind(this)
    }

    handleTagChange(event) {
        let {selectedOptions } = event.target

        let multiple_tags = Array.from(selectedOptions, (item) => item.value)
        if (multiple_tags.includes('untagged')) {
            multiple_tags = ['untagged']
        }

        this.setState({ delete_tag_list: multiple_tags })
    }

    handleSubmit(event) {
        event.preventDefault()

        let user_tag_list = this.state.delete_tag_list
        this.props.on_delete_tags(user_tag_list)

        this.setState({ delete_tag_list: ['untagged'] })
    }

    isDisabled() {
        if (this.state.delete_tag_list.length === 1 && this.state.delete_tag_list.includes('untagged')) {
            return true
        } else {
            return false
        }
    }

    render() {
        return (
            <section id="delete-tag">
                <form onSubmit={this.handleSubmit}>
                    <div id="operation">
                        Delete Tag:
                        <select value={this.state.delete_tag_list} multiple={true} onChange={this.handleTagChange}>
                            <option key="untagged" value="untagged">(none)</option>
                            {Object.keys(this.props.all_tags).sort().filter(tag_name => tag_name !== 'untagged').map(tag_name => (
                            <option key={tag_name} value={tag_name}>{tag_name}</option>
                            ))}
                        </select>
                    </div>
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-primary" type="submit" value="Delete Tag(s)" disabled={this.isDisabled()} />
                    </section>
                </form>
            </section>
        )
    }
}

TagDelete.propTypes = {
    all_tags: PropTypes.object.isRequired,
    on_delete_tags: PropTypes.func.isRequired,
}