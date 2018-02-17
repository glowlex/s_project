import React from 'react';

class InventoryPageSearch extends React.Component {
  static defaultProps = {
    user: ""
  }

  static propTypes = {
    partNo: React.propTypes.string.isRequired,
    user: React.propTypes.string.isRequired
  }

  constructor(props){
    super(props);
  }

  render() {
    return (
      <div className="w-100">
        <ul className={"nav bag-search row px-1 mt-1 " + (this.props.partNo === "R" && "bag-search_right")}>
          <li className="nav-item">
            <label className="h3" htmlFor="money">567 ₽</label>
          </li>
          <li className="nav-item w-50">
            <div className="input-group-sm w-100">
              <input type="text" className="form-control search" placeholder="search"/>
            </div>
          </li>
        </ul>
      </div>
    );
  }
}

export default InventoryPageSearch;
