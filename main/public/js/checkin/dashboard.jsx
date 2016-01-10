function Dashboard() {
  var self = this;

  this.data = [
    {id: 'propertyNb', title: "Anzahl Orte", value: 8},
    {id: 'incomePerHour', title: 'Einkommen pro Stunde', value: 12000},
    {id: 'asset', title: 'Vermögen', value: 232323444},
    {id: 'chancellery', title: 'Parkplatz', value: 34400},
    {id: 'lastBougthProperty', title: 'Letztes gekauftes Ort', value: 'Bern Bümpliz'}
  ];

  // Faking received data
  setInterval(function () {
    self.data[3].value++;
    console.log(self.data[3]);
    if (self.data[3].onChange) {
      self.data[3].onChange.map(function(fct) {
        fct(self.data[3]);
      });
    }
  }, 1500);
};

Dashboard.prototype.getElements = function () {
  return this.data;
};

Dashboard.prototype.getElement = function (id) {
  return _.find(this.data, {id: id});
};

Dashboard.prototype.registerUpdateHandler = function (id, handler) {
  var element = _.find(this.data, {id: id});
  if (element) {
    element.onChange = element.onChange || [];
    element.onChange.push(handler);
  }
};

var dashboard = new Dashboard();







/* A single element
 */
var DashboardElement = React.createClass({
  getInitialState: function () {
    console.log(this.props);
    return dashboard.getElement(this.props.id);
  },

  componentDidMount: function() {
    var self= this;
    dashboard.registerUpdateHandler(this.props.id, function(val) {
      self.setState(val);
    });
  },

  render: function () {
    return (
      <div className="col-md-3 col-sm-4 col-xs-6">
        <div className="ds-element">
          <p><strong>{this.state.title}</strong></p>
          <p>{this.state.value}</p>
        </div>
      </div>
    );
  }
});

/**
 * List with the elements
 */
var DashboardElementList = React.createClass({
  render: function () {

    var i        = 0;
    var controls = this.props.data.map(function (element) {
      return <DashboardElement key={element.id} id={element.id}/>
    });

    return (
      <div>{controls}</div>
    );
  }
});

/**
 * The dashboard
 */
var Dashboard = React.createClass({
  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {

    // Make all elements the same height using jquery
    var boxes     = $('.ds-element');
    var maxHeight = Math.max.apply(
      Math, boxes.map(function () {
        return $(this).height();
      }).get());
    boxes.height(maxHeight);
  },

  render: function () {
    return (
      <div className="row">
        <DashboardElementList data={this.props.data}/>
      </div>
    );
  }
});

ReactDOM.render(
  <Dashboard data={dashboard.getElements()}/>,
  document.getElementById('dashboard')
);
