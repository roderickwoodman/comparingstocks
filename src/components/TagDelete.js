import React, { useState } from 'react'
import PropTypes from 'prop-types'


export const TagDelete = (props) => {

    const [deleteTagList, setDeleteTagList] = useState(['untagged'])

    const handleTagChange = (event) => {
        let {selectedOptions } = event.target

        let multiple_tags = Array.from(selectedOptions, (item) => item.value)
        if (multiple_tags.includes('untagged')) {
            multiple_tags = ['untagged']
        }

        setDeleteTagList(multiple_tags)
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        let user_tag_list = deleteTagList
        props.on_delete_tags(user_tag_list)

        setDeleteTagList(['untagged'])
    }

    const isDisabled = () => {
        if (deleteTagList.length === 1 && deleteTagList.includes('untagged')) {
            return true
        } else {
            return false
        }
    }

    return (
        <section id="delete-tag">
            <form onSubmit={handleSubmit}>
                <div id="operation">
                    Delete Tag:
                    <select value={deleteTagList} multiple={true} onChange={handleTagChange}>
                        <option key="untagged" value="untagged">(none)</option>
                        {Object.keys(props.all_tags).sort().filter(tag_name => tag_name !== 'untagged').map(tag_name => (
                        <option key={tag_name} value={tag_name}>{tag_name}</option>
                        ))}
                    </select>
                </div>
                <section className="buttonrow">
                    <input className="btn btn-sm btn-primary" type="submit" value="Delete Tag(s)" disabled={isDisabled()} />
                </section>
            </form>
        </section>
    )
}

TagDelete.propTypes = {
    all_tags: PropTypes.object.isRequired,
    on_delete_tags: PropTypes.func.isRequired,
}