var inherits = require('util').inherits;

function EnergyService(Service) {

    this.EnergySer = function() {
        Service.call(this, 'Energy', '00000001-0000-1777-8000-775D67EC4377');
        this.addCharacteristic(CurrentConsumption1);
        this.addCharacteristic(TotalConsumption1);
    };

    inherits(this.EnergySer, Service);
    return this;
}

module.exports.EnergyService = EnergyService;
