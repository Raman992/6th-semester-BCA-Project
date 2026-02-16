import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {
    return (
        <div className='search'>
            <div>
                <input type="text" placeholder='Seek your pleasant movies' value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value)}}  />
                <i className='fa fa-search'></i>                
            </div>
        </div>
    )
}

export default Search
