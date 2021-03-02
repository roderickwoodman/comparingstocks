import React, { useState } from 'react'
import PropTypes from 'prop-types'


export const TagDelete = (props) => {

    const [deleteTagList, setDeleteTagList] = useState(['untagged'])

    const handleTagChange = (event) => {
        let {selectedOptions } = event.target

        let multipleTags = Array.from(selectedOptions, (item) => item.value)
        if (multipleTags.includes('untagged')) {
            multipleTags = ['untagged']
        }

        setDeleteTagList(multipleTags)
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        let userTagList = deleteTagList
        props.onDeleteTags(userTagList)

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
                        {Object.keys(props.allTags).sort().filter(tagName => tagName !== 'untagged').map(tagName => (
                        <option key={tagName} value={tagName}>{tagName}</option>
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
    allTags: PropTypes.object.isRequired,
    onDeleteTags: PropTypes.func.isRequired,
}