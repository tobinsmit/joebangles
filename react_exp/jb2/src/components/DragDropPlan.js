import React, { Component } from 'react';

export default class DragDropPlan extends Component {
  render() {
    return (
      <div className="container text-center" style={{maxWidth: 900 + 'px'}}>
        <p>DragDropPlan</p>

        <div className="card">
          <div className="card-header">
            <h6 className="m-0">Completed</h6>
          </div>
          <div className="card-body">
            <div id="completed" className="row mx-0 notInvalid draggable-container">
              <div id="ELEC1111" className="draggable course" data-toggle="tooltip" data-html="true" data-available-terms="[1,2]" data-original-title="Terms: 1,2<br>Prereq: none">ELEC1111</div>
            </div>
          </div>
        </div>

        <br></br>

        <br></br>
        <div className="row">
          <div className="col-sm-3">
            <div className="card">
              <div className="card-header">
                Unassigned
              </div>
              <div id="unassigned" className="card-body notInvalid draggable-container">
              </div>
            </div>
          </div>
          <div className="col-sm-9">
            <div className="card">
              <table className="table mb-0" style={{tableLayout: 'fixed'}}>
                <thead>
                  <tr className="">
                    <th scope="col" style={{width: 16 + '%'}}>Year</th>
                    <th scope="col" style={{width: 28 + '%'}}>Term 1</th>
                    <th scope="col" style={{width: 28 + '%'}}>Term 2</th>
                    <th scope="col" style={{width: 28 + '%'}}>Term 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="year" data-year="1">
                    <th scope="row">1</th>
                    <td className="p-0"><div className="draggable-container term" data-term="1"></div></td>
                    <td className="p-0"><div className="draggable-container term" data-term="2"></div></td>
                    <td className="p-0"><div className="draggable-container term" data-term="3"></div></td>
                  </tr>
                  <tr className="year" data-year="2">
                    <th scope="row">2</th>
                    <td className="p-0"><div className="draggable-container term" data-term="1"></div></td>
                    <td className="p-0"><div className="draggable-container term" data-term="2"></div></td>
                    <td className="p-0"><div className="draggable-container term" data-term="3"></div></td>
                  </tr>
                  <tr className="year" data-year="3">
                    <th scope="row">3</th>
                    <td className="p-0"><div className="draggable-container term" data-term="1"></div></td>
                    <td className="p-0"><div className="draggable-container term" data-term="2"></div></td>
                    <td className="p-0"><div className="draggable-container term" data-term="3"></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    );
  }
}
