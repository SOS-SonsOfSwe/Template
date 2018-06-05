import React from 'react';

var arrayData = [
    { year: "2018" },
]

const Row = ({ year }) => (
    <div>
        <p>Acaddemic year: {year}</p>
    </div>
);

class DeleteAcademicYear extends React.Component {

    render() {
        const rows = arrayData.map((rowData, index) => <Row key={index} {...rowData} />);

        return (
            <main className='container'>
                <div className="pure-u-1-1">
                    <h1>Delete academic year</h1>
                    <p>Are you sure you want to delete this academic year? Once you canceled it, you can't go back.</p>
                    <form className="pure-form pure-form-stacked">
                        <fieldset>
                            {rows}
                            <button>Delete</button>
                            <button>Cancel</button>
                        </fieldset>
                    </form>
                </div>
            </main>
        )
    }
}

export default DeleteAcademicYear;