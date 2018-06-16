import React from 'react';
import PropTypes from 'prop-types';
import store from '../../index';
import {updateInventoryBagPage} from '../../actions/inventoryActions';

export default class InventoryPagePagination extends React.Component {
  static propTypes = {
    items: PropTypes.number,
    pageSelected: PropTypes.number,
    partNo: PropTypes.string.isRequired
  };
  static defaultProps = {
    items: 0,
    pageSelected: 0
  };
  constructor(props) {
    super(props);
  }

  _changePage = (e, v) => {
    e.preventDefault();
    store.dispatch(updateInventoryBagPage(v, this.props.partNo));
  }

  nextPage = (e, v=10) => {
    this._changePage(e, v);
  }

  prevPage = (e, v=-10) => {
    this._changePage(e, v);
  }

  render() {
    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-end row">
          <li className="page-item">
            <button type="button" className="btn page-link btn_blue btn-secondary btn-sm" aria-label="Previous" onClick={this.prevPage}>
              <span className="glyphicon glyphicon-menu-left" aria-hidden="true"/>
            </button>
          </li>
          <li className="page-item bag__pagination__count">
            <span className="page-link btn_blue btn-sm bag__pagination__page" >{this.props.pageSelected+1}</span>
          </li>
          <li className="page-item">
            <button type="button" className="btn page-link btn_blue btn-secondary btn-sm" aria-label="Previous" onClick={this.nextPage}>
              <span className="glyphicon glyphicon-menu-right" aria-hidden="true"/>
            </button>
          </li>
        </ul>
      </nav>
    );
  }
}
