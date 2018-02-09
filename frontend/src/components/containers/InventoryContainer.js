import React from 'react';
import InventoryPage from '../InventoryPage';
import InventoryPageControls from '../InventoryPageControls';

const testInv = {
  inventories: [
    {
      user: 'lolik',
      bags: [
        {
          id: 1,
          name: "veshi",
          items: [
            {
              assetid: 765,
              appid: 123,
              amount: 2,
              classid: 5674562453635,
              contextid: 234,
              instanceid: 567567345634,
              isCurrency: false,
            },
            {
              assetid: 763,
              appid: 123,
              amount: 2,
              classid: 5674562453635,
              contextid: 234,
              instanceid: 567567345634,
              isCurrency: false,
            },
          ],
          itemDescription: [
            {},{}
          ],
          asap: false,
        },
      ],
    }
  ],
};

export default class InventoryContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    inventories: [],
  }

  componentDidMount() {
    this.setState({inventories: testInv.inventories});
  }
  render() {
    return(
      <div className="tab-pane fade  show active" id="nav-inventory" role="tabpanel" aria-labelledby="nav-inventory-tab">
        <div className="row justify-content-between">
          <div className="col-5">
                <InventoryPage inventories={this.props.inventories} side={"left"}/>
          </div>
          <div className="col-2 p-0 m-0">
            <InventoryPageControls />
          </div>
          <div className="col-5">
                <InventoryPage inventories={this.props.inventories} side={"right"}/>
          </div>
        </div>
      </div>
    );
  }
}
